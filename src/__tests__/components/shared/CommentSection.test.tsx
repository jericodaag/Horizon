import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CommentSection from '@/components/shared/CommentSection';
import { useUserContext } from '@/context/AuthContext';
import { databases } from '@/lib/appwrite/config';
import { useQueryClient } from '@tanstack/react-query';
import { useCreateComment } from '@/lib/react-query/queries';

jest.unmock('@/components/shared/CommentSection');

jest.mock('react-router-dom', () => ({
  Link: ({ children, to, className }) => (
    <a href={to} className={className} data-testid={`link-to-${to.replace(/\//g, '-')}`}>
      {children}
    </a>
  )
}));

jest.mock('@/context/AuthContext', () => ({
  useUserContext: jest.fn()
}));

jest.mock('@/lib/appwrite/config', () => ({
  appwriteConfig: {
    databaseId: 'test-db',
    commentsCollectionId: 'test-comments',
    userCollectionId: 'test-users',
    postCollectionId: 'test-posts'
  },
  databases: {
    listDocuments: jest.fn(),
    createDocument: jest.fn(),
    deleteDocument: jest.fn(),
    updateDocument: jest.fn(),
    getDocument: jest.fn()
  }
}));

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: jest.fn()
}));

jest.mock('@/lib/react-query/queries', () => ({
  useCreateComment: jest.fn(),
  QUERY_KEYS: {
    GET_POST_COMMENTS: 'GET_POST_COMMENTS'
  }
}));

jest.mock('@/components/shared/GiphyPicker', () => ({
  __esModule: true,
  default: ({ onGifSelect, onClose }) => (
    <div data-testid="giphy-picker">
      <button onClick={() => onGifSelect('https://test-gif.com/test.gif', 'test-gif-id')}>
        Select Test GIF
      </button>
      <button onClick={onClose}>Close</button>
    </div>
  )
}));

jest.mock('@/components/shared/TranslateComment', () => ({
  __esModule: true,
  default: ({ comment }) => (
    <div data-testid={`translate-comment-${comment.$id}`}>{comment.content}</div>
  )
}));

jest.mock('@/components/shared/DeleteConfirmationModal', () => ({
  __esModule: true,
  default: ({ isOpen, onClose, onConfirm, title, description }) => (
    isOpen ? (
      <div data-testid="delete-modal">
        <h3>{title}</h3>
        <p>{description}</p>
        <button onClick={onConfirm} data-testid="confirm-delete">Confirm</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    ) : null
  )
}));

jest.mock('@/lib/utils', () => ({
  multiFormatDateString: jest.fn(() => 'Today at 12:34 PM')
}));

jest.mock('lucide-react', () => ({
  Loader: () => <div data-testid="loader-icon">Loading...</div>,
  X: () => <div data-testid="x-icon">X</div>,
  SmilePlus: () => <div data-testid="smile-plus-icon">Smile Plus</div>
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, type, disabled, className, title }) => (
    <button
      onClick={onClick}
      type={type || 'button'}
      disabled={disabled}
      className={className}
      title={title}
    >
      {children}
    </button>
  )
}));

