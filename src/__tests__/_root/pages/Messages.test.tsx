import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Messages from '@/_root/pages/Messages';

// Import specific mocks we need
import {
  mockGetUserConversations,
  mockGetUsers,
} from '@/__tests__/__mocks__/api';

// Mock the useQueryClient hooks from react-query
jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    prefetchQuery: jest.fn(),
  }),
}));

// Mock the useLocation hook to test both with and without initialConversation
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    pathname: '/messages',
    state: null, // Default to no initialConversation
  }),
}));

// Mock the Dialog component from shadcn/ui
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }) =>
    open ? <div data-testid='dialog'>{children}</div> : null,
  DialogContent: ({ children, className }) => (
    <div data-testid='dialog-content' className={className}>
      {children}
    </div>
  ),
  DialogHeader: ({ children }) => (
    <div data-testid='dialog-header'>{children}</div>
  ),
  DialogTitle: ({ children }) => (
    <div data-testid='dialog-title'>{children}</div>
  ),
}));

// Mock the Input component
jest.mock('@/components/ui/input', () => ({
  Input: ({ type, placeholder, value, onChange, className }) => (
    <input
      data-testid={`input-${type || 'text'}`}
      type={type || 'text'}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={className}
    />
  ),
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Loader: () => <div data-testid='lucide-loader'>Loading...</div>,
  PlusCircle: () => <div data-testid='plus-icon'>+</div>,
  Search: () => <div data-testid='search-icon'>🔍</div>,
}));

// Mock the auth context to provide the current user
jest.mock('@/context/AuthContext', () => ({
  useUserContext: () => ({
    user: {
      id: 'currentuser123',
      name: 'Current User',
      username: 'currentuser',
      email: 'current@example.com',
      imageUrl: '/avatar.jpg',
    },
    isLoading: false,
    isAuthenticated: true,
  }),
}));

// Mock the components that the Messages component uses
jest.mock('@/components/shared/ConversationList', () => ({
  __esModule: true,
  default: ({
    conversations,
    onSelectConversation,
    selectedId,
    currentUserId,
  }) => (
    <div
      data-testid='conversation-list'
      data-selected-id={selectedId}
      data-current-user-id={currentUserId}
    >
      {conversations && conversations.length > 0 ? (
        conversations.map((conversation) => (
          <div
            key={conversation.user.id}
            data-testid={`conversation-${conversation.user.id}`}
            onClick={() => onSelectConversation(conversation.user)}
            className={selectedId === conversation.user.id ? 'selected' : ''}
          >
            {conversation.user.name}
          </div>
        ))
      ) : (
        <div data-testid='no-conversations'>No conversations yet</div>
      )}
    </div>
  ),
}));

jest.mock('@/components/shared/MessageChat', () => ({
  __esModule: true,
  default: ({ conversation, currentUserId, onBack }) => (
    <div
      data-testid='message-chat'
      data-user-id={conversation.id}
      data-current-user-id={currentUserId}
    >
      <button data-testid='back-button' onClick={onBack}>
        Back
      </button>
      <div data-testid='conversation-name'>{conversation.name}</div>
    </div>
  ),
}));

