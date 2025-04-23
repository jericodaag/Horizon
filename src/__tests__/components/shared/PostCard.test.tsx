import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PostCard from '@/components/shared/PostCard';
import { useUserContext } from '@/context/AuthContext';
import { formatDateString } from '@/lib/utils';
import { databases } from '@/lib/appwrite/config';
import { BrowserRouter } from 'react-router-dom';
import { Models } from 'appwrite';

// Mock dependencies
jest.mock('@/context/AuthContext', () => ({
    useUserContext: jest.fn()
})); jest.mock('@/lib/utils', () => ({
    formatDateString: jest.fn().mockReturnValue('January 1, 2023')
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
    default: () => <div data-testid="post-stats">Post Stats Component</div>
}));
jest.mock('@/components/shared/TranslateButton', () => ({
    __esModule: true,
    default: ({ text }) => <div data-testid="translate-button">Translate: {text}</div>
}));

// Mock sample data - create proper Appwrite Document structure
const createMockPost = (overrides = {}): Models.Document => {
    return {
        $id: 'post-1',
        $createdAt: '2023-01-01T00:00:00.000Z',
        $updatedAt: '2023-01-01T00:00:00.000Z',
        $permissions: [],
        $collectionId: 'posts',
        $databaseId: 'test-db',
        caption: 'This is a test post',
        imageUrl: 'https://example.com/image.jpg',
        location: 'New York',
        tags: ['test', 'example'],
        creator: {
            $id: 'user-1',
            name: 'John Doe',
            username: 'johndoe',
            imageUrl: 'https://example.com/avatar.jpg'
        },
        ...overrides
    };
};

const mockComments = {
    total: 2,
    documents: [
        {
            $id: 'comment-1',
            $createdAt: '2023-01-02T00:00:00.000Z',
            $updatedAt: '2023-01-02T00:00:00.000Z',
            $permissions: [],
            $collectionId: 'comments',
            $databaseId: 'test-db',
            userId: 'user-2',
            postId: 'post-1',
            content: 'This is a test comment',
            likes: [],
            gifUrl: null,
            gifId: null
        }
    ]
};

const mockUser = {
    $id: 'user-2',
    $createdAt: '2023-01-01T00:00:00.000Z',
    $updatedAt: '2023-01-01T00:00:00.000Z',
    $permissions: [],
    $collectionId: 'users',
    $databaseId: 'test-db',
    name: 'Jane Smith',
    username: 'janesmith',
    imageUrl: 'https://example.com/jane-avatar.jpg'
};

// Helper to setup component with appropriate wrappers
const renderPostCard = (postOverrides = {}, currentUserId = 'user-2') => {
    (useUserContext as jest.Mock).mockReturnValue({ user: { id: currentUserId } });

    const post = createMockPost(postOverrides);

    return render(
        <BrowserRouter>
            <PostCard post={post} />
        </BrowserRouter>
    );
};

describe('PostCard Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Setup database mocks
        (databases.listDocuments as jest.Mock).mockResolvedValue(mockComments);
        (databases.getDocument as jest.Mock).mockResolvedValue(mockUser);
    });

    it('renders post creator information correctly', async () => {
        renderPostCard();

        // Check creator info
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('January 1, 2023')).toBeInTheDocument();
        expect(formatDateString).toHaveBeenCalledWith('2023-01-01T00:00:00.000Z');

        // Check location
        expect(screen.getByText('New York')).toBeInTheDocument();
    });

    it('renders post content correctly', async () => {
        renderPostCard();

        // Check caption
        expect(screen.getByTestId('translate-button')).toHaveTextContent('Translate: This is a test post');

        // Check tags
        expect(screen.getByText('#test')).toBeInTheDocument();
        expect(screen.getByText('#example')).toBeInTheDocument();

        // Check image
        const image = screen.getByAltText('post image');
        expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
    });

    it('shows edit button only when current user is the post creator', async () => {
        // Render with current user as post creator
        renderPostCard({}, 'user-1');

        const editButton = screen.getByAltText('edit');
        expect(editButton).toBeInTheDocument();

        // Re-render with different user
        renderPostCard({}, 'user-2');

        expect(screen.queryByAltText('edit')).not.toBeInTheDocument();
    });

    it('renders comments section correctly', async () => {
        renderPostCard();

        // Wait for comments to load
        await waitFor(() => {
            expect(databases.listDocuments).toHaveBeenCalledWith(
                'test-db',
                'test-comments',
                expect.any(Array)
            );
        });

        // Check comments link text
        expect(screen.getByText('View all 2 comments')).toBeInTheDocument();

        // Check comment content
        await waitFor(() => {
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
            expect(screen.getByText('This is a test comment')).toBeInTheDocument();
        });
    });

    it('handles post without image', async () => {
        renderPostCard({ imageUrl: '' });

        expect(screen.queryByAltText('post image')).not.toBeInTheDocument();
    });

    it('handles post without location', async () => {
        renderPostCard({ location: '' });

        expect(screen.queryByText('New York')).not.toBeInTheDocument();
    });

    it('handles post without tags', async () => {
        renderPostCard({ tags: [] });

        expect(screen.queryByText('#test')).not.toBeInTheDocument();
        expect(screen.queryByText('#example')).not.toBeInTheDocument();
    });

    it('handles post without comments', async () => {
        (databases.listDocuments as jest.Mock).mockResolvedValue({ total: 0, documents: [] });

        renderPostCard();

        await waitFor(() => {
            expect(screen.queryByText(/View all/)).not.toBeInTheDocument();
        });
    });

    it('handles post with exactly one comment', async () => {
        (databases.listDocuments as jest.Mock).mockResolvedValue({
            total: 1,
            documents: [mockComments.documents[0]]
        });

        renderPostCard();

        await waitFor(() => {
            expect(screen.getByText('View 1 comment')).toBeInTheDocument();
        });
    });

    it('handles comment with GIF', async () => {
        const commentsWithGif = {
            total: 1,
            documents: [{
                ...mockComments.documents[0],
                gifUrl: 'https://example.com/gif.gif',
                gifId: 'gif-123'
            }]
        };

        (databases.listDocuments as jest.Mock).mockResolvedValue(commentsWithGif);

        renderPostCard();

        await waitFor(() => {
            const gifImage = screen.getByAltText('GIF comment');
            expect(gifImage).toBeInTheDocument();
            expect(gifImage).toHaveAttribute('src', 'https://example.com/gif.gif');
        });
    });

    it('handles error when fetching comments', async () => {
        (databases.listDocuments as jest.Mock).mockRejectedValue(new Error('Failed to fetch comments'));

        // We should still be able to render the component without comments
        renderPostCard();

        await waitFor(() => {
            // Component should still render without crashing
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.queryByText(/View all/)).not.toBeInTheDocument();
        });
    });
});