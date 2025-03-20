import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Profile from '@/_root/pages/Profile';

// Import specific mocks we'll configure for this test
import { mockNavigate } from '@/__tests__/__mocks__/router';
import {
  mockGetUserById,
  mockGetUserPosts,
  mockGetFollowers,
  mockGetFollowing,
  mockGetSavedPosts,
  mockGetLikedPosts,
  mockIsFollowing,
  mockFollowUser,
  mockUnfollowUser
} from '@/__tests__/__mocks__/api';

// Mock components specific to Profile that aren't in global mocks
jest.mock('@/components/shared/FollowModal', () => ({
  __esModule: true,
  default: ({ userId, type, isOpen, onClose }: any) =>
    isOpen ? (
      <div data-testid='follow-modal' data-type={type} data-userid={userId}>
        <button onClick={onClose} data-testid='close-modal'>
          Close
        </button>
      </div>
    ) : null,
}));

// Override router mocks for Profile specific needs
jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom');
  return {
    ...originalModule,
    useParams: () => ({ id: 'user123' }),
    useNavigate: () => mockNavigate,
    Link: ({ to, state, children, className }: any) => (
      <a
        href={to}
        className={className}
        data-testid={`link-to-${to}`}
        data-state={JSON.stringify(state)}
      >
        {children}
      </a>
    ),
  };
});

// Mock UI Tabs components as they're not in the global mocks
jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, defaultValue }: any) => (
    <div data-testid='tabs' data-default-value={defaultValue}>
      {children}
    </div>
  ),
  TabsList: ({ children, className }: any) => (
    <div data-testid='tabs-list' className={className}>
      {children}
    </div>
  ),
  TabsTrigger: ({ children, value, className }: any) => (
    <button
      data-testid={`tab-${value}`}
      data-value={value}
      className={className}
    >
      {children}
    </button>
  ),
  TabsContent: ({ children, value }: any) => (
    <div data-testid={`tab-content-${value}`} data-value={value}>
      {children}
    </div>
  ),
}));

// Mock Lucide icons that are specific to the Profile component
jest.mock('lucide-react', () => ({
  ...jest.requireActual('lucide-react'),
  MessageCircle: () => <span data-testid='message-icon'>Message Icon</span>,
  Edit3: () => <span data-testid='edit-icon'>Edit Icon</span>,
  Calendar: () => <span data-testid='calendar-icon'>Calendar Icon</span>,
}));

