import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConversationList from '@/components/shared/ConversationList';
import { IConversation, IMessage } from '@/types';

// Mock the socket context
jest.mock('@/context/SocketContext', () => ({
    useSocket: () => ({
        onlineUsers: ['user1', 'user3'],
        notificationCount: { user2: 2, user3: 0 },
        latestMessages: {},
        clearNotifications: jest.fn(),
        typingUsers: {}
    })
}));

// Mock the OnlineStatusIndicator component since it makes external calls
jest.mock('@/components/shared/OnlineStatusIndicator', () => ({
    __esModule: true,
    default: ({ userId }: { userId: string }) => (
        <div data-testid={`online-indicator-${userId}`} className="h-3 w-3 rounded-full"></div>
    )
}));

describe('ConversationList Component', () => {
    const mockOnSelectConversation = jest.fn();

    // Create properly typed mock conversations
    const createMockConversations = (): IConversation[] => {
        const mockMessage1: IMessage = {
            $id: 'msg1',
            content: 'Hello there',
            createdAt: '2023-07-10T12:00:00.000Z',
            sender: { $id: 'user1' },
            receiver: { $id: 'currentUser' },
            isRead: false
        };

        const mockMessage2: IMessage = {
            $id: 'msg2',
            content: 'How are you doing?',
            createdAt: '2023-07-09T14:00:00.000Z',
            sender: { $id: 'currentUser' },
            receiver: { $id: 'user2' },
            isRead: true
        };

        return [
            {
                user: {
                    $id: 'user1',
                    name: 'User One',
                    username: 'userone',
                    imageUrl: '/user1.jpg'
                },
                lastMessage: mockMessage1,
                unreadCount: 0
            },
            {
                user: {
                    $id: 'user2',
                    name: 'User Two',
                    username: 'usertwo',
                    imageUrl: '/user2.jpg'
                },
                lastMessage: mockMessage2,
                unreadCount: 2
            }
        ];
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders message when no conversations exist', () => {
        render(
            <ConversationList
                conversations={[]}
                onSelectConversation={mockOnSelectConversation}
                currentUserId="currentUser"
            />
        );

        expect(screen.getByText('No conversations yet')).toBeInTheDocument();
    });

    it('renders a list of conversations', () => {
        const mockConversations = createMockConversations();

        render(
            <ConversationList
                conversations={mockConversations}
                onSelectConversation={mockOnSelectConversation}
                currentUserId="currentUser"
            />
        );

        // Check if user names are displayed
        expect(screen.getByText('User One')).toBeInTheDocument();
        expect(screen.getByText('User Two')).toBeInTheDocument();

        // Check if messages are displayed with correct prefixes
        expect(screen.getByText('Hello there')).toBeInTheDocument();
        expect(screen.getByText('You: How are you doing?')).toBeInTheDocument();
    });

    it('calls onSelectConversation when a conversation is clicked', () => {
        const mockConversations = createMockConversations();

        render(
            <ConversationList
                conversations={mockConversations}
                onSelectConversation={mockOnSelectConversation}
                currentUserId="currentUser"
            />
        );

        // Click on the first conversation
        const userOneElement = screen.getByText('User One');
        const conversationDiv = userOneElement.closest('div')?.parentElement;

        if (conversationDiv) {
            fireEvent.click(conversationDiv);

            // Check if the onSelectConversation callback was called with the correct user
            expect(mockOnSelectConversation).toHaveBeenCalledWith(mockConversations[0].user);
        } else {
            throw new Error('Could not find conversation element to click');
        }
    });

    it('shows unread message count indicator', () => {
        const mockConversations = createMockConversations();

        render(
            <ConversationList
                conversations={mockConversations}
                onSelectConversation={mockOnSelectConversation}
                currentUserId="currentUser"
            />
        );

        // Find all elements with number text (could include timestamp text)
        const numberElements = screen.getAllByText(/\d+/);

        // Look for the element that contains just "4" (2 unread + 2 notifications)
        const unreadIndicator = numberElements.find(el => el.textContent === '4');
        expect(unreadIndicator).toBeInTheDocument();

        // The indicator should be in a container with a background color
        const bgElement = unreadIndicator?.closest('div[class*="bg-primary-500"]');
        expect(bgElement).toBeInTheDocument();
    });

    it('displays time ago for messages', () => {
        const mockConversations = createMockConversations();

        render(
            <ConversationList
                conversations={mockConversations}
                onSelectConversation={mockOnSelectConversation}
                currentUserId="currentUser"
            />
        );

        // We can't directly test the formatted time string because it's dynamic
        // But we can check that some time indicator elements exist
        const timeElements = screen.getAllByText(/ago/i);
        expect(timeElements.length).toBeGreaterThan(0);
    });

    it('handles truncation of long message content', () => {
        const longMessage = {
            $id: 'msg3',
            content: 'This is a very long message that should be truncated because it exceeds the character limit',
            createdAt: '2023-07-10T12:00:00.000Z',
            sender: { $id: 'user3' },
            receiver: { $id: 'currentUser' },
            isRead: false
        };

        const longMessageConversation: IConversation[] = [
            {
                user: {
                    $id: 'user3',
                    name: 'User Three',
                    username: 'userthree',
                    imageUrl: '/user3.jpg'
                },
                lastMessage: longMessage,
                unreadCount: 0
            }
        ];

        render(
            <ConversationList
                conversations={longMessageConversation}
                onSelectConversation={mockOnSelectConversation}
                currentUserId="currentUser"
            />
        );

        // The message should be truncated (not showing the full content)
        const fullMessage = 'This is a very long message that should be truncated because it exceeds the character limit';
        const messageElement = screen.queryByText(fullMessage);
        expect(messageElement).not.toBeInTheDocument();

        // Instead, a truncated version should be shown - it should contain the start of the message
        const truncatedMessage = screen.getByText(/This is a very long message/);
        expect(truncatedMessage).toBeInTheDocument();
        expect(truncatedMessage.textContent?.length).toBeLessThan(fullMessage.length);
    });

    it('shows online status indicator for online users', () => {
        const mockConversations = createMockConversations();

        render(
            <ConversationList
                conversations={mockConversations}
                onSelectConversation={mockOnSelectConversation}
                currentUserId="currentUser"
            />
        );

        // User1 is online according to our mock
        const onlineIndicator = screen.getByTestId('online-indicator-user1');
        expect(onlineIndicator).toBeInTheDocument();
    });

    it('highlights the selected conversation', () => {
        const mockConversations = createMockConversations();

        render(
            <ConversationList
                conversations={mockConversations}
                selectedId="user1"
                onSelectConversation={mockOnSelectConversation}
                currentUserId="currentUser"
            />
        );

        // Find the user names
        const userOneElement = screen.getByText('User One');
        const userTwoElement = screen.getByText('User Two');

        // Find their conversation containers
        const userOneConversation = userOneElement.closest('div')?.parentElement;
        const userTwoConversation = userTwoElement.closest('div')?.parentElement;

        if (userOneConversation && userTwoConversation) {
            // Check if User One's conversation has the selected class
            expect(userOneConversation).toHaveClass('bg-dark-3');

            // Check if User Two's conversation doesn't have the selected class
            expect(userTwoConversation).not.toHaveClass('bg-dark-3');
        } else {
            throw new Error('Could not find conversation elements');
        }
    });

    it('clears notifications when selecting a conversation with notifications', () => {
        const mockConversations = createMockConversations();
        const { clearNotifications } = require('@/context/SocketContext').useSocket();

        render(
            <ConversationList
                conversations={mockConversations}
                onSelectConversation={mockOnSelectConversation}
                currentUserId="currentUser"
            />
        );

        // Click on the second conversation (User Two) which has notifications
        const userTwoElement = screen.getByText('User Two');
        const conversationDiv = userTwoElement.closest('div')?.parentElement;

        if (conversationDiv) {
            fireEvent.click(conversationDiv);

            // Check if clearNotifications was called for user2
            expect(clearNotifications).toHaveBeenCalledWith('user2');
        } else {
            throw new Error('Could not find conversation element to click');
        }
    });
});