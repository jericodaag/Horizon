import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CommentSection from '@/components/shared/CommentSection';

// Mock required components
jest.mock('@/components/shared/GiphyPicker', () => ({
    __esModule: true,
    default: ({ onGifSelect, onClose }: any) => (
        <div data-testid="giphy-picker">
            <button onClick={() => onGifSelect('https://giphy.com/test.gif', 'test-gif')}>
                Select GIF
            </button>
            <button onClick={onClose}>Close</button>
        </div>
    )
}));

jest.mock('@/components/shared/TranslateComment', () => ({
    __esModule: true,
    default: ({ comment }: any) => (
        <div data-testid={`translate-comment-${comment.$id}`}>
            {comment.content}
        </div>
    )
}));

jest.mock('@/components/shared/DeleteConfirmationModal', () => ({
    __esModule: true,
    default: ({ isOpen, onClose, onConfirm, title, description }: any) => (
        isOpen ? (
            <div data-testid="delete-modal">
                <h2>{title}</h2>
                <p>{description}</p>
                <button onClick={onClose}>Cancel</button>
                <button onClick={onConfirm}>Confirm</button>
            </div>
        ) : null
    )
}));

// Mock appwrite database functions
jest.mock('@/lib/appwrite/config', () => {
    const mockListDocuments = jest.fn().mockImplementation(() => Promise.resolve({
        documents: [
            {
                $id: 'comment1',
                userId: 'user1',
                postId: 'post123',
                content: 'Test comment 1',
                createdAt: '2023-06-01T10:00:00.000Z',
                likes: ['user2'],
                $createdAt: '2023-06-01T10:00:00.000Z'
            },
            {
                $id: 'comment2',
                userId: 'user2',
                postId: 'post123',
                content: 'Test comment 2',
                createdAt: '2023-06-02T11:00:00.000Z',
                likes: [],
                $createdAt: '2023-06-02T11:00:00.000Z'
            }
        ]
    }));

    const mockGetDocument = jest.fn().mockImplementation((id) => {
        if (id === 'user1') {
            return Promise.resolve({
                $id: 'user1',
                name: 'User One',
                username: 'userone',
                imageUrl: '/user1.jpg'
            });
        } else if (id === 'user2') {
            return Promise.resolve({
                $id: 'user2',
                name: 'User Two',
                username: 'usertwo',
                imageUrl: '/user2.jpg'
            });
        }

        throw new Error('User not found');
    });

    const mockCreateDocument = jest.fn().mockImplementation(() => Promise.resolve({
        $id: 'newcomment',
        userId: 'currentUser',
        postId: 'post123',
        content: 'New comment',
        createdAt: new Date().toISOString(),
        likes: []
    }));

    const mockUpdateDocument = jest.fn().mockImplementation(() => Promise.resolve({
        success: true
    }));

    const mockDeleteDocument = jest.fn().mockImplementation(() => Promise.resolve({
        success: true
    }));

    return {
        appwriteConfig: {
            databaseId: 'testDatabase',
            userCollectionId: 'users',
            commentsCollectionId: 'comments'
        },
        databases: {
            listDocuments: mockListDocuments,
            getDocument: mockGetDocument,
            createDocument: mockCreateDocument,
            updateDocument: mockUpdateDocument,
            deleteDocument: mockDeleteDocument
        }
    };
});

// Mock react-query
jest.mock('@tanstack/react-query', () => ({
    useQueryClient: () => ({
        invalidateQueries: jest.fn()
    })
}));

// Mock auth context
jest.mock('@/context/AuthContext', () => ({
    useUserContext: () => ({
        user: {
            id: 'currentUser',
            $id: 'currentUser',
            name: 'Current User',
            username: 'currentuser',
            imageUrl: '/current-user.jpg'
        }
    })
}));

// Mock ID.unique()
jest.mock('appwrite', () => ({
    ID: {
        unique: jest.fn().mockReturnValue('new-comment-id')
    },
    Query: {
        equal: jest.fn(),
        orderDesc: jest.fn()
    }
}));

