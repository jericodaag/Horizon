import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MessageChat from '@/components/shared/MessageChat';
import {
  useGetConversation,
  useSendMessage,
  useMarkMessagesAsRead,
} from '@/lib/react-query/queries';
import { useSocket } from '@/context/SocketContext';
import { IUser } from '@/types';

// Unmock the component we're testing
jest.unmock('@/components/shared/MessageChat');

// Mock the hooks and dependencies
jest.mock('@/hooks/useMessagingRealtime', () => ({
  useMessagingRealtime: jest.fn(),
}));

jest.mock('@/lib/react-query/queries', () => ({
  useGetConversation: jest.fn(),
  useSendMessage: jest.fn(),
  useMarkMessagesAsRead: jest.fn(),
}));

jest.mock('@/context/SocketContext', () => ({
  useSocket: jest.fn(),
}));

jest.mock('@/lib/appwrite/api', () => ({
  uploadFile: jest.fn(),
  getFilePreview: jest.fn(),
}));

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, className, variant }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      data-variant={variant}
    >
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>((props, ref) => (
    <input
      ref={ref}
      {...props}
      data-testid="message-input"
    />
  )),
}));

jest.mock('@/components/shared/OnlineStatusIndicator', () => ({
  __esModule: true,
  default: ({ userId, size }) => (
    <div data-testid={`online-status-${userId}`} data-size={size}>
      {userId && (userId === 'user123' ? '🟢' : '⚪')}
    </div>
  ),
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Loader: () => <div data-testid="loader-icon">Loading...</div>,
  ArrowLeft: () => <div data-testid="arrow-left-icon">←</div>,
  Send: () => <div data-testid="send-icon">→</div>,
  Image: () => <div data-testid="image-icon">📷</div>,
  X: () => <div data-testid="x-icon">✖</div>,
  Phone: () => <div data-testid="phone-icon">📞</div>,
  Video: () => <div data-testid="video-icon">📹</div>,
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className }) => (
      <div className={className}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-object-url');

describe('MessageChat Component', () => {
  // Test data
  const mockConversation: IUser = {
    id: 'user123',
    name: 'Test User',
    username: 'testuser',
    imageUrl: '/test-user.jpg',
    email: 'test@example.com',
    bio: 'Test user bio',
  };

  const currentUserId = 'currentUser456';

  const mockMessages = {
    documents: [
      {
        $id: 'msg1',
        sender: { $id: 'user123' },
        receiver: { $id: 'currentUser456' },
        content: 'Hello there!',
        createdAt: '2023-01-01T12:00:00Z',
        isRead: true,
      },
      {
        $id: 'msg2',
        sender: { $id: 'currentUser456' },
        receiver: { $id: 'user123' },
        content: 'Hi! How are you?',
        createdAt: '2023-01-01T12:05:00Z',
        isRead: false,
      },
    ],
  };

  // Mock functions
  const mockSendMessage = jest.fn();
  const mockMarkAsRead = jest.fn();
  const mockMarkMessageAsRead = jest.fn();
  const mockClearNotifications = jest.fn();
  const mockSetTyping = jest.fn();
  const mockTrackSentMessage = jest.fn();
  const mockOnBack = jest.fn();

  // Mock scrollIntoView
  const mockScrollIntoView = jest.fn();
  HTMLDivElement.prototype.scrollIntoView = mockScrollIntoView;

  beforeEach(() => {
    jest.clearAllMocks();

    // Set up default mocks
    (useGetConversation as jest.Mock).mockReturnValue({
      data: mockMessages,
      isLoading: false,
    });

    (useSendMessage as jest.Mock).mockReturnValue({
      mutate: mockSendMessage,
      isPending: false,
    });

    (useMarkMessagesAsRead as jest.Mock).mockReturnValue({
      mutate: mockMarkAsRead,
    });

    (useSocket as jest.Mock).mockReturnValue({
      socket: { on: jest.fn(), off: jest.fn(), emit: jest.fn() },
      isConnected: true,
      onlineUsers: ['user123'],
      clearNotifications: mockClearNotifications,
      trackSentMessage: mockTrackSentMessage,
      typingUsers: {},
      setTyping: mockSetTyping,
      readReceipts: {},
      markMessageAsRead: mockMarkMessageAsRead,
    });

    // Reset scroll mock
    mockScrollIntoView.mockClear();
  });

  it('renders chat header with user information', () => {
    render(
      <MessageChat
        conversation={mockConversation}
        currentUserId={currentUserId}
        onBack={mockOnBack}
      />
    );

    // Check user information in header
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('@testuser')).toBeInTheDocument();

    // Check user avatar
    const avatar = screen.getByAltText('Test User');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', '/test-user.jpg');

    // Check online status
    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it('displays empty state when there are no messages', () => {
    // Override the mock to return empty messages
    (useGetConversation as jest.Mock).mockReturnValue({
      data: { documents: [] },
      isLoading: false,
    });

    render(
      <MessageChat
        conversation={mockConversation}
        currentUserId={currentUserId}
        onBack={mockOnBack}
      />
    );

    // Check empty state message
    expect(screen.getByText('No messages yet. Say hello!')).toBeInTheDocument();
  });

  it('handles sending a new text message', () => {
    render(
      <MessageChat
        conversation={mockConversation}
        currentUserId={currentUserId}
        onBack={mockOnBack}
      />
    );

    // Type a message
    const inputElement = screen.getByTestId('message-input');
    fireEvent.change(inputElement, { target: { value: 'New test message' } });

    // Click send button
    const sendButtons = screen.getAllByRole('button');
    const sendButton = sendButtons.find(button =>
      button.contains(screen.getByTestId('send-icon'))
    );

    if (sendButton) {
      fireEvent.click(sendButton);

      // Check if the send message function was called
      expect(mockSendMessage).toHaveBeenCalledWith(expect.objectContaining({
        senderId: currentUserId,
        receiverId: mockConversation.id,
        content: 'New test message',
      }));
    }
  });

  it('calls onBack when back button is clicked', () => {
    render(
      <MessageChat
        conversation={mockConversation}
        currentUserId={currentUserId}
        onBack={mockOnBack}
      />
    );

    // Find and click the back button
    const backButtons = screen.getAllByRole('button');
    const backButton = backButtons.find(button =>
      button.contains(screen.getByTestId('arrow-left-icon'))
    );

    if (backButton) {
      fireEvent.click(backButton);
      // Check if the onBack callback was called
      expect(mockOnBack).toHaveBeenCalledTimes(1);
    }
  });
});