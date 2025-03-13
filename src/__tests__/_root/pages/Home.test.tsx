import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '@/_root/pages/Home';

// Mock the dependencies
jest.mock('@/components/shared/PostCard', () => ({
    __esModule: true,
    default: ({ post }: any) => (
        <div data-testid="post-card">{post.caption || 'Post content'}</div>
    )
}));

jest.mock('@/components/shared/PostCardSkeleton', () => ({
    __esModule: true,
    default: () => <div data-testid="skeleton-loader">Loading...</div>
}));

jest.mock('@/lib/react-query/queries', () => ({
    useGetRecentPosts: jest.fn()
}));

// Import the mocked module to control its behavior
import { useGetRecentPosts } from '@/lib/react-query/queries';

describe('Home Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Reset window scrollY
        Object.defineProperty(window, 'scrollY', {
            configurable: true,
            value: 0
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
            refetch: jest.fn()
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
            refetch: jest.fn()
        });

        render(<Home />);

        // Check for skeleton loaders
        expect(screen.getAllByTestId('skeleton-loader')).toHaveLength(2);
    });

    it('renders posts when data is loaded', () => {
        // Mock the hook to return posts
        (useGetRecentPosts as jest.Mock).mockReturnValue({
            data: {
                documents: [
                    { $id: 'post1', caption: 'Test post 1' },
                    { $id: 'post2', caption: 'Test post 2' }
                ]
            },
            isPending: false,
            isLoading: false,
            isError: false,
            error: null,
            refetch: jest.fn()
        });

        render(<Home />);

        // Check for posts
        expect(screen.getAllByTestId('post-card')).toHaveLength(2);
    });

    it('displays scroll-to-top button after scrolling down', async () => {
        // Mock the hook with default state
        (useGetRecentPosts as jest.Mock).mockReturnValue({
            data: { documents: [] },
            isPending: false,
            isLoading: false,
            isError: false,
            error: null,
            refetch: jest.fn()
        });

        render(<Home />);

        // Button should not be visible initially
        expect(screen.queryByRole('button')).not.toBeInTheDocument();

        // Simulate scrolling down
        act(() => {
            Object.defineProperty(window, 'scrollY', {
                configurable: true,
                value: 400
            });
            window.dispatchEvent(new Event('scroll'));
        });

        // Wait for button to appear
        await waitFor(() => {
            expect(screen.getByRole('button')).toBeInTheDocument();
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
            refetch: jest.fn()
        });

        render(<Home />);

        // Make button appear
        act(() => {
            Object.defineProperty(window, 'scrollY', {
                configurable: true,
                value: 400
            });
            window.dispatchEvent(new Event('scroll'));
        });

        // Wait for button to appear and click it
        await waitFor(() => {
            const button = screen.getByRole('button');
            fireEvent.click(button);
        });

        // Check if scrollTo was called
        expect(global.scrollTo).toHaveBeenCalledWith({
            top: 0,
            behavior: 'smooth'
        });
    });
});