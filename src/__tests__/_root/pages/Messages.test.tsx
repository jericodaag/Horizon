import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Messages from '@/_root/pages/Messages';
import { mockGetUserConversations, mockGetUsers, mockGetConversation } from '@/__tests__/__mocks__/api';
import { mockLocation } from '@/__tests__/__mocks__/router';

// Mock QueryClient
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQueryClient: () => ({
    prefetchQuery: jest.fn(),
    invalidateQueries: jest.fn()
  })
}));

describe('Messages Component', () => {
  const mockConversations = [
    {
      user: {
        $id: 'user2',
        name: 'Test User 2',
        username: 'testuser2',
        imageUrl: 'https://example.com/avatar2.jpg',
      },
      lastMessage: {
        $id: 'msg1',
        content: 'Hello',
        createdAt: '2023-01-01T12:00:00.000Z',
        sender: { $id: 'user2' },
        receiver: { $id: 'user1' },
        isRead: false,
      },
      unreadCount: 1,
    },
    {
      user: {
        $id: 'user3',
        name: 'Test User 3',
        username: 'testuser3',
        imageUrl: 'https://example.com/avatar3.jpg',
      },
      lastMessage: {
        $id: 'msg2',
        content: 'How are you?',
        createdAt: '2023-01-02T12:00:00.000Z',
        sender: { $id: 'user1' },
        receiver: { $id: 'user3' },
        isRead: true,
      },
      unreadCount: 0,
    },
  ];

  const mockUsers = {
    documents: [
      {
        $id: 'user1',
        name: 'Test User',
        username: 'testuser',
        imageUrl: 'https://example.com/avatar.jpg',
      },
      {
        $id: 'user2',
        name: 'Test User 2',
        username: 'testuser2',
        imageUrl: 'https://example.com/avatar2.jpg',
      },
      {
        $id: 'user3',
        name: 'Test User 3',
        username: 'testuser3',
        imageUrl: 'https://example.com/avatar3.jpg',
      },
    ],
  };

  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset location state
    mockLocation.state = null;

    // Set default mock return values
    mockGetUserConversations.mockReturnValue(mockConversations);
    mockGetUsers.mockReturnValue({ data: mockUsers, isLoading: false });
    mockGetConversation.mockReturnValue({
      documents: [
        {
          $id: 'msg1',
          content: 'Hello there',
          createdAt: new Date().toISOString(),
          sender: { $id: 'user2' },
          receiver: { $id: 'user123' },
          isRead: false
        }
      ]
    });
  });

  it('renders the messages page with title', () => {
    render(<Messages />);
    expect(screen.getByText('Messages')).toBeInTheDocument();
  });

  it('shows loading state when fetching conversations', () => {
    // Override the default mock to return loading state
    mockGetUserConversations.mockReturnValue(undefined);

    // Use Jest's spyOn to override the React Query hook
    jest.spyOn(require('@/lib/react-query/queries'), 'useGetUserConversations')
      .mockReturnValue({
        data: undefined,
        isLoading: true
      });

    render(<Messages />);

    // Check for loader component
    expect(screen.getByTestId('lucide-loader')).toBeInTheDocument();
  });

  it('renders conversation list when data is loaded', () => {
    // Override the hook with our test data
    jest.spyOn(require('@/lib/react-query/queries'), 'useGetUserConversations')
      .mockReturnValue({
        data: mockConversations,
        isLoading: false
      });

    render(<Messages />);

    // Check for conversation list and items
    expect(screen.getByTestId('conversation-list')).toBeInTheDocument();
    expect(screen.getByTestId('conversation-user2')).toBeInTheDocument();
    expect(screen.getByTestId('conversation-user3')).toBeInTheDocument();
  });

  it('shows empty state when no conversations', () => {
    // Override to return empty array
    jest.spyOn(require('@/lib/react-query/queries'), 'useGetUserConversations')
      .mockReturnValue({
        data: [],
        isLoading: false
      });

    render(<Messages />);

    // Check for empty state message
    expect(screen.getByTestId('no-conversations')).toBeInTheDocument();
  });

  it('shows message chat when conversation is selected', async () => {
    // Set up conversation data
    jest.spyOn(require('@/lib/react-query/queries'), 'useGetUserConversations')
      .mockReturnValue({
        data: mockConversations,
        isLoading: false
      });

    render(<Messages />);

    // Click on a conversation
    const conversationBtn = screen.getByTestId('conversation-user2');
    fireEvent.click(conversationBtn);

    // Check that message chat is shown
    await waitFor(() => {
      expect(screen.getByTestId('message-chat')).toBeInTheDocument();
      expect(screen.getByTestId('conversation-name')).toHaveTextContent('Test User 2');
    });
  });

  it('returns to conversation list on back button click', async () => {
    // Override window width to simulate mobile view
    global.innerWidth = 500;
    global.dispatchEvent(new Event('resize'));

    // Set up conversation data
    jest.spyOn(require('@/lib/react-query/queries'), 'useGetUserConversations')
      .mockReturnValue({
        data: mockConversations,
        isLoading: false
      });

    render(<Messages />);

    // Select a conversation first
    const conversationBtn = screen.getByTestId('conversation-user2');
    fireEvent.click(conversationBtn);

    // Verify message chat is visible
    await waitFor(() => {
      expect(screen.getByTestId('message-chat')).toBeInTheDocument();
    });

    // Click back button
    const backButton = screen.getByTestId('back-button');
    fireEvent.click(backButton);

    // Verify conversation list is visible again
    await waitFor(() => {
      // Make sure the conversation list is not hidden
      const conversationList = screen.getByTestId('conversation-list').closest('.conversation-list');
      expect(conversationList).not.toHaveClass('hidden');
    });
  });

  it('opens new message dialog when new message button is clicked', () => {
    render(<Messages />);

    // Click the new message button (using aria-label)
    const newMessageButton = screen.getByLabelText('New message');
    fireEvent.click(newMessageButton);

    // Check that dialog is shown
    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-title')).toHaveTextContent('New Message');
  });

  it('filters users in new message dialog based on search query', async () => {
    // Set up users data
    jest.spyOn(require('@/lib/react-query/queries'), 'useGetUsers')
      .mockReturnValue({
        data: mockUsers,
        isLoading: false
      });

    render(<Messages />);

    // Open dialog
    const newMessageButton = screen.getByLabelText('New message');
    fireEvent.click(newMessageButton);

    // Wait for dialog to open
    await waitFor(() => {
      expect(screen.getByTestId('dialog')).toBeInTheDocument();
    });

    // Type search query
    const searchInput = screen.getByPlaceholderText('Search users...');
    expect(searchInput).toBeInTheDocument();

    // Set search value
    fireEvent.change(searchInput, { target: { value: 'testuser2' } });

    // Check search input value
    expect(searchInput).toHaveValue('testuser2');
  });

  it('handles initial conversation from location state', async () => {
    // Set up initial conversation in location state
    const initialConversation = {
      $id: 'user4',
      id: 'user4',
      name: 'Initial User',
      username: 'initialuser',
      imageUrl: 'https://example.com/avatar4.jpg',
    };

    mockLocation.state = { initialConversation };

    render(<Messages />);

    // Should directly open message chat with initial user
    await waitFor(() => {
      expect(screen.getByTestId('message-chat')).toBeInTheDocument();
      expect(screen.getByTestId('conversation-name')).toHaveTextContent('Initial User');
    });
  });
});