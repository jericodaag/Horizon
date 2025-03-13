import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Saved from '@/_root/pages/Saved';

// Mock the context and query hooks
jest.mock('@/context/AuthContext', () => ({
    useUserContext: jest.fn()
}));

jest.mock('@/lib/react-query/queries', () => ({
    useGetSavedPosts: jest.fn()
}));

// Mock the components
jest.mock('@/components/shared/Loader', () => ({
    __esModule: true,
    default: () => <div data-testid="loader">Loading...</div>
}));

jest.mock('@/components/shared/GridPostList', () => ({
    __esModule: true,
    default: ({ posts, showUser, showStats }: any) => (
        <div
            data-testid="grid-post-list"
            data-show-user={showUser}
            data-show-stats={showStats}
        >
            {posts.map((post: any) => (
                <div key={post.$id} data-testid={`post-${post.$id}`}>
                    {post.caption}
                </div>
            ))}
        </div>
    )
}));

// Import mocked modules
import { useUserContext } from '@/context/AuthContext';
import { useGetSavedPosts } from '@/lib/react-query/queries';

describe('Saved Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Default mock for user context
        (useUserContext as jest.Mock).mockReturnValue({
            user: { id: 'user123' }
        });
    });

    it('shows loader when fetching saved posts', () => {
        // Mock loading state
        (useGetSavedPosts as jest.Mock).mockReturnValue({
            data: null,
            isLoading: true
        });

        render(<Saved />);

        // Check for loader
        expect(screen.getByTestId('loader')).toBeInTheDocument();
    });

    it('shows empty state when no saved posts exist', () => {
        // Mock empty saved posts
        (useGetSavedPosts as jest.Mock).mockReturnValue({
            data: [],
            isLoading: false
        });

        render(<Saved />);

        // Check for empty state message
        expect(screen.getByText('No saved posts yet')).toBeInTheDocument();

        // Check for the empty state icon
        const emptyIcon = screen.getAllByAltText('save')[1]; // Second save icon (empty state)
        expect(emptyIcon).toBeInTheDocument();
        expect(emptyIcon).toHaveAttribute('width', '72');
    });

    it('renders saved posts when they exist', () => {
        // Mock saved posts data
        const mockSavedPosts = [
            { $id: 'post1', caption: 'First saved post' },
            { $id: 'post2', caption: 'Second saved post' }
        ];

        (useGetSavedPosts as jest.Mock).mockReturnValue({
            data: mockSavedPosts,
            isLoading: false
        });

        render(<Saved />);

        // Check for page title
        expect(screen.getByText('Saved Posts')).toBeInTheDocument();

        // Check that GridPostList is rendered with correct props
        const gridPostList = screen.getByTestId('grid-post-list');
        expect(gridPostList).toBeInTheDocument();
        expect(gridPostList).toHaveAttribute('data-show-user', 'true');
        expect(gridPostList).toHaveAttribute('data-show-stats', 'true');

        // Check for saved posts
        expect(screen.getByText('First saved post')).toBeInTheDocument();
        expect(screen.getByText('Second saved post')).toBeInTheDocument();
    });
});