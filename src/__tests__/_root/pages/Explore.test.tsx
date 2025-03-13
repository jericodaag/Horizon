import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Explore from '@/_root/pages/Explore';

// Mock the custom hooks
jest.mock('@/hooks/useDebounce', () => ({
    __esModule: true,
    default: jest.fn((value) => value), // Return the value immediately for testing
}));

jest.mock('react-intersection-observer', () => ({
    useInView: jest.fn()
}));

// Mock the query hooks
jest.mock('@/lib/react-query/queries', () => ({
    useGetPosts: jest.fn(),
    useSearchPosts: jest.fn()
}));

// Mock the components
jest.mock('@/components/shared/Loader', () => ({
    __esModule: true,
    default: () => <div data-testid="loader">Loading...</div>
}));

jest.mock('@/components/shared/GridPostList', () => ({
    __esModule: true,
    default: ({ posts }: { posts: any[] }) => (
        <div data-testid="grid-post-list">
            {posts.map(post => (
                <div key={post.$id} data-testid={`post-${post.$id}`}>{post.caption}</div>
            ))}
        </div>
    )
}));

jest.mock('@/components/ui/input', () => ({
    Input: ({ value, onChange, ...props }: any) => (
        <input
            data-testid="search-input"
            value={value}
            onChange={onChange}
            {...props}
        />
    )
}));

// Import mocked modules
import { useGetPosts, useSearchPosts } from '@/lib/react-query/queries';
import { useInView } from 'react-intersection-observer';

describe('Explore Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shows loader when posts are loading', () => {
        // Mock hooks
        (useInView as jest.Mock).mockReturnValue({ ref: jest.fn(), inView: false });
        (useGetPosts as jest.Mock).mockReturnValue({
            data: null,
            fetchNextPage: jest.fn(),
            hasNextPage: false
        });
        (useSearchPosts as jest.Mock).mockReturnValue({
            data: null,
            isFetching: false
        });

        render(<Explore />);

        expect(screen.getByTestId('loader')).toBeInTheDocument();
    });

    it('renders posts when data is loaded', () => {
        // Mock post data
        const mockPosts = {
            pages: [
                {
                    documents: [
                        { $id: 'post1', caption: 'First post' },
                        { $id: 'post2', caption: 'Second post' }
                    ]
                }
            ]
        };

        // Mock hooks
        (useInView as jest.Mock).mockReturnValue({ ref: jest.fn(), inView: false });
        (useGetPosts as jest.Mock).mockReturnValue({
            data: mockPosts,
            fetchNextPage: jest.fn(),
            hasNextPage: false
        });
        (useSearchPosts as jest.Mock).mockReturnValue({
            data: null,
            isFetching: false
        });

        render(<Explore />);

        // Check header elements
        expect(screen.getByText('Search Posts')).toBeInTheDocument();
        expect(screen.getByText('Popular Today')).toBeInTheDocument();

        // Check posts are rendered
        expect(screen.getByTestId('grid-post-list')).toBeInTheDocument();
        expect(screen.getByText('First post')).toBeInTheDocument();
        expect(screen.getByText('Second post')).toBeInTheDocument();
    });

    it('shows search results when search input has value', async () => {
        // Mock hooks
        (useInView as jest.Mock).mockReturnValue({ ref: jest.fn(), inView: false });
        (useGetPosts as jest.Mock).mockReturnValue({
            data: {
                pages: [
                    {
                        documents: [
                            { $id: 'post1', caption: 'Regular post' }
                        ]
                    }
                ]
            },
            fetchNextPage: jest.fn(),
            hasNextPage: false
        });

        // Mock search results
        const mockSearchResults = {
            documents: [
                { $id: 'search1', caption: 'Search result post' }
            ]
        };

        (useSearchPosts as jest.Mock).mockReturnValue({
            data: mockSearchResults,
            isFetching: false
        });

        render(<Explore />);

        // Enter search text
        const searchInput = screen.getByTestId('search-input');
        fireEvent.change(searchInput, { target: { value: 'test search' } });

        // Wait for component to update
        await waitFor(() => {
            expect(screen.getByText('Search result post')).toBeInTheDocument();
            expect(screen.queryByText('Regular post')).not.toBeInTheDocument();
        });
    });

    it('shows loading indicator during search', async () => {
        // Mock hooks
        (useInView as jest.Mock).mockReturnValue({ ref: jest.fn(), inView: false });
        (useGetPosts as jest.Mock).mockReturnValue({
            data: {
                pages: [
                    {
                        documents: [
                            { $id: 'post1', caption: 'Regular post' }
                        ]
                    }
                ]
            },
            fetchNextPage: jest.fn(),
            hasNextPage: false
        });

        // Mock search loading state
        (useSearchPosts as jest.Mock).mockReturnValue({
            data: null,
            isFetching: true
        });

        render(<Explore />);

        // Enter search text
        const searchInput = screen.getByTestId('search-input');
        fireEvent.change(searchInput, { target: { value: 'test search' } });

        // Wait for component to update
        await waitFor(() => {
            expect(screen.getByTestId('loader')).toBeInTheDocument();
        });
    });

    it('shows "No results found" when search returns empty results', async () => {
        // Mock hooks
        (useInView as jest.Mock).mockReturnValue({ ref: jest.fn(), inView: false });
        (useGetPosts as jest.Mock).mockReturnValue({
            data: {
                pages: [
                    {
                        documents: [
                            { $id: 'post1', caption: 'Regular post' }
                        ]
                    }
                ]
            },
            fetchNextPage: jest.fn(),
            hasNextPage: false
        });

        // Mock empty search results
        (useSearchPosts as jest.Mock).mockReturnValue({
            data: { documents: [] },
            isFetching: false
        });

        render(<Explore />);

        // Enter search text
        const searchInput = screen.getByTestId('search-input');
        fireEvent.change(searchInput, { target: { value: 'test search' } });

        // Wait for component to update
        await waitFor(() => {
            expect(screen.getByText('No results found')).toBeInTheDocument();
        });
    });
});