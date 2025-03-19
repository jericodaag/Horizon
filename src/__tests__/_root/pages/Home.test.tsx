import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '@/_root/pages/Home';

// Mock the dependencies
jest.mock('@/components/shared/PostCard', () => ({
  __esModule: true,
  default: ({ post }: any) => (
    <div data-testid={`post-card-${post.$id}`} className='post-card'>
      <h3>{post.caption}</h3>
      <p>By: {post.creator?.username || 'Unknown'}</p>
    </div>
  ),
}));

jest.mock('@/components/shared/PostCardSkeleton', () => ({
  __esModule: true,
  default: () => (
    <div className='flex flex-col gap-9'>
      <div data-testid='post-skeleton'>Loading...</div>
      <div data-testid='post-skeleton'>Loading...</div>
    </div>
  ),
}));

jest.mock('lucide-react', () => ({
  ArrowUp: () => <div data-testid='arrow-up-icon'>↑</div>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className }: any) => (
    <button
      onClick={onClick}
      className={className}
      data-testid='scroll-to-top-button'
    >
      {children}
    </button>
  ),
}));

jest.mock('@/lib/react-query/queries', () => ({
  useGetRecentPosts: jest.fn(),
}));

// Import the mocked module to control its behavior
import { useGetRecentPosts } from '@/lib/react-query/queries';

describe('Home Component', () => {
  const mockPostData = [
    {
      $id: 'post1',
      caption: 'Test post 1',
      creator: {
        $id: 'user1',
        username: 'testuser1',
        name: 'Test User 1',
      },
    },
    {
      $id: 'post2',
      caption: 'Test post 2',
      creator: {
        $id: 'user2',
        username: 'testuser2',
        name: 'Test User 2',
      },
    },
    {
      $id: 'post3',
      caption: 'Test post 3',
      creator: {
        $id: 'user3',
        username: 'testuser3',
        name: 'Test User 3',
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset window scrollY
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value: 0,
    });

    // Mock scrollTo
    global.scrollTo = jest.fn();
  });

  it('renders the home feed header', () => {
    // Mock the hook with default state (loaded)
    (useGetRecentPosts as jest.Mock).mockReturnValue({
      data: { documents: [] },
      isPending: false,
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<Home />);
    expect(screen.getByText('Home Feed')).toBeInTheDocument();
  });

  it('shows loading state when fetching posts', () => {
    // Mock the hook to return loading state
    (useGetRecentPosts as jest.Mock).mockReturnValue({
      data: undefined,
      isPending: true,
      isLoading: true,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<Home />);

    // Check for skeleton loaders
    const postCardSkeletons = screen.getAllByTestId('post-skeleton');
    // Don't assert on exact count since the implementation might change
    expect(postCardSkeletons.length).toBeGreaterThan(0);
  });

  it('renders posts when data is loaded', () => {
    // Mock the hook to return posts
    (useGetRecentPosts as jest.Mock).mockReturnValue({
      data: {
        documents: mockPostData,
      },
      isPending: false,
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<Home />);

    // Check for posts
    mockPostData.forEach((post) => {
      expect(screen.getByTestId(`post-card-${post.$id}`)).toBeInTheDocument();
    });
  });

  it('does not display scroll-to-top button initially', () => {
    // Mock the hook with default state
    (useGetRecentPosts as jest.Mock).mockReturnValue({
      data: { documents: [] },
      isPending: false,
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<Home />);

    // Button should not be visible initially
    expect(
      screen.queryByTestId('scroll-to-top-button')
    ).not.toBeInTheDocument();
  });

  it('displays scroll-to-top button after scrolling down', async () => {
    // Mock the hook with default state
    (useGetRecentPosts as jest.Mock).mockReturnValue({
      data: { documents: [] },
      isPending: false,
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<Home />);

    // Button should not be visible initially
    expect(
      screen.queryByTestId('scroll-to-top-button')
    ).not.toBeInTheDocument();

    // Simulate scrolling down
    act(() => {
      Object.defineProperty(window, 'scrollY', {
        configurable: true,
        value: 400,
      });
      window.dispatchEvent(new Event('scroll'));
    });

    // Wait for button to appear
    await waitFor(() => {
      expect(screen.getByTestId('scroll-to-top-button')).toBeInTheDocument();
    });
  });

  it('scrolls to top when button is clicked', async () => {
    // Mock the hook with default state
    (useGetRecentPosts as jest.Mock).mockReturnValue({
      data: { documents: [] },
      isPending: false,
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<Home />);

    // Make button appear
    act(() => {
      Object.defineProperty(window, 'scrollY', {
        configurable: true,
        value: 400,
      });
      window.dispatchEvent(new Event('scroll'));
    });

    // Wait for button to appear and click it
    await waitFor(() => {
      const button = screen.getByTestId('scroll-to-top-button');
      fireEvent.click(button);
    });

    // Check if scrollTo was called with the correct parameters
    expect(global.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth',
    });
  });

  it('removes scroll event listener on unmount', () => {
    // Mock the hook with default state
    (useGetRecentPosts as jest.Mock).mockReturnValue({
      data: { documents: [] },
      isPending: false,
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    });

    // Spy on addEventListener and removeEventListener
    const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = render(<Home />);

    // Check if addEventListener was called with 'scroll'
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function)
    );

    // Unmount the component
    unmount();

    // Check if removeEventListener was called with 'scroll'
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function)
    );
  });

  it('handles a varying number of posts correctly', () => {
    // Test with a single post
    (useGetRecentPosts as jest.Mock).mockReturnValue({
      data: {
        documents: [mockPostData[0]],
      },
      isPending: false,
    });

    const { rerender } = render(<Home />);
    expect(screen.getAllByTestId(/post-card-/)).toHaveLength(1);

    // Test with multiple posts
    (useGetRecentPosts as jest.Mock).mockReturnValue({
      data: {
        documents: mockPostData,
      },
      isPending: false,
    });

    rerender(<Home />);
    expect(screen.getAllByTestId(/post-card-/)).toHaveLength(3);

    // Test with no posts
    (useGetRecentPosts as jest.Mock).mockReturnValue({
      data: {
        documents: [],
      },
      isPending: false,
    });

    rerender(<Home />);
    expect(screen.queryByTestId(/post-card-/)).not.toBeInTheDocument();
  });
});
