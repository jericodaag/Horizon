import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Saved from '@/_root/pages/Saved';

// Mock dependencies
jest.mock('@/lib/react-query/queries', () => ({
    useGetSavedPosts: jest.fn()
}));

jest.mock('@/context/AuthContext', () => ({
    useUserContext: () => ({
        user: {
            id: 'user123',
            name: 'Test User',
            username: 'testuser',
            email: 'test@example.com',
            imageUrl: 'https://example.com/avatar.jpg'
        }
    })
}));

jest.mock('@/components/shared/GridPostList', () => ({
    __esModule: true,
    default: ({ posts, showUser, showStats }: any) => (
        <div
            data-testid="grid-post-list"
            data-showuser={showUser}
            data-showstats={showStats}
        >
            {posts.map((post: any) => (
                <div key={post.$id || post.id} data-testid={`post-${post.$id || post.id}`}>
                    {post.caption || 'Post content'}
                </div>
            ))}
        </div>
    )
}));

jest.mock('@/components/shared/Loader', () => ({
    __esModule: true,
    default: () => <div data-testid="loader">Loading...</div>
}));

// Import the mocked module to control its behavior
import { useGetSavedPosts } from '@/lib/react-query/queries';

describe('Saved Component', () => {
    // Mock saved posts data
    const mockSavedPosts = [
        {
            $id: 'post1',
            caption: 'Test post 1',
            imageUrl: 'https://example.com/post1.jpg',
            creator: { $id: 'user2', name: 'Other User' }
        },
        {
            $id: 'post2',
            caption: 'Test post 2',
            imageUrl: 'https://example.com/post2.jpg',
            creator: { $id: 'user3', name: 'Another User' }
        }
    ];

    beforeEach(() => {
        jest.clearAllMocks();

        // Default mock implementation
        (useGetSavedPosts as jest.Mock).mockReturnValue({
            data: mockSavedPosts,
            isLoading: false
        });
    });

    it('renders the saved posts page with title', () => {
        render(<Saved />);

        // Check for the title
        expect(screen.getByText('Saved Posts')).toBeInTheDocument();

        // Check for the save icon
        const saveIcon = screen.getByAltText('save');
        expect(saveIcon).toBeInTheDocument();
        expect(saveIcon).toHaveAttribute('src', '/assets/icons/save.svg');
    });

    it('shows loading state when fetching saved posts', () => {
        // Mock loading state
        (useGetSavedPosts as jest.Mock).mockReturnValue({
            data: null,
            isLoading: true
        });

        render(<Saved />);

        // Check for loader
        expect(screen.getByTestId('loader')).toBeInTheDocument();

        // Saved posts title should not be visible during loading
        expect(screen.queryByText('Saved Posts')).not.toBeInTheDocument();
    });

    it('displays saved posts when data is loaded', () => {
        render(<Saved />);

        // Check if grid post list is rendered
        const gridPostList = screen.getByTestId('grid-post-list');
        expect(gridPostList).toBeInTheDocument();

        // Check that it passes the correct props
        expect(gridPostList).toHaveAttribute('data-showuser', 'true');
        expect(gridPostList).toHaveAttribute('data-showstats', 'true');

        // Check that at least one post is rendered inside the grid
        // We're using a more specific selector to avoid counting the posts that might appear elsewhere 
        const specificPost = screen.getByTestId('post-post1');
        expect(specificPost).toBeInTheDocument();
        expect(screen.getByTestId('post-post2')).toBeInTheDocument();
    });

    it('shows empty state when no saved posts', () => {
        // Mock empty saved posts
        (useGetSavedPosts as jest.Mock).mockReturnValue({
            data: [],
            isLoading: false
        });

        render(<Saved />);

        // Check for empty state message
        expect(screen.getByText('No saved posts yet')).toBeInTheDocument();

        // Check for the larger save icon in empty state
        const emptyStateIcon = screen.getAllByAltText('save')[1]; // The second save icon is the empty state one
        expect(emptyStateIcon).toBeInTheDocument();
        expect(emptyStateIcon).toHaveAttribute('width', '72');
        expect(emptyStateIcon).toHaveClass('opacity-50');

        // Grid post list should not be rendered
        expect(screen.queryByTestId('grid-post-list')).not.toBeInTheDocument();
    });

    it('passes the correct user id to useGetSavedPosts', () => {
        render(<Saved />);

        // Check if the hook was called with the correct user ID
        expect(useGetSavedPosts).toHaveBeenCalledWith('user123');
    });

    it('handles null data response correctly', () => {
        // Mock null data response (different from empty array)
        (useGetSavedPosts as jest.Mock).mockReturnValue({
            data: null,
            isLoading: false
        });

        render(<Saved />);

        // Should show empty state
        expect(screen.getByText('No saved posts yet')).toBeInTheDocument();
    });
});