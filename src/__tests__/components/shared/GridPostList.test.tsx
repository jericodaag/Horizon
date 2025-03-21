import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import GridPostList from '@/components/shared/GridPostList';
import { useUserContext } from '@/context/AuthContext';
import { Models } from 'appwrite';

// Unmock the component we're testing
jest.unmock('@/components/shared/GridPostList');

// Mock dependencies
jest.mock('react-router-dom', () => ({
    Link: ({ children, to, className }) => (
        <a href={to} className={className} data-testid={`link-to-${to}`}>
            {children}
        </a>
    )
}));

jest.mock('@/context/AuthContext', () => ({
    useUserContext: jest.fn()
}));

jest.mock('@/components/shared/PostStats', () => ({
    __esModule: true,
    default: ({ post, userId, isGridView }) => (
        <div data-testid={`post-stats-${post.$id}`} data-user-id={userId} data-is-grid-view={isGridView}>
            Post Stats
        </div>
    )
}));

describe('GridPostList Component', () => {
    // Setup mock data
    const mockPosts: Models.Document[] = [
        {
            $id: 'post-1',
            $createdAt: '2023-01-01T00:00:00.000Z',
            $updatedAt: '2023-01-01T00:00:00.000Z',
            $permissions: [],
            $collectionId: 'posts',
            $databaseId: 'database',
            imageUrl: '/test-image-1.jpg',
            creator: {
                $id: 'user-1',
                name: 'Test User 1',
                imageUrl: '/test-user-1.jpg'
            }
        },
        {
            $id: 'post-2',
            $createdAt: '2023-01-02T00:00:00.000Z',
            $updatedAt: '2023-01-02T00:00:00.000Z',
            $permissions: [],
            $collectionId: 'posts',
            $databaseId: 'database',
            imageUrl: '/test-image-2.jpg',
            creator: {
                $id: 'user-2',
                name: 'Test User 2',
                imageUrl: null
            }
        }
    ];

    const mockUser = {
        id: 'current-user',
        name: 'Current User',
        email: 'user@example.com',
        username: 'currentuser',
        imageUrl: '/current-user.jpg',
        bio: 'Test bio'
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useUserContext as jest.Mock).mockReturnValue({ user: mockUser });
    });

    it('renders a list of posts in a grid', () => {
        render(<GridPostList posts={mockPosts} />);

        // Check if it renders the correct number of posts
        const postItems = screen.getAllByRole('listitem');
        expect(postItems).toHaveLength(2);

        // Check if post images are rendered correctly
        const postImages = screen.getAllByAltText('post');
        expect(postImages[0]).toHaveAttribute('src', '/test-image-1.jpg');
        expect(postImages[1]).toHaveAttribute('src', '/test-image-2.jpg');

        // Check if links are correctly set
        expect(screen.getByTestId('link-to-/posts/post-1')).toBeInTheDocument();
        expect(screen.getByTestId('link-to-/posts/post-2')).toBeInTheDocument();
    });

    it('displays user information when showUser is true', () => {
        render(<GridPostList posts={mockPosts} showUser={true} />);

        // Check if user images and names are displayed
        const creatorImages = screen.getAllByAltText('creator');
        expect(creatorImages).toHaveLength(2);
        expect(creatorImages[0]).toHaveAttribute('src', '/test-user-1.jpg');

        // Check for user names
        expect(screen.getByText('Test User 1')).toBeInTheDocument();
        expect(screen.getByText('Test User 2')).toBeInTheDocument();
    });

    it('uses placeholder image when creator image is not available', () => {
        render(<GridPostList posts={mockPosts} showUser={true} />);

        const creatorImages = screen.getAllByAltText('creator');
        // The second user has no image, should use placeholder
        expect(creatorImages[1]).toHaveAttribute('src', '/assets/icons/profile-placeholder.svg');
    });

    it('hides user information when showUser is false', () => {
        render(<GridPostList posts={mockPosts} showUser={false} />);

        // User information should not be visible
        expect(screen.queryByAltText('creator')).not.toBeInTheDocument();
        expect(screen.queryByText('Test User 1')).not.toBeInTheDocument();
        expect(screen.queryByText('Test User 2')).not.toBeInTheDocument();
    });

    it('displays post stats when showStats is true', () => {
        render(<GridPostList posts={mockPosts} showStats={true} />);

        // PostStats should be rendered for each post
        expect(screen.getByTestId('post-stats-post-1')).toBeInTheDocument();
        expect(screen.getByTestId('post-stats-post-2')).toBeInTheDocument();

        // Check if correct props are passed to PostStats
        const postStats1 = screen.getByTestId('post-stats-post-1');
        expect(postStats1).toHaveAttribute('data-user-id', 'current-user');
        expect(postStats1).toHaveAttribute('data-is-grid-view', 'true');
    });

    it('hides post stats when showStats is false', () => {
        render(<GridPostList posts={mockPosts} showStats={false} />);

        // PostStats should not be rendered
        expect(screen.queryByTestId('post-stats-post-1')).not.toBeInTheDocument();
        expect(screen.queryByTestId('post-stats-post-2')).not.toBeInTheDocument();
    });

    it('renders correctly with both showUser and showStats as false', () => {
        render(<GridPostList posts={mockPosts} showUser={false} showStats={false} />);

        // Should still render the posts but without user info or stats
        expect(screen.getAllByRole('listitem')).toHaveLength(2);
        expect(screen.getAllByAltText('post')).toHaveLength(2);

        // User information should not be visible
        expect(screen.queryByAltText('creator')).not.toBeInTheDocument();

        // PostStats should not be rendered
        expect(screen.queryByTestId('post-stats-post-1')).not.toBeInTheDocument();
    });

    it('handles empty posts array', () => {
        render(<GridPostList posts={[]} />);

        // Should render an empty list
        expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
    });
});