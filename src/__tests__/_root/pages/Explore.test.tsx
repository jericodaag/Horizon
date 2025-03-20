import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Explore from '@/_root/pages/Explore';

// Import specific mocks we need
import { mockGetPosts, mockSearchPosts } from '@/__tests__/__mocks__/api';

describe('Explore Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shows loader when posts are loading', () => {
        // Configure the mocks for this test
        mockGetPosts.mockReturnValue({
            data: null,
            fetchNextPage: jest.fn(),
            hasNextPage: false
        });

        mockSearchPosts.mockReturnValue({
            data: null,
            isFetching: false
        });

        render(<Explore />);
        expect(screen.getByTestId('loader')).toBeInTheDocument();
    });

    it('renders posts when data is loaded', () => {
        // Configure the mocks for this test
        mockGetPosts.mockReturnValue({
            data: {
                pages: [
                    {
                        documents: [
                            { $id: 'post1', caption: 'First post' },
                            { $id: 'post2', caption: 'Second post' }
                        ]
                    }
                ]
            },
            fetchNextPage: jest.fn(),
            hasNextPage: false
        });

        mockSearchPosts.mockReturnValue({
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
        // Configure the mocks for this test
        mockGetPosts.mockReturnValue({
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
        mockSearchPosts.mockReturnValue({
            data: {
                documents: [
                    { $id: 'search1', caption: 'Search result post' }
                ]
            },
            isFetching: false
        });

        render(<Explore />);

        // Enter search text
        const searchInput = screen.getByPlaceholderText('Search');
        fireEvent.change(searchInput, { target: { value: 'test search' } });

        // Wait for component to update
        await waitFor(() => {
            expect(screen.getByText('Search result post')).toBeInTheDocument();
            expect(screen.queryByText('Regular post')).not.toBeInTheDocument();
        });
    });

    it('shows loading indicator during search', async () => {
        // Configure the mocks for this test
        mockGetPosts.mockReturnValue({
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
        mockSearchPosts.mockReturnValue({
            data: null,
            isFetching: true
        });

        render(<Explore />);

        // Enter search text
        const searchInput = screen.getByPlaceholderText('Search');
        fireEvent.change(searchInput, { target: { value: 'test search' } });

        // Wait for component to update
        await waitFor(() => {
            expect(screen.getByTestId('loader')).toBeInTheDocument();
        });
    });

    it('shows "No results found" when search returns empty results', async () => {
        // Configure the mocks for this test
        mockGetPosts.mockReturnValue({
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
        mockSearchPosts.mockReturnValue({
            data: { documents: [] },
            isFetching: false
        });

        render(<Explore />);

        // Enter search text
        const searchInput = screen.getByPlaceholderText('Search');
        fireEvent.change(searchInput, { target: { value: 'test search' } });

        // Wait for component to update
        await waitFor(() => {
            expect(screen.getByText('No results found')).toBeInTheDocument();
        });
    });
});