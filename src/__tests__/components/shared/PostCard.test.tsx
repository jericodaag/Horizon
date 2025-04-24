import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PostCard from '@/components/shared/PostCard';
import { BrowserRouter } from 'react-router-dom';
import * as AuthContext from '@/context/AuthContext';
import { databases } from '@/lib/appwrite/config';

jest.mock('@/lib/appwrite/config', () => ({
    databases: {
        listDocuments: jest.fn(),
        getDocument: jest.fn()
    },
    appwriteConfig: {
        databaseId: 'test-db',
        commentsCollectionId: 'test-comments',
        userCollectionId: 'test-users'
    }
}));

jest.mock('@/components/shared/PostStats', () => ({
    __esModule: true,
    default: () => <div data-testid="post-stats">Post Stats Component</div>
}));

jest.mock('@/components/shared/TranslateButton', () => ({
    __esModule: true,
    default: ({ text }) => (
        <button data-testid="translate-button">Translate: {text.slice(0, 10)}...</button>
    )
}));

jest.mock('@/context/AuthContext', () => ({
    useUserContext: jest.fn()
}));

describe('PostCard Component', () => {
    const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        imageUrl: '/assets/icons/profile-placeholder.svg',
        username: 'testuser',
        name: 'Test User',
        bio: 'Test bio'
    };

    const mockPost = {
        $id: 'post-123',
        $createdAt: '2023-01-01T12:00:00.000Z',
        $updatedAt: '2023-01-01T12:00:00.000Z',
        $permissions: [],
        $collectionId: 'posts',
        $databaseId: 'database',
        caption: 'This is a test post caption',
        imageUrl: 'https://example.com/image.jpg',
        location: 'Test Location',
        tags: ['test', 'unit', 'jest'],
        creator: {
            $id: 'user-123',
            name: 'Creator Name',
            username: 'creator',
            imageUrl: 'https://example.com/creator.jpg'
        },
        likes: ['user-1', 'user-2']
    };

    beforeEach(() => {
        jest.clearAllMocks();

        jest.mocked(AuthContext.useUserContext).mockReturnValue({
            user: mockUser,
            isLoading: false,
            isAuthenticated: true,
            setUser: jest.fn(),
            setIsAuthenticated: jest.fn(),
            checkAuthUser: jest.fn().mockResolvedValue(true)
        });

        jest.mocked(databases.listDocuments).mockResolvedValue({
            documents: [],
            total: 0
        });
    });

    it('renders the post with caption and creator username', () => {
        render(
            <BrowserRouter>
                <PostCard post={mockPost} />
            </BrowserRouter>
        );

        const postCard = screen.getByTestId(`post-card-${mockPost.$id}`);
        expect(postCard).toBeInTheDocument();

        expect(screen.getByText(mockPost.caption)).toBeInTheDocument();

        expect(screen.getByText(`By: ${mockPost.creator.username}`)).toBeInTheDocument();
    });

    it('displays a different creator username when it changes', () => {
        const modifiedPost = {
            ...mockPost,
            creator: {
                ...mockPost.creator,
                username: 'different-creator'
            }
        };

        render(
            <BrowserRouter>
                <PostCard post={modifiedPost} />
            </BrowserRouter>
        );

        expect(screen.getByText(`By: different-creator`)).toBeInTheDocument();
    });

    it('renders "Unknown" when post has no creator username', () => {
        const postWithoutCreatorUsername = {
            ...mockPost,
            creator: {
                ...mockPost.creator,
                username: null
            }
        };

        render(
            <BrowserRouter>
                <PostCard post={postWithoutCreatorUsername as any} />
            </BrowserRouter>
        );

        expect(screen.getByText('By: Unknown')).toBeInTheDocument();
    });

    it('does not display edit button for non-creator', () => {
        jest.mocked(AuthContext.useUserContext).mockReturnValue({
            user: { ...mockUser, id: 'different-user' },
            isLoading: false,
            isAuthenticated: true,
            setUser: jest.fn(),
            setIsAuthenticated: jest.fn(),
            checkAuthUser: jest.fn().mockResolvedValue(true)
        });

        render(
            <BrowserRouter>
                <PostCard post={mockPost} />
            </BrowserRouter>
        );

        expect(screen.queryByAltText('edit')).not.toBeInTheDocument();
    });
});