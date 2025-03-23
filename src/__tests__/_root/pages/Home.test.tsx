import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '@/_root/pages/Home';

// Import specific mocks we need
import { mockGetRecentPosts } from '@/__tests__/__mocks__/api';

// Mock the PostCard component
jest.mock('@/components/shared/PostCard', () => ({
  __esModule: true,
  default: ({ post }) => (
    <div data-testid={`post-card-${post.$id}`}>{post.caption}</div>
  ),
}));

// Mock the PostCardSkeleton component
jest.mock('@/components/shared/PostCardSkeleton', () => ({
  __esModule: true,
  default: () => <div data-testid='post-skeleton'>Loading...</div>,
}));

// Mock the ArrowUp icon
jest.mock('lucide-react', () => ({
  ArrowUp: () => <div data-testid='arrow-up-icon'>↑</div>,
}));

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
    // Configure the mock for this test
    mockGetRecentPosts.mockReturnValue({
      data: { documents: [] },
      isPending: false,
    });

    render(<Home />);
    expect(screen.getByText('Home Feed')).toBeInTheDocument();
  });

  it('shows loading state when fetching posts', () => {
    // Configure the mock for this test
    mockGetRecentPosts.mockReturnValue({
      data: undefined,
      isPending: true,
    });

    render(<Home />);

    // Check for skeleton loaders
    const postCardSkeletons = screen.getAllByTestId('post-skeleton');
    expect(postCardSkeletons.length).toBe(2); // We render 2 skeletons
  });

  it('renders posts when data is loaded', () => {
    // Configure the mock for this test
    mockGetRecentPosts.mockReturnValue({
      data: {
        documents: mockPostData,
      },
      isPending: false,
    });

    render(<Home />);

    // Check for posts
    mockPostData.forEach((post) => {
      expect(screen.getByTestId(`post-card-${post.$id}`)).toBeInTheDocument();
    });
  });

  it('does not display scroll-to-top button initially', () => {
    // Configure the mock for this test
    mockGetRecentPosts.mockReturnValue({
      data: { documents: [] },
      isPending: false,
    });

    render(<Home />);

    // Button should not be visible initially
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('displays scroll-to-top button after scrolling down', async () => {
    // Configure the mock for this test
    mockGetRecentPosts.mockReturnValue({
      data: { documents: [] },
      isPending: false,
    });

    render(<Home />);

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
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  it('scrolls to top when button is clicked', async () => {
    // Configure the mock for this test
    mockGetRecentPosts.mockReturnValue({
      data: { documents: [] },
      isPending: false,
    });

    render(<Home />);

    // Simulate scrolling down
    act(() => {
      Object.defineProperty(window, 'scrollY', {
        configurable: true,
        value: 400,
      });
      window.dispatchEvent(new Event('scroll'));
    });

    // Wait for button to appear and click it
    await waitFor(() => {
      const button = screen.getByRole('button');
      fireEvent.click(button);
    });

    // Check if scrollTo was called with correct parameters
    expect(global.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth',
    });
  });

  it('removes scroll event listener on unmount', () => {
    // Configure the mock for this test
    mockGetRecentPosts.mockReturnValue({
      data: { documents: [] },
      isPending: false,
    });

    // Spy on event listeners
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
});
