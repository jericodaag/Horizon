import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Messages from '@/_root/pages/Messages';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a QueryClient for testing
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            gcTime: 0,
        },
    },
});

// Mock data
const mockUser = { id: 'user-1', name: 'Test User' };

const mockConversations = [
    {
        user: {
            $id: 'user-2',
            name: 'John Doe',
            username: 'johndoe',
            imageUrl: '/avatar1.jpg'
        },
        lastMessage: {
            content: 'Hello there!',
            createdAt: new Date().toISOString(),
            sender: { $id: 'user-2' },
            receiver: { $id: 'user-1' },
            isRead: false
        },
        unreadCount: 2
    },
    {
        user: {
            $id: 'user-3',
            name: 'Jane Smith',
            username: 'janesmith',
            imageUrl: '/avatar2.jpg'
        },
        lastMessage: {
            content: 'How are you?',
            createdAt: new Date().toISOString(),
            sender: { $id: 'user-1' },
            receiver: { $id: 'user-3' },
            isRead: true
        },
        unreadCount: 0
    }
];

// Mock all required dependencies
jest.mock('@/context/AuthContext', () => ({
    useUserContext: () => ({
        user: mockUser,
        isLoading: false,
        isAuthenticated: true
    })
}));

jest.mock('@/context/SocketContext', () => ({
    useSocket: () => ({
        socket: null,
        onlineUsers: ['user-2'],
        isConnected: false,
        notificationCount: { 'user-2': 2 },
        clearNotifications: jest.fn(),
        latestMessages: {},
        trackSentMessage: jest.fn(),
        typingUsers: {},
        setTyping: jest.fn(),
        readReceipts: {},
        markMessageAsRead: jest.fn()
    })
}));

jest.mock('@/lib/react-query/queries', () => {
    const original = jest.requireActual('@/lib/react-query/queries');
    return {
        ...original,
        useGetUserConversations: () => ({
            data: mockConversations,
            isLoading: false
        }),
        useGetUsers: () => ({
            data: {
                documents: [
                    { $id: 'user-2', name: 'John Doe', username: 'johndoe' },
                    { $id: 'user-3', name: 'Jane Smith', username: 'janesmith' }
                ]
            },
            isLoading: false
        }),
        useGetConversation: () => ({
            data: { documents: [] },
            isLoading: false
        })
    };
});

// Mock components with functional implementations that capture real interactions
jest.mock('@/components/shared/ConversationList', () => ({
    __esModule: true,
    default: ({ conversations, onSelectConversation }) => (
        <div data-testid="conversation-list">
            {conversations.map(conv => (
                <button
                    key={conv.user.$id}
                    data-testid={`conversation-${conv.user.$id}`}
                    onClick={() => onSelectConversation(conv.user)}
                >
                    {conv.user.name}
                </button>
            ))}
        </div>
    )
}));

jest.mock('@/components/shared/MessageChat', () => ({
    __esModule: true,
    default: ({ conversation, onBack }) => (
        <div data-testid="message-chat">
            <h4>{conversation.name}</h4>
            <button data-testid="back-button" onClick={onBack}>Back</button>
        </div>
    )
}));

// Other required mocks
jest.mock('@/hooks/useMessagingRealtime', () => ({
    __esModule: true,
    useMessagingRealtime: jest.fn()
}));

jest.mock('@/components/shared/OnlineStatusIndicator', () => ({
    __esModule: true,
    default: () => <div>●</div>
}));

jest.mock('react-router-dom', () => ({
    useLocation: () => ({ pathname: '/messages', state: null }),
}));

jest.mock('lucide-react', () => ({
    Loader: () => <div data-testid="loader">Loading...</div>,
    PlusCircle: () => <span>+</span>,
    Search: () => <span>🔍</span>,
    ArrowLeft: () => <span>←</span>
}));

jest.mock('@/components/ui/dialog', () => ({
    Dialog: ({ children, open }) => open ? <div data-testid="dialog">{children}</div> : null,
    DialogContent: ({ children }) => <div>{children}</div>,
    DialogHeader: ({ children }) => <div>{children}</div>,
    DialogTitle: ({ children }) => <div>{children}</div>
}));

jest.mock('@/components/ui/input', () => ({
    Input: props => <input data-testid="search-input" {...props} />
}));

jest.mock('@/components/ui/button', () => ({
    Button: ({ children, onClick }) => (
        <button data-testid="button" onClick={onClick}>{children}</button>
    )
}));

describe('Messages Component - Functional Tests', () => {
    const renderMessages = () => {
        return render(
            <QueryClientProvider client={queryClient}>
                <Messages />
            </QueryClientProvider>
        );
    };

    it('displays the message header and conversation list', () => {
        renderMessages();

        // Verify primary UI elements are present
        expect(screen.getByText('Messages')).toBeInTheDocument();
        expect(screen.getByTestId('conversation-list')).toBeInTheDocument();
    });

    it('shows loading state when conversations are loading', () => {
        // Override the mock for this test
        jest.spyOn(require('@/lib/react-query/queries'), 'useGetUserConversations').mockReturnValueOnce({
            data: null,
            isLoading: true
        });

        renderMessages();
        expect(screen.getByTestId('loader')).toBeInTheDocument();
    });

    it('displays conversation items from the fetched data', () => {
        renderMessages();

        // Verify conversation items are rendered
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('allows selecting a conversation to start chatting', async () => {
        renderMessages();

        // Click on a conversation
        fireEvent.click(screen.getByText('John Doe'));

        // Verify the message chat appears
        await waitFor(() => {
            expect(screen.getByTestId('message-chat')).toBeInTheDocument();
        });
    });

    it('shows empty state when there are no conversations', () => {
        // Override the mock for this test
        jest.spyOn(require('@/lib/react-query/queries'), 'useGetUserConversations').mockReturnValueOnce({
            data: [],
            isLoading: false
        });

        renderMessages();

        // Look for the empty state message
        expect(screen.getByText(/Select a conversation or start a new one/i)).toBeInTheDocument();
    });
});