describe('Messages Component', () => {
  // Sample conversation data
  const mockConversations = [
    {
      user: {
        id: 'user1',
        $id: 'user1',
        name: 'User One',
        username: 'userone',
        imageUrl: '/user1.jpg',
      },
      lastMessage: {
        text: 'Hello there!',
        createdAt: '2023-05-15T10:30:00.000Z',
      },
      unreadCount: 0,
    },
    {
      user: {
        id: 'user2',
        $id: 'user2',
        name: 'User Two',
        username: 'usertwo',
        imageUrl: '/user2.jpg',
      },
      lastMessage: {
        text: 'How are you?',
        createdAt: '2023-05-14T15:45:00.000Z',
      },
      unreadCount: 2,
    },
  ];

  // Sample users data for the new chat dialog
  const mockAllUsers = {
    documents: [
      {
        $id: 'currentuser123',
        name: 'Current User',
        username: 'currentuser',
        imageUrl: '/avatar.jpg',
      },
      {
        $id: 'user1',
        name: 'User One',
        username: 'userone',
        imageUrl: '/user1.jpg',
      },
      {
        $id: 'user2',
        name: 'User Two',
        username: 'usertwo',
        imageUrl: '/user2.jpg',
      },
      {
        $id: 'user3',
        name: 'User Three',
        username: 'userthree',
        imageUrl: '/user3.jpg',
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Configure default mock implementations
    mockGetUserConversations.mockReturnValue({
      data: mockConversations,
      isLoading: false,
    });

    mockGetUsers.mockReturnValue({
      data: mockAllUsers,
      isLoading: false,
    });
  });

  it('renders the messages page with header', () => {
    render(<Messages />);
    expect(screen.getByText('Messages')).toBeInTheDocument();
  });

  it('shows loading state while fetching conversations', () => {
    // Override the mock to return loading state
    mockGetUserConversations.mockReturnValue({
      data: null,
      isLoading: true,
    });

    render(<Messages />);

    expect(screen.getByText('Conversations')).toBeInTheDocument();
    expect(screen.getByTestId('lucide-loader')).toBeInTheDocument();
  });

  it('renders conversation list when data is loaded', () => {
    render(<Messages />);

    expect(screen.getByTestId('conversation-list')).toBeInTheDocument();
    expect(screen.getByTestId('conversation-user1')).toBeInTheDocument();
    expect(screen.getByTestId('conversation-user2')).toBeInTheDocument();
  });

  it('displays empty state message when no conversations exist', () => {
    // Override the mock to return empty conversations
    mockGetUserConversations.mockReturnValue({
      data: [],
      isLoading: false,
    });

    render(<Messages />);

    expect(screen.getByTestId('no-conversations')).toBeInTheDocument();
    expect(
      screen.getByText('Select a conversation or start a new one')
    ).toBeInTheDocument();
  });

  it('opens new chat dialog when new message button is clicked', () => {
    render(<Messages />);

    // Click the new message button (using the button that contains PlusCircle)
    const newMessageButtons = screen.getAllByRole('button');
    const newChatButton = newMessageButtons.find(
      (button) =>
        button.innerHTML.includes('plus-icon') ||
        button.textContent?.includes('+')
    );

    if (newChatButton) {
      fireEvent.click(newChatButton);
    } else {
      throw new Error('New chat button not found');
    }

    // Dialog should appear
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-title')).toHaveTextContent('New Message');
  });

  it('filters users in the new chat dialog when searching', () => {
    render(<Messages />);

    // Open the new chat dialog
    const newMessageButtons = screen.getAllByRole('button');
    const newChatButton = newMessageButtons.find(
      (button) =>
        button.innerHTML.includes('plus-icon') ||
        button.textContent?.includes('+')
    );

    if (newChatButton) {
      fireEvent.click(newChatButton);
    }

    // Type in the search box
    const searchInput = screen.getByTestId('input-text');
    fireEvent.change(searchInput, { target: { value: 'three' } });

    // Wait for the filtered list to update
    const userDivs = screen
      .getAllByRole('button')
      .filter((el) => el.textContent?.includes('User'));

    // Should only show User Three
    expect(userDivs.length).toBe(1);
    expect(userDivs[0].textContent).toContain('User Three');
  });

  it('selects a conversation when clicked', () => {
    render(<Messages />);

    // Click on a conversation
    fireEvent.click(screen.getByTestId('conversation-user1'));

    // Check that the message chat is shown with the correct user
    expect(screen.getByTestId('message-chat')).toBeInTheDocument();
    expect(screen.getByTestId('message-chat')).toHaveAttribute(
      'data-user-id',
      'user1'
    );
    expect(screen.getByTestId('conversation-name')).toHaveTextContent(
      'User One'
    );
  });

  it('selects a user from new chat dialog', () => {
    render(<Messages />);

    // Open the new chat dialog
    const newMessageButtons = screen.getAllByRole('button');
    const newChatButton = newMessageButtons.find(
      (button) =>
        button.innerHTML.includes('plus-icon') ||
        button.textContent?.includes('+')
    );

    if (newChatButton) {
      fireEvent.click(newChatButton);
    }

    // After dialog opens, find all user buttons
    const userButtons = screen
      .getAllByRole('button')
      .filter((btn) => btn.textContent?.includes('User Three'));

    // Click on User Three
    if (userButtons.length > 0) {
      fireEvent.click(userButtons[0]);
    }

    // Dialog should close and chat should be opened
    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
    expect(screen.getByTestId('message-chat')).toBeInTheDocument();
  });

  it('displays a message chat with initialConversation from location state', () => {
    // Override useLocation to include initialConversation
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue({
      pathname: '/messages',
      state: {
        initialConversation: {
          $id: 'user3',
          name: 'User Three',
          username: 'userthree',
          imageUrl: '/user3.jpg',
        },
      },
    });

    render(<Messages />);

    // Should immediately show the message chat with User Three
    expect(screen.getByTestId('message-chat')).toBeInTheDocument();
    expect(screen.getByTestId('message-chat')).toHaveAttribute(
      'data-user-id',
      'user3'
    );
    expect(screen.getByTestId('conversation-name')).toHaveTextContent(
      'User Three'
    );
  });

  it('goes back to conversation list in mobile view', () => {
    // Set up window width for mobile view
    global.innerWidth = 500;
    global.dispatchEvent(new Event('resize'));

    render(<Messages />);

    // Select a conversation
    fireEvent.click(screen.getByTestId('conversation-user1'));

    // Message chat should be visible
    expect(screen.getByTestId('message-chat')).toBeInTheDocument();

    // Click back button
    fireEvent.click(screen.getByTestId('back-button'));

    // Conversation list should be visible again
    expect(screen.getByTestId('conversation-list')).toBeInTheDocument();
  });

  it('shows loading state for users in new chat dialog', () => {
    // Override the mock to return loading state for users
    mockGetUsers.mockReturnValue({
      data: null,
      isLoading: true,
    });

    render(<Messages />);

    // Open the new chat dialog
    const newMessageButtons = screen.getAllByRole('button');
    const newChatButton = newMessageButtons.find(
      (button) =>
        button.innerHTML.includes('plus-icon') ||
        button.textContent?.includes('+')
    );

    if (newChatButton) {
      fireEvent.click(newChatButton);
    }

    // Should show loader while fetching users
    const loaders = screen.getAllByTestId('lucide-loader');
    expect(loaders.length).toBeGreaterThan(0);
  });

  it('shows empty state when no users match search query', () => {
    render(<Messages />);

    // Open the new chat dialog
    const newMessageButtons = screen.getAllByRole('button');
    const newChatButton = newMessageButtons.find(
      (button) =>
        button.innerHTML.includes('plus-icon') ||
        button.textContent?.includes('+')
    );

    if (newChatButton) {
      fireEvent.click(newChatButton);
    }

    // Type a search query that won't match any users
    const searchInput = screen.getByTestId('input-text');
    fireEvent.change(searchInput, { target: { value: 'nonexistentuser' } });

    // Should show no users found message
    expect(screen.getByText('No users found')).toBeInTheDocument();
  });
});