describe('Profile Component', () => {
  // Mock user data
  const mockUser = {
    $id: 'user123',
    $createdAt: '2023-01-01T12:00:00.000Z',
    name: 'Test User',
    username: 'testuser',
    email: 'test@example.com',
    imageUrl: 'https://example.com/avatar.jpg',
    bio: 'This is a test bio',
  };

  // Mock posts data
  const mockPosts = {
    documents: [
      {
        $id: 'post1',
        caption: 'Test post 1',
        imageUrl: 'https://example.com/post1.jpg',
        creator: { $id: 'user123', name: 'Test User' },
      },
      {
        $id: 'post2',
        caption: 'Test post 2',
        imageUrl: 'https://example.com/post2.jpg',
        creator: { $id: 'user123', name: 'Test User' },
      },
    ],
  };

  // Mock saved posts
  const mockSavedPosts = [
    {
      $id: 'saved1',
      caption: 'Saved post 1',
      imageUrl: 'https://example.com/saved1.jpg',
      creator: { $id: 'otheruser', name: 'Other User' },
    },
  ];

  // Mock liked posts
  const mockLikedPosts = [
    {
      $id: 'liked1',
      caption: 'Liked post 1',
      imageUrl: 'https://example.com/liked1.jpg',
      creator: { $id: 'otheruser', name: 'Other User' },
    },
  ];

  // Mock followers and following
  const mockFollowersData = [
    { $id: 'follower1', name: 'Follower 1', username: 'follower1' },
    { $id: 'follower2', name: 'Follower 2', username: 'follower2' },
  ];

  const mockFollowingData = [
    { $id: 'following1', name: 'Following 1', username: 'following1' },
    { $id: 'following2', name: 'Following 2', username: 'following2' },
    { $id: 'following3', name: 'Following 3', username: 'following3' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    mockGetUserById.mockReturnValue({
      data: mockUser,
      isLoading: false,
    });

    mockGetUserPosts.mockReturnValue({
      data: mockPosts,
      isLoading: false,
    });

    mockGetFollowers.mockReturnValue({
      data: mockFollowersData,
    });

    mockGetFollowing.mockReturnValue({
      data: mockFollowingData,
    });

    mockGetSavedPosts.mockReturnValue({
      data: mockSavedPosts,
      isLoading: false,
    });

    mockGetLikedPosts.mockReturnValue({
      data: mockLikedPosts,
      isLoading: false,
    });

    mockIsFollowing.mockReturnValue({
      data: false,
      isLoading: false,
    });

    mockFollowUser.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    });

    mockUnfollowUser.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    });
  });

  it('renders loading state while fetching user data', () => {
    mockGetUserById.mockReturnValue({
      data: null,
      isLoading: true,
    });

    render(<Profile />);

    expect(screen.getByTestId('loader')).toBeInTheDocument();
    expect(screen.queryByText('Test User')).not.toBeInTheDocument();
  });

  it('renders user not found message when user data is missing', () => {
    mockGetUserById.mockReturnValue({
      data: null,
      isLoading: false,
    });

    render(<Profile />);

    expect(screen.getByText('User not found')).toBeInTheDocument();
  });

  it('renders user profile with correct data', () => {
    render(<Profile />);

    // Check for basic user info
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('@testuser')).toBeInTheDocument();
    expect(screen.getByText('This is a test bio')).toBeInTheDocument();

    // Check for join date formatting
    expect(screen.getByText(/Joined January 2023/)).toBeInTheDocument();

    // Check stats are displayed
    expect(screen.getByText('Followers')).toBeInTheDocument();
    expect(screen.getByText('Following')).toBeInTheDocument();
  });

  it('renders edit profile button for own profile', () => {
    // Make this user's own profile by changing the user ID to match the current user
    mockGetUserById.mockReturnValue({
      data: { ...mockUser, $id: 'currentuser123' },
      isLoading: false,
    });

    render(<Profile />);

    // Look for edit profile link
    const editProfileLinks = screen.getAllByTestId(
      'link-to-/update-profile/currentuser123'
    );
    const profileEditLink = editProfileLinks.find((link) =>
      link.textContent?.includes('Edit Profile')
    );

    expect(profileEditLink).toBeInTheDocument();
    expect(profileEditLink).toHaveTextContent('Edit Profile');

    // Follow button should not be visible on own profile
    expect(
      screen.queryByTestId('follow-button-currentuser123')
    ).not.toBeInTheDocument();
  });

  it('renders follow button and message button for other users profiles', () => {
    render(<Profile />);

    // Should show follow button
    expect(screen.getByTestId('follow-button-user123')).toBeInTheDocument();

    // Should show message button
    const messageLink = screen.getByTestId('link-to-/messages');
    expect(messageLink).toBeInTheDocument();
    expect(messageLink).toHaveTextContent('Message');

    // Edit profile button should not be visible
    expect(
      screen.queryByTestId('link-to-/update-profile/user123')
    ).not.toBeInTheDocument();
  });

  it('opens followers modal when followers count is clicked', () => {
    render(<Profile />);

    // Click on followers count
    fireEvent.click(screen.getByText('Followers'));

    // Modal should be visible with followers type
    const modal = screen.getByTestId('follow-modal');
    expect(modal).toBeInTheDocument();
    expect(modal).toHaveAttribute('data-type', 'followers');

    // Close modal
    fireEvent.click(screen.getByTestId('close-modal'));
    expect(screen.queryByTestId('follow-modal')).not.toBeInTheDocument();
  });

  it('opens following modal when following count is clicked', () => {
    render(<Profile />);

    // Click on following count
    fireEvent.click(screen.getByText('Following'));

    // Modal should be visible with following type
    const modal = screen.getByTestId('follow-modal');
    expect(modal).toBeInTheDocument();
    expect(modal).toHaveAttribute('data-type', 'following');
  });

  it('displays user posts in the posts tab', () => {
    render(<Profile />);

    const postsTabContent = screen.getByTestId('tab-content-posts');
    expect(postsTabContent).toBeInTheDocument();

    // Check that the grid post list is rendered with correct props
    const gridPostList = screen.getByTestId('grid-post-list');
    expect(gridPostList).toBeInTheDocument();
    expect(gridPostList).toHaveAttribute('data-showstats', 'true');
  });

  it('shows empty state when user has no posts', () => {
    mockGetUserPosts.mockReturnValue({
      data: { documents: [] },
      isLoading: false,
    });

    render(<Profile />);

    expect(screen.getByText('No posts yet')).toBeInTheDocument();

    // On own profile, should show create post button
    mockGetUserById.mockReturnValue({
      data: { ...mockUser, $id: 'currentuser123' },
      isLoading: false,
    });

    render(<Profile />);

    expect(screen.getByText('Create your first post')).toBeInTheDocument();
  });

  it('shows saved posts tab only on own profile', () => {
    // Other user's profile
    render(<Profile />);

    // Should not show saved posts tab
    expect(screen.queryByTestId('tab-saved')).not.toBeInTheDocument();

    // Own profile
    mockGetUserById.mockReturnValue({
      data: { ...mockUser, $id: 'currentuser123' },
      isLoading: false,
    });

    render(<Profile />);

    // Should show saved posts tab
    expect(screen.getByTestId('tab-saved')).toBeInTheDocument();
  });

  it('shows liked posts tab only on own profile', () => {
    // Other user's profile
    render(<Profile />);

    // Should not show liked posts tab
    expect(screen.queryByTestId('tab-liked')).not.toBeInTheDocument();

    // Own profile
    mockGetUserById.mockReturnValue({
      data: { ...mockUser, $id: 'currentuser123' },
      isLoading: false,
    });

    render(<Profile />);

    // Should show liked posts tab
    expect(screen.getByTestId('tab-liked')).toBeInTheDocument();
  });

  it('displays loading state while fetching posts', () => {
    mockGetUserPosts.mockReturnValue({
      data: null,
      isLoading: true,
    });

    render(<Profile />);

    const postsTabContent = screen.getByTestId('tab-content-posts');
    expect(postsTabContent).toContainElement(screen.getByTestId('loader'));
  });

  it('displays custom cover image with correct positioning', () => {
    // Mock user with cover image and position
    mockGetUserById.mockReturnValue({
      data: {
        ...mockUser,
        coverImageUrl: 'https://example.com/cover.jpg',
        coverPosition: JSON.stringify({ x: 0, y: 30 }),
      },
      isLoading: false,
    });

    render(<Profile />);

    const coverImage = screen.getByAltText('cover');
    expect(coverImage).toBeInTheDocument();
    expect(coverImage).toHaveAttribute('src', 'https://example.com/cover.jpg');
    expect(coverImage).toHaveStyle('object-position: center 30%');
  });

  it('passes the correct user data to message link state', () => {
    render(<Profile />);

    const messageLink = screen.getByTestId('link-to-/messages');
    expect(messageLink).toHaveAttribute(
      'data-state',
      JSON.stringify({
        initialConversation: mockUser,
      })
    );
  })
});