describe('CommentSection Component', () => {
  const mockPostId = 'test-post-123';
  const mockPostCreatorId = 'creator-456';
  const mockUser = {
    id: 'test-user-789',
    name: 'Test User',
    username: 'testuser',
    imageUrl: '/test-image.jpg'
  };

  const mockQueryClient = {
    invalidateQueries: jest.fn()
  };

  const mockCreateCommentMutate = jest.fn();

  const mockComments = [
    {
      $id: 'comment-1',
      userId: 'test-user-789',
      postId: mockPostId,
      content: 'This is a test comment',
      createdAt: '2023-01-01T12:00:00Z',
      likes: ['user1', 'user2'],
      gifUrl: null,
      gifId: null,
      user: {
        $id: 'test-user-789',
        name: 'Test User',
        username: 'testuser',
        imageUrl: '/test-image.jpg'
      }
    },
    {
      $id: 'comment-2',
      userId: 'other-user-123',
      postId: mockPostId,
      content: 'Another test comment',
      createdAt: '2023-01-02T12:00:00Z',
      likes: [],
      gifUrl: 'https://test-gif.com/example.gif',
      gifId: 'example-gif',
      user: {
        $id: 'other-user-123',
        name: 'Other User',
        username: 'otheruser',
        imageUrl: '/other-image.jpg'
      }
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    (useUserContext as jest.Mock).mockReturnValue({ user: mockUser });
    (useQueryClient as jest.Mock).mockReturnValue(mockQueryClient);
    (useCreateComment as jest.Mock).mockReturnValue({
      mutate: mockCreateCommentMutate
    });

    (databases.listDocuments as jest.Mock).mockResolvedValue({
      documents: mockComments.map(comment => ({
        ...comment,
        $createdAt: comment.createdAt
      }))
    });

    (databases.getDocument as jest.Mock).mockImplementation((_, __, userId) => {
      const user = mockComments.find(c => c.user.$id === userId)?.user;
      if (user) return Promise.resolve(user);
      return Promise.reject(new Error('User not found'));
    });

    (databases.createDocument as jest.Mock).mockResolvedValue({ $id: 'new-comment-id' });
    (databases.updateDocument as jest.Mock).mockResolvedValue({});
    (databases.deleteDocument as jest.Mock).mockResolvedValue({});
  });

  it('renders the comment input form', () => {
    render(<CommentSection postId={mockPostId} postCreatorId={mockPostCreatorId} />);

    expect(screen.getByPlaceholderText('Write a comment...')).toBeInTheDocument();
    expect(screen.getByText('Post')).toBeInTheDocument();
    expect(screen.getByTestId('smile-plus-icon')).toBeInTheDocument();
  });

  it('shows loading state when fetching comments', () => {
    (databases.listDocuments as jest.Mock).mockReturnValue(new Promise(() => { })); // Never resolves

    render(<CommentSection postId={mockPostId} postCreatorId={mockPostCreatorId} />);

    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
  });

  it('renders comments when data is loaded', async () => {
    render(<CommentSection postId={mockPostId} postCreatorId={mockPostCreatorId} />);

    await waitFor(() => {
      expect(screen.getByText('This is a test comment')).toBeInTheDocument();
      expect(screen.getByText('Another test comment')).toBeInTheDocument();
    });

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('@testuser')).toBeInTheDocument();
    expect(screen.getByText('Other User')).toBeInTheDocument();

    const gifImage = screen.getByAltText('Comment GIF');
    expect(gifImage).toBeInTheDocument();
    expect(gifImage).toHaveAttribute('src', 'https://test-gif.com/example.gif');
  });

  it('allows submitting a new text comment', async () => {
    render(<CommentSection postId={mockPostId} postCreatorId={mockPostCreatorId} />);

    const commentInput = screen.getByPlaceholderText('Write a comment...');
    fireEvent.change(commentInput, { target: { value: 'My new comment' } });

    const submitButton = screen.getByText('Post');
    fireEvent.click(submitButton);

    expect(mockCreateCommentMutate).toHaveBeenCalledWith({
      postId: mockPostId,
      userId: mockUser.id,
      content: 'My new comment',
      gifUrl: undefined,
      gifId: undefined
    });
  });

  it('allows selecting and posting a GIF', async () => {
    render(<CommentSection postId={mockPostId} postCreatorId={mockPostCreatorId} />);

    const gifButton = screen.getByTestId('smile-plus-icon').closest('button');
    fireEvent.click(gifButton!);

    expect(screen.getByTestId('giphy-picker')).toBeInTheDocument();

    const selectGifButton = screen.getByText('Select Test GIF');
    fireEvent.click(selectGifButton);

    const gifPreview = await screen.findByAltText('Selected GIF');
    expect(gifPreview).toBeInTheDocument();

    const submitButton = screen.getByText('Post');
    fireEvent.click(submitButton);

    expect(mockCreateCommentMutate).toHaveBeenCalledWith({
      postId: mockPostId,
      userId: mockUser.id,
      content: '',
      gifUrl: 'https://test-gif.com/test.gif',
      gifId: 'test-gif-id'
    });
  });

  it('allows liking and unliking a comment', async () => {
    render(<CommentSection postId={mockPostId} postCreatorId={mockPostCreatorId} />);

    await waitFor(() => {
      expect(screen.getByText('This is a test comment')).toBeInTheDocument();
    });

    const likeButtons = screen.getAllByText(/like/i);
    fireEvent.click(likeButtons[0]);

    await waitFor(() => {
      expect(databases.updateDocument).toHaveBeenCalledWith(
        'test-db',
        'test-comments',
        'comment-1',
        expect.objectContaining({
          likes: expect.arrayContaining(['user1', 'user2', mockUser.id])
        })
      );
    });
  });

  it('allows deleting a comment when user is authorized', async () => {
    render(<CommentSection postId={mockPostId} postCreatorId={mockPostCreatorId} />);

    await waitFor(() => {
      expect(screen.getByText('This is a test comment')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    expect(screen.getByTestId('delete-modal')).toBeInTheDocument();

    const confirmButton = screen.getByTestId('confirm-delete');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(databases.deleteDocument).toHaveBeenCalledWith(
        'test-db',
        'test-comments',
        'comment-1'
      );
    });
  });

  it('shows empty state when no comments exist', async () => {
    (databases.listDocuments as jest.Mock).mockResolvedValue({
      documents: []
    });

    render(<CommentSection postId={mockPostId} postCreatorId={mockPostCreatorId} />);

    await waitFor(() => {
      expect(screen.getByText('No comments yet. Be the first to comment!')).toBeInTheDocument();
    });
  });
});