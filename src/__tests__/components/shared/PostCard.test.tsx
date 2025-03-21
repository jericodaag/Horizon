import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PostCard from '@/components/shared/PostCard';
import { useUserContext } from '@/context/AuthContext';
import { Models } from 'appwrite';
import { databases } from '@/lib/appwrite/config';

// Unmock the component we're testing
jest.unmock('@/components/shared/PostCard');

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

jest.mock('@/lib/utils', () => ({
    formatDateString: jest.fn(() => 'Jan 1, 2023')
}));

jest.mock('@/lib/appwrite/config', () => ({
    appwriteConfig: {
        databaseId: 'test-db',
        commentsCollectionId: 'test-comments',
        userCollectionId: 'test-users'
    },
    databases: {
        listDocuments: jest.fn(),
        getDocument: jest.fn()
    }
}));

jest.mock('@/components/shared/PostStats', () => ({
    __esModule: true,
    default: ({ post, userId }) => (
        <div data-testid={`post-stats-${post.$id}`} data-user-id={userId}>
            Post Stats
        </div>
    )
}));

jest.mock('@/components/shared/TranslateButton', () => ({
    __esModule: true,
    default: ({ text }) => (
        <button data-testid="translate-button" data-text={text}>
            Translate
        </button>
    )
}));

describe('PostCard Component', () => {
    // Mock data
    const mockPost: Models.Document = {
        $id: 'post-1',
        $createdAt: '2023-01-01T00:00:00.000Z',
        $updatedAt: '2023-01-01T00:00:00.000Z',
        $permissions: [],
        $collectionId: 'posts',
        $databaseId: 'database',
        caption: 'This is a test post',
        imageUrl: '/test-image.jpg',
        location: 'Test Location',
        tags: ['test', 'sample'],
        creator: {
            $id: 'user-1',
            name: 'Test User',
            username: 'testuser',
            imageUrl: '/test-user.jpg'
        }
    };

    const mockCurrentUser = {
        id: 'user-1', // Same as post creator for some tests
        name: 'Current User',
        email: 'test@example.com',
        username: 'currentuser',
        imageUrl: '/current-user.jpg',
        bio: 'Test bio'
    };

    // Mock comment data
    const mockComments = [
        {
            $id: 'comment-1',
            userId: 'user-2',
            postId: 'post-1',
            content: 'Great post!',
            createdAt: '2023-01-02T00:00:00Z',
            $createdAt: '2023-01-02T00:00:00Z',
            likes: []
        }
    ];

    const mockUserData = {
        $id: 'user-2',
        name: 'Commenter',
        username: 'commenter',
        imageUrl: '/commenter.jpg'
    };

    beforeEach(() => {
        jest.clearAllMocks();

        // Default mocks
        (useUserContext as jest.Mock).mockReturnValue({ user: mockCurrentUser });

        (databases.listDocuments as jest.Mock).mockResolvedValue({
            documents: mockComments,
            total: 1
        });

        (databases.getDocument as jest.Mock).mockResolvedValue(mockUserData);
    });

    it('renders the post with all its elements', async () => {
        render(<PostCard post={mockPost} />);

        // Check post creator info - use getAllByText for multiple elements and select the first one
        const creatorElements = screen.getAllByText('Test User');
        expect(creatorElements[0]).toBeInTheDocument();
        expect(screen.getByText('Jan 1, 2023')).toBeInTheDocument();
        expect(screen.getByText('Test Location')).toBeInTheDocument();

        // Check post content
        expect(screen.getByAltText('post image')).toBeInTheDocument();
        expect(screen.getByAltText('post image')).toHaveAttribute('src', '/test-image.jpg');

        // Check post stats
        expect(screen.getByTestId(`post-stats-${mockPost.$id}`)).toBeInTheDocument();

        // Check tags
        expect(screen.getByText('#test')).toBeInTheDocument();
        expect(screen.getByText('#sample')).toBeInTheDocument();

        // Check translate button
        expect(screen.getByTestId('translate-button')).toHaveAttribute('data-text', 'This is a test post');

        // Wait for comments to load
        await waitFor(() => {
            expect(screen.getByText('View 1 comment')).toBeInTheDocument();
        });
    });

    it('shows edit button when the current user is the post creator', () => {
        render(<PostCard post={mockPost} />);

        // Edit button should be visible since mockCurrentUser.id === mockPost.creator.$id
        const editButton = screen.getByAltText('edit');
        expect(editButton).toBeInTheDocument();

        // Should link to update-post route
        const editLink = screen.getByTestId(`link-to-/update-post/${mockPost.$id}`);
        expect(editLink).toBeInTheDocument();
    });

    it('hides edit button when current user is not the post creator', () => {
        // Change current user to someone else
        (useUserContext as jest.Mock).mockReturnValue({
            user: { ...mockCurrentUser, id: 'different-user' }
        });

        render(<PostCard post={mockPost} />);

        // Edit button should not be visible
        expect(screen.queryByAltText('edit')).not.toBeInTheDocument();
        expect(screen.queryByTestId(`link-to-/update-post/${mockPost.$id}`)).not.toBeInTheDocument();
    });

    it('handles posts without location', () => {
        const postWithoutLocation = {
            ...mockPost,
            location: null
        };

        render(<PostCard post={postWithoutLocation} />);

        // Location should not be present
        expect(screen.queryByText('Test Location')).not.toBeInTheDocument();

        // Other content should still be visible - use getAllByText for multiple elements
        const creatorElements = screen.getAllByText('Test User');
        expect(creatorElements[0]).toBeInTheDocument();
    });

    it('displays comment with GIF correctly', async () => {
        // Mock comment with GIF
        const commentsWithGif = [
            {
                $id: 'comment-1',
                userId: 'user-2',
                postId: 'post-1',
                content: 'Check out this GIF',
                createdAt: '2023-01-02T00:00:00Z',
                $createdAt: '2023-01-02T00:00:00Z',
                likes: [],
                gifUrl: '/test-gif.gif',
                gifId: 'test-gif-id'
            }
        ];

        (databases.listDocuments as jest.Mock).mockResolvedValue({
            documents: commentsWithGif,
            total: 1
        });

        render(<PostCard post={mockPost} />);

        // Wait for comments to load
        await waitFor(() => {
            expect(screen.getByText('View 1 comment')).toBeInTheDocument();
        });

        // Check for GIF indicator
        await waitFor(() => {
            expect(screen.getByText('[GIF]')).toBeInTheDocument();
        });

        // Check for GIF image
        const gifImage = await screen.findByAltText('GIF comment');
        expect(gifImage).toBeInTheDocument();
        expect(gifImage).toHaveAttribute('src', '/test-gif.gif');
    });

    it('handles error fetching comments gracefully', async () => {
        // Mock error fetching comments
        (databases.listDocuments as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));

        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        render(<PostCard post={mockPost} />);

        // Wait for error to be logged
        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalled();
        });

        consoleErrorSpy.mockRestore();
    });

    it('renders nothing when post has no creator', () => {
        const postWithoutCreator = {
            ...mockPost,
            creator: null
        };

        const { container } = render(<PostCard post={postWithoutCreator} />);

        // Component should render nothing
        expect(container.firstChild).toBeNull();
    });
});