describe('CommentSection Component', () => {
    const postId = 'post123';
    const postCreatorId = 'user1';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders loading state initially', async () => {
        render(<CommentSection postId={postId} postCreatorId={postCreatorId} />);

        // Check if loader is displayed initially (would be a Loader component)
        const loader = screen.getByText('Loading...');
        expect(loader).toBeInTheDocument();

        // Wait for comments to load
        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });
    });

    it('renders the comment form', async () => {
        render(<CommentSection postId={postId} postCreatorId={postCreatorId} />);

        // Check if comment input and post button are present
        expect(screen.getByPlaceholderText('Write a comment...')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Post' })).toBeInTheDocument();

        // Wait for comments to load
        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });

        // Post button should be disabled initially (empty comment)
        expect(screen.getByRole('button', { name: 'Post' })).toBeDisabled();
    });

    it('enables post button when comment text is entered', async () => {
        render(<CommentSection postId={postId} postCreatorId={postCreatorId} />);

        // Enter some text in the comment input
        const commentInput = screen.getByPlaceholderText('Write a comment...');
        fireEvent.change(commentInput, { target: { value: 'Test comment' } });

        // Wait for comments to load
        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });

        // Post button should be enabled
        expect(screen.getByRole('button', { name: 'Post' })).not.toBeDisabled();
    });

    it('renders comments after loading', async () => {
        render(<CommentSection postId={postId} postCreatorId={postCreatorId} />);

        // Wait for comments to load
        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });

        // Check if comments are displayed
        expect(screen.getByText('Test comment 1')).toBeInTheDocument();
        expect(screen.getByText('Test comment 2')).toBeInTheDocument();

        // Check if user names are displayed
        expect(screen.getByText('User One')).toBeInTheDocument();
        expect(screen.getByText('User Two')).toBeInTheDocument();
    });

    it('submits a new comment when form is submitted', async () => {
        const { databases } = require('@/lib/appwrite/config');

        render(<CommentSection postId={postId} postCreatorId={postCreatorId} />);

        // Wait for comments to load
        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });

        // Enter some text in the comment input
        const commentInput = screen.getByPlaceholderText('Write a comment...');
        fireEvent.change(commentInput, { target: { value: 'New test comment' } });

        // Submit the form
        const postButton = screen.getByRole('button', { name: 'Post' });
        fireEvent.click(postButton);

        // Check if createDocument was called with correct parameters
        await waitFor(() => {
            expect(databases.createDocument).toHaveBeenCalledWith(
                'testDatabase',
                'comments',
                expect.any(String),
                expect.objectContaining({
                    postId: 'post123',
                    content: 'New test comment',
                    userId: 'currentUser'
                })
            );
        });

        // Input should be cleared after submission
        expect(commentInput).toHaveValue('');
    });

    it('opens gif picker when gif button is clicked', async () => {
        render(<CommentSection postId={postId} postCreatorId={postCreatorId} />);

        // Wait for comments to load
        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });

        // Find and click the gif button
        const gifButton = screen.getByTitle('Add a GIF');
        fireEvent.click(gifButton);

        // GIF picker should be displayed
        expect(screen.getByTestId('giphy-picker')).toBeInTheDocument();
    });

    it('adds a gif when one is selected from the picker', async () => {
        render(<CommentSection postId={postId} postCreatorId={postCreatorId} />);

        // Wait for comments to load
        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });

        // Open GIF picker
        const gifButton = screen.getByTitle('Add a GIF');
        fireEvent.click(gifButton);

        // Select a GIF
        const selectGifButton = screen.getByText('Select GIF');
        fireEvent.click(selectGifButton);

        // GIF picker should be closed
        expect(screen.queryByTestId('giphy-picker')).not.toBeInTheDocument();

        // GIF preview should be displayed
        const gifPreview = screen.getByAltText('Selected GIF');
        expect(gifPreview).toBeInTheDocument();
        expect(gifPreview).toHaveAttribute('src', 'https://giphy.com/test.gif');

        // Post button should be enabled (even with no text)
        expect(screen.getByRole('button', { name: 'Post' })).not.toBeDisabled();
    });

    it('removes a selected gif when the remove button is clicked', async () => {
        render(<CommentSection postId={postId} postCreatorId={postCreatorId} />);

        // Wait for comments to load
        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });

        // Open GIF picker
        const gifButton = screen.getByTitle('Add a GIF');
        fireEvent.click(gifButton);

        // Select a GIF
        const selectGifButton = screen.getByText('Select GIF');
        fireEvent.click(selectGifButton);

        // GIF preview should be displayed
        expect(screen.getByAltText('Selected GIF')).toBeInTheDocument();

        // Click the remove button
        const removeButton = screen.getByRole('button', { name: 'X' });
        fireEvent.click(removeButton);

        // GIF preview should be removed
        expect(screen.queryByAltText('Selected GIF')).not.toBeInTheDocument();
    });

    it('shows delete option for current user\'s comments', async () => {
        // Mock current user to be the author of comment1
        jest.spyOn(require('@/context/AuthContext'), 'useUserContext').mockReturnValue({
            user: {
                id: 'user1',
                $id: 'user1',
                name: 'User One',
                username: 'userone',
                imageUrl: '/user1.jpg'
            }
        });

        render(<CommentSection postId={postId} postCreatorId={postCreatorId} />);

        // Wait for comments to load
        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });

        // Should find delete buttons for own comments
        const deleteButtons = screen.getAllByText('Delete');
        expect(deleteButtons.length).toBeGreaterThan(0);
    });

    it('opens delete confirmation when delete is clicked', async () => {
        // Mock current user to be the author of comment1
        jest.spyOn(require('@/context/AuthContext'), 'useUserContext').mockReturnValue({
            user: {
                id: 'user1',
                $id: 'user1',
                name: 'User One',
                username: 'userone',
                imageUrl: '/user1.jpg'
            }
        });

        render(<CommentSection postId={postId} postCreatorId={postCreatorId} />);

        // Wait for comments to load
        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });

        // Click delete button for a comment
        const deleteButtons = screen.getAllByText('Delete');
        fireEvent.click(deleteButtons[0]);

        // Delete confirmation modal should be displayed
        expect(screen.getByTestId('delete-modal')).toBeInTheDocument();
    });

    it('deletes a comment when confirmation is given', async () => {
        const { databases } = require('@/lib/appwrite/config');

        // Mock current user to be the author of comment1
        jest.spyOn(require('@/context/AuthContext'), 'useUserContext').mockReturnValue({
            user: {
                id: 'user1',
                $id: 'user1',
                name: 'User One',
                username: 'userone',
                imageUrl: '/user1.jpg'
            }
        });

        render(<CommentSection postId={postId} postCreatorId={postCreatorId} />);

        // Wait for comments to load
        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });

        // Click delete button for a comment
        const deleteButtons = screen.getAllByText('Delete');
        fireEvent.click(deleteButtons[0]);

        // Click confirm in the delete modal
        fireEvent.click(screen.getByText('Confirm'));

        // Check if deleteDocument was called
        await waitFor(() => {
            expect(databases.deleteDocument).toHaveBeenCalledWith(
                'testDatabase',
                'comments',
                'comment1'
            );
        });
    });

    it('shows like button for comments', async () => {
        render(<CommentSection postId={postId} postCreatorId={postCreatorId} />);

        // Wait for comments to load
        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });

        // Check if like buttons are present
        const likeButtons = screen.getAllByText(/Like|Liked/);
        expect(likeButtons.length).toBe(2); // One for each comment

        // Comment with likes should show the count
        expect(screen.getByText('(1)')).toBeInTheDocument();
    });

    it('toggles like when like button is clicked', async () => {
        const { databases } = require('@/lib/appwrite/config');

        render(<CommentSection postId={postId} postCreatorId={postCreatorId} />);

        // Wait for comments to load
        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });

        // Find like button for second comment (not liked yet)
        const likeButtons = screen.getAllByText(/^Like$/);
        fireEvent.click(likeButtons[0]);

        // Check if updateDocument was called to add the like
        await waitFor(() => {
            expect(databases.updateDocument).toHaveBeenCalledWith(
                'testDatabase',
                'comments',
                expect.any(String),
                expect.objectContaining({
                    likes: expect.arrayContaining(['currentUser'])
                })
            );
        });
    });

    it('shows empty state when there are no comments', async () => {
        // Mock empty comments list
        const { databases } = require('@/lib/appwrite/config');
        databases.listDocuments.mockImplementationOnce(() => Promise.resolve({
            documents: []
        }));

        render(<CommentSection postId={postId} postCreatorId={postCreatorId} />);

        // Wait for comments to load
        await waitFor(() => {
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });

        // Check if empty state message is displayed
        expect(screen.getByText('No comments yet. Be the first to comment!')).toBeInTheDocument();
    });
});