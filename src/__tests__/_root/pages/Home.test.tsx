import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '@/_root/pages/Home';

import { mockGetRecentPosts } from '@/__tests__/__mocks__/api';

jest.mock('@/components/shared/PostCard', () => ({
  __esModule: true,
  default: ({ post }) => (
    <div data-testid={`post-card-${post.$id}`}>{post.caption}</div>
  ),
}));

jest.mock('@/components/shared/PostCardSkeleton', () => ({
  __esModule: true,
  default: () => <div data-testid='post-skeleton'>Loading...</div>,
}));

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

    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value: 0,
    });

    global.scrollTo = jest.fn();
  });

  it('renders the home feed header', () => {
    mockGetRecentPosts.mockReturnValue({
      data: { documents: [] },
      isPending: false,
    });

    render(<Home />);
    expect(screen.getByText('Home Feed')).toBeInTheDocument();
  });

  it('shows loading state when fetching posts', () => {
    mockGetRecentPosts.mockReturnValue({
      data: undefined,
      isPending: true,
    });

    render(<Home />);

    const postCardSkeletons = screen.getAllByTestId('post-skeleton');
    expect(postCardSkeletons.length).toBe(2);
  });

  it('renders posts when data is loaded', () => {
    mockGetRecentPosts.mockReturnValue({
      data: {
        documents: mockPostData,
      },
      isPending: false,
    });

    render(<Home />);

    mockPostData.forEach((post) => {
      expect(screen.getByTestId(`post-card-${post.$id}`)).toBeInTheDocument();
    });
  });

  it('does not display scroll-to-top button initially', () => {
    mockGetRecentPosts.mockReturnValue({
      data: { documents: [] },
      isPending: false,
    });

    render(<Home />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('displays scroll-to-top button after scrolling down', async () => {
    mockGetRecentPosts.mockReturnValue({
      data: { documents: [] },
      isPending: false,
    });

    render(<Home />);

    act(() => {
      Object.defineProperty(window, 'scrollY', {
        configurable: true,
        value: 400,
      });
      window.dispatchEvent(new Event('scroll'));
    });

    await waitFor(() => {
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  it('scrolls to top when button is clicked', async () => {
    mockGetRecentPosts.mockReturnValue({
      data: { documents: [] },
      isPending: false,
    });

    render(<Home />);

    act(() => {
      Object.defineProperty(window, 'scrollY', {
        configurable: true,
        value: 400,
      });
      window.dispatchEvent(new Event('scroll'));
    });

    await waitFor(() => {
      const button = screen.getByRole('button');
      fireEvent.click(button);
    });

    expect(global.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth',
    });
  });

  it('removes scroll event listener on unmount', () => {
    mockGetRecentPosts.mockReturnValue({
      data: { documents: [] },
      isPending: false,
    });

    const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = render(<Home />);

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function)
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'scroll',
      expect.any(Function)
    );
  });
});
