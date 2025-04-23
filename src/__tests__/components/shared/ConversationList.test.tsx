import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConversationList from '@/components/shared/ConversationList';
import { useSocket } from '@/context/SocketContext';
import { IConversation } from '@/types';

jest.unmock('@/components/shared/ConversationList');

jest.mock('@/context/SocketContext', () => ({
  useSocket: jest.fn()
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ placeholder, value, onChange, className }) => (
    <input
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={className}
      data-testid="search-input"
    />
  )
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, className, title }) => (
    <button
      onClick={onClick}
      className={className}
      data-testid={`button-${variant || 'default'}`}
      title={title}
    >
      {children}
    </button>
  )
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, onClick }) => (
      <div className={className} onClick={onClick}>
        {children}
      </div>
    )
  }
}));

jest.mock('@/components/shared/OnlineStatusIndicator', () => ({
  __esModule: true,
  default: ({ userId }) => <div data-testid={`online-status-${userId}`}>⚪</div>
}));

jest.mock('lucide-react', () => ({
  Search: () => <div data-testid="search-icon">🔍</div>,
  FilterX: () => <div data-testid="filter-x-icon">❌</div>,
  Check: () => <div data-testid="check-icon">✓</div>,
  Users: () => <div data-testid="users-icon">👥</div>,
  MessageSquare: () => <div data-testid="message-square-icon">💬</div>
}));

describe('ConversationList Component', () => {
  const mockConversations: IConversation[] = [
    {
      user: {
        $id: 'user1',
        name: 'Alice Smith',
        username: 'alice',
        imageUrl: '/alice.jpg'
      },
      lastMessage: {
        $id: 'msg1',
        content: 'Hello there!',
        createdAt: '2023-01-01T12:00:00Z',
        sender: { $id: 'user1' },
        receiver: { $id: 'currentUser123' },
        isRead: false
      },
      unreadCount: 2
    },
    {
      user: {
        $id: 'user2',
        name: 'Bob Johnson',
        username: 'bob',
        imageUrl: '/bob.jpg'
      },
      lastMessage: {
        $id: 'msg2',
        content: 'How are you doing today?',
        createdAt: '2023-01-02T13:00:00Z',
        sender: { $id: 'currentUser123' },
        receiver: { $id: 'user2' },
        isRead: true
      },
      unreadCount: 0
    }
  ];

  const mockSocketContextValues = {
    latestMessages: {},
    notificationCount: { user1: 1 },
    onlineUsers: ['user2'],
    clearNotifications: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useSocket as jest.Mock).mockReturnValue(mockSocketContextValues);
  });

  it('renders conversation list correctly', () => {
    const onSelectConversation = jest.fn();

    render(
      <ConversationList
        conversations={mockConversations}
        selectedId="user2"
        onSelectConversation={onSelectConversation}
        currentUserId="currentUser123"
      />
    );

    expect(screen.getByTestId('search-input')).toBeInTheDocument();

    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Online')).toBeInTheDocument();
    expect(screen.getByText('Unread')).toBeInTheDocument();

    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
  });

  it('shows empty state when no conversations exist', () => {
    render(
      <ConversationList
        conversations={[]}
        selectedId="user1"
        onSelectConversation={jest.fn()}
        currentUserId="currentUser123"
      />
    );

    expect(screen.getByText('No conversations yet')).toBeInTheDocument();
    expect(screen.getByText('Your messages will appear here')).toBeInTheDocument();
  });

  it('filters conversations by search term', () => {
    render(
      <ConversationList
        conversations={mockConversations}
        selectedId="user1"
        onSelectConversation={jest.fn()}
        currentUserId="currentUser123"
      />
    );

    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'alice' } });

    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: '' } });

    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
  });

  it('calls onSelectConversation when a conversation is clicked', () => {
    const onSelectConversation = jest.fn();

    render(
      <ConversationList
        conversations={mockConversations}
        selectedId="user1"
        onSelectConversation={onSelectConversation}
        currentUserId="currentUser123"
      />
    );

    fireEvent.click(screen.getByText('Bob Johnson'));

    expect(onSelectConversation).toHaveBeenCalledWith(mockConversations[1].user);
  });
});