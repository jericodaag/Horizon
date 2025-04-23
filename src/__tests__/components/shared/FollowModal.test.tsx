import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FollowModal from '@/components/shared/FollowModal';
import { useGetFollowers, useGetFollowing } from '@/lib/react-query/queries';
import { useUserContext } from '@/context/AuthContext';
import { Models } from 'appwrite';

jest.unmock('@/components/shared/FollowModal');

jest.mock('@/lib/react-query/queries', () => ({
  useGetFollowers: jest.fn(),
  useGetFollowing: jest.fn(),
}));

jest.mock('@/context/AuthContext', () => ({
  useUserContext: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  Link: ({ children, to, onClick, className }) => (
    <a
      href={to}
      onClick={onClick}
      className={className}
      data-testid={`link-to-${to.replace(/\//g, '-')}`}
    >
      {children}
    </a>
  ),
}));

jest.mock('@/components/shared/FollowButton', () => ({
  __esModule: true,
  default: ({ userId, compact }) => (
    <button data-testid={`follow-button-${userId}`} data-compact={compact}>
      Follow
    </button>
  ),
}));

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }) =>
    open ? <div data-testid='dialog'>{children}</div> : null,
  DialogContent: ({ children, className }) => (
    <div data-testid='dialog-content' className={className}>
      {children}
    </div>
  ),
  DialogHeader: ({ children, className }) => (
    <div data-testid='dialog-header' className={className}>
      {children}
    </div>
  ),
  DialogTitle: ({ children, className }) => (
    <h2 data-testid='dialog-title' className={className}>
      {children}
    </h2>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ placeholder, value, onChange, className }) => (
    <input
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={className}
      data-testid='search-input'
    />
  ),
}));

jest.mock('lucide-react', () => ({
  Loader: () => <div data-testid='loader'>Loading...</div>,
  Search: () => <div data-testid='search-icon'>Search</div>,
  X: () => <div data-testid='clear-icon'>X</div>,
  MessageCircle: () => <div data-testid='message-icon'>Message</div>,
}));

describe('FollowModal Component', () => {
  const mockUserId = 'user-123';
  const mockCurrentUser = {
    id: 'current-user',
    name: 'Current User',
  };

  const createMockDocument = (
    id: string,
    name: string,
    username: string,
    imageUrl: string
  ): Models.Document => {
    return {
      $id: id,
      name,
      username,
      imageUrl,
      $collectionId: 'test-collection',
      $databaseId: 'test-database',
      $createdAt: '2023-01-01T00:00:00Z',
      $updatedAt: '2023-01-01T00:00:00Z',
      $permissions: [],
    } as Models.Document;
  };

  const mockFollowers = [
    createMockDocument(
      'follower-1',
      'Follower One',
      'followerone',
      '/follower1.jpg'
    ),
    createMockDocument(
      'follower-2',
      'Follower Two',
      'followertwo',
      '/follower2.jpg'
    ),
    createMockDocument(
      'current-user',
      'Current User',
      'currentuser',
      '/current.jpg'
    ),
  ];

  const mockFollowing = [
    createMockDocument(
      'following-1',
      'Following One',
      'followingone',
      '/following1.jpg'
    ),
    createMockDocument(
      'following-2',
      'Following Two',
      'followingtwo',
      '/following2.jpg'
    ),
  ];

  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useUserContext as jest.Mock).mockReturnValue({ user: mockCurrentUser });

    (useGetFollowers as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
    });

    (useGetFollowing as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
    });
  });

  it('renders followers modal with user list', () => {
    (useGetFollowers as jest.Mock).mockReturnValue({
      data: mockFollowers,
      isLoading: false,
    });

    render(
      <FollowModal
        userId={mockUserId}
        type='followers'
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByTestId('dialog')).toBeInTheDocument();
    expect(screen.getByTestId('dialog-title')).toHaveTextContent('Followers');

    expect(screen.getByTestId('search-input')).toBeInTheDocument();

    expect(screen.getByText('Follower One')).toBeInTheDocument();
    expect(screen.getByText('Follower Two')).toBeInTheDocument();

    expect(
      screen.getByTestId('link-to--profile-follower-1')
    ).toBeInTheDocument();

    expect(
      screen.queryByTestId('follow-button-current-user')
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('follow-button-follower-1')).toBeInTheDocument();
  });

  it('renders following modal with user list', () => {
    (useGetFollowing as jest.Mock).mockReturnValue({
      data: mockFollowing,
      isLoading: false,
    });

    render(
      <FollowModal
        userId={mockUserId}
        type='following'
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByTestId('dialog-title')).toHaveTextContent('Following');

    expect(screen.getByText('Following One')).toBeInTheDocument();
    expect(screen.getByText('Following Two')).toBeInTheDocument();
  });

  it('shows loading state and empty state appropriately', () => {
    (useGetFollowers as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
    });

    const { rerender } = render(
      <FollowModal
        userId={mockUserId}
        type='followers'
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByTestId('loader')).toBeInTheDocument();

    (useGetFollowers as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
    });

    rerender(
      <FollowModal
        userId={mockUserId}
        type='followers'
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('No followers yet')).toBeInTheDocument();
  });

  it('allows filtering users with search', () => {
    (useGetFollowers as jest.Mock).mockReturnValue({
      data: mockFollowers,
      isLoading: false,
    });

    render(
      <FollowModal
        userId={mockUserId}
        type='followers'
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'One' } });

    expect(screen.getByText('Follower One')).toBeInTheDocument();
    expect(screen.queryByText('Follower Two')).not.toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: '' } });

    expect(screen.getByText('Follower One')).toBeInTheDocument();
    expect(screen.getByText('Follower Two')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    (useGetFollowers as jest.Mock).mockReturnValue({
      data: mockFollowers,
      isLoading: false,
    });

    render(
      <FollowModal
        userId={mockUserId}
        type='followers'
        isOpen={false}
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
  });
});
