import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Profile from '@/_root/pages/Profile';

// Create a mockNavigate function we'll use in our react-router-dom mock
const mockNavigate = jest.fn();

// Mock dependencies
jest.mock('react-router-dom', () => ({
  useParams: () => ({ id: 'user123' }),
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
  useNavigate: () => mockNavigate,
}));

jest.mock('@/lib/react-query/queries', () => ({
  useGetUserById: jest.fn(),
  useGetUserPosts: jest.fn(),
  useGetFollowers: jest.fn(),
  useGetFollowing: jest.fn(),
  useGetSavedPosts: jest.fn(),
  useGetLikedPosts: jest.fn(),
  useIsFollowing: jest.fn(),
  useFollowUser: jest.fn(),
  useUnfollowUser: jest.fn(),
}));

jest.mock('@/components/shared/GridPostList', () => ({
  __esModule: true,
  default: ({ posts, showStats, showUser }: any) => (
    <div
      data-testid='grid-post-list'
      data-showstats={showStats}
      data-showuser={showUser}
    >
      {posts.map((post: any) => (
        <div key={post.$id} data-testid={`post-${post.$id}`}>
          {post.caption}
        </div>
      ))}
      {posts.length === 0 && <div>No posts</div>}
    </div>
  ),
}));

jest.mock('@/components/shared/Loader', () => ({
  __esModule: true,
  default: () => <div data-testid='loader'>Loading...</div>,
}));

jest.mock('@/components/shared/FollowButton', () => ({
  __esModule: true,
  default: ({ userId }: any) => (
    <button data-testid={`follow-button-${userId}`}>Follow</button>
  ),
}));

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

jest.mock('@/context/AuthContext', () => ({
  useUserContext: () => ({
    user: {
      id: 'currentuser123',
      name: 'Current User',
      username: 'currentuser',
      email: 'current@example.com',
      imageUrl: 'https://example.com/current-avatar.jpg',
    },
  }),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className, variant }: any) => (
    <button
      onClick={onClick}
      className={className}
      data-variant={variant}
      data-testid='button'
    >
      {children}
    </button>
  ),
}));

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

jest.mock('lucide-react', () => ({
  MessageCircle: () => <span data-testid='message-icon'>Message Icon</span>,
  Edit3: () => <span data-testid='edit-icon'>Edit Icon</span>,
  Calendar: () => <span data-testid='calendar-icon'>Calendar Icon</span>,
}));

// Import the mocked modules
import {
  useGetUserById,
  useGetUserPosts,
  useGetFollowers,
  useGetFollowing,
  useGetSavedPosts,
  useGetLikedPosts,
} from '@/lib/react-query/queries';

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
  const mockFollowers = [
    { $id: 'follower1', name: 'Follower 1', username: 'follower1' },
    { $id: 'follower2', name: 'Follower 2', username: 'follower2' },
  ];

  const mockFollowing = [
    { $id: 'following1', name: 'Following 1', username: 'following1' },
    { $id: 'following2', name: 'Following 2', username: 'following2' },
    { $id: 'following3', name: 'Following 3', username: 'following3' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    (useGetUserById as jest.Mock).mockReturnValue({
      data: mockUser,
      isLoading: false,
    });

    (useGetUserPosts as jest.Mock).mockReturnValue({
      data: mockPosts,
      isLoading: false,
    });

    (useGetFollowers as jest.Mock).mockReturnValue({
      data: mockFollowers,
    });

    (useGetFollowing as jest.Mock).mockReturnValue({
      data: mockFollowing,
    });

    (useGetSavedPosts as jest.Mock).mockReturnValue({
      data: mockSavedPosts,
      isLoading: false,
    });

    (useGetLikedPosts as jest.Mock).mockReturnValue({
      data: mockLikedPosts,
      isLoading: false,
    });
  });

  it('renders loading state while fetching user data', () => {
    (useGetUserById as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
    });

    render(<Profile />);

    expect(screen.getByTestId('loader')).toBeInTheDocument();
    expect(screen.queryByText('Test User')).not.toBeInTheDocument();
  });

  it('renders user not found message when user data is missing', () => {
    (useGetUserById as jest.Mock).mockReturnValue({
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

    // Check stats are displayed - use querySelector approach for post count
    const postCountElement = document.querySelector(
      '.flex-center.gap-2 p.text-primary-500'
    );
    expect(postCountElement).toHaveTextContent('2');

    expect(screen.getByText('Followers')).toBeInTheDocument();
    expect(screen.getByText('Following')).toBeInTheDocument();
  });

  it('renders edit profile button for own profile', () => {
    // Make this user's own profile
    (useGetUserById as jest.Mock).mockReturnValue({
      data: { ...mockUser, $id: 'currentuser123' },
      isLoading: false,
    });

    render(<Profile />);

    // Use getAllByTestId to get all edit profile links and find the one containing "Edit Profile"
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

    // Check that the posts are rendered
    expect(screen.getByTestId('post-post1')).toBeInTheDocument();
    expect(screen.getByTestId('post-post2')).toBeInTheDocument();
  });

  it('shows empty state when user has no posts', () => {
    (useGetUserPosts as jest.Mock).mockReturnValue({
      data: { documents: [] },
      isLoading: false,
    });

    render(<Profile />);

    expect(screen.getByText('No posts yet')).toBeInTheDocument();

    // On own profile, should show create post button
    (useGetUserById as jest.Mock).mockReturnValue({
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
    (useGetUserById as jest.Mock).mockReturnValue({
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
    (useGetUserById as jest.Mock).mockReturnValue({
      data: { ...mockUser, $id: 'currentuser123' },
      isLoading: false,
    });

    render(<Profile />);

    // Should show liked posts tab
    expect(screen.getByTestId('tab-liked')).toBeInTheDocument();
  });

  it('displays loading state while fetching posts', () => {
    (useGetUserPosts as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
    });

    render(<Profile />);

    const postsTabContent = screen.getByTestId('tab-content-posts');
    expect(postsTabContent).toContainElement(screen.getByTestId('loader'));
  });

  it('displays custom cover image with correct positioning', () => {
    // Mock user with cover image and position
    (useGetUserById as jest.Mock).mockReturnValue({
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

  it('displays fallback cover gradient when no cover image is present', () => {
    render(<Profile />);

    // Should not show cover image
    expect(screen.queryByAltText('cover')).not.toBeInTheDocument();

    // Should show gradient div instead
    const coverContainer = document.querySelector('.w-full.h-64');
    expect(coverContainer).toBeInTheDocument();

    // Find the gradient div within the cover container
    const gradientDiv = coverContainer?.querySelector('.bg-gradient-to-r');
    expect(gradientDiv).toBeInTheDocument();
    expect(gradientDiv).toHaveClass(
      'w-full h-full from-primary-600 to-purple-600 rounded-b-xl'
    );
  });

  console.log(screen.debug());

  it('passes the correct user data to message link state', () => {
    render(<Profile />);

    const messageLink = screen.getByTestId('link-to-/messages');
    expect(messageLink).toHaveAttribute(
      'data-state',
      JSON.stringify({
        initialConversation: mockUser,
      })
    );
  });
});
