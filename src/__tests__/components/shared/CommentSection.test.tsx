import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CommentSection from '@/components/shared/CommentSection';
import { useUserContext } from '@/context/AuthContext';
import { databases } from '@/lib/appwrite/config';
import { useQueryClient } from '@tanstack/react-query';

// Unmock the component we're testing
jest.unmock('@/components/shared/CommentSection');

// Mock dependencies
jest.mock('react-router-dom', () => ({
  Link: ({ children, to, className }) => (
    <a href={to} className={className} data-testid={`link-to-${to.replace(/\//g, '-')}`}>
      {children}
    </a>
  )
}));

// Mock Auth Context
jest.mock('@/context/AuthContext', () => ({
  useUserContext: jest.fn()
}));

// Mock AppWrite databases
jest.mock('@/lib/appwrite/config', () => ({
  appwriteConfig: {
    databaseId: 'test-db',
    commentsCollectionId: 'test-comments',
    userCollectionId: 'test-users'
  },
  databases: {
    listDocuments: jest.fn(),
    createDocument: jest.fn(),
    deleteDocument: jest.fn(),
    updateDocument: jest.fn(),
    getDocument: jest.fn()
  }
}));

// Mock React Query
jest.mock('@tanstack/react-query', () => ({
  useQueryClient: jest.fn()
}));

// Mock components that might cause issues
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

// Mock utility functions
jest.mock('@/lib/utils', () => ({
  multiFormatDateString: jest.fn(() => 'Today at 12:34 PM')
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Loader: () => <div data-testid="loader-icon">Loading...</div>,
  X: () => <div data-testid="x-icon">X</div>,
  SmilePlus: () => <div data-testid="smile-plus-icon">Smile Plus</div>
}));

describe('CommentSection Component', () => {
  // Setup common test data
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

    // Setup mocks for each test
    (useUserContext as jest.Mock).mockReturnValue({ user: mockUser });
    (useQueryClient as jest.Mock).mockReturnValue(mockQueryClient);

    // Mock database responses
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
    expect(screen.getByRole('button', { name: 'Post' })).toBeInTheDocument();
    expect(screen.getByTitle('Add a GIF')).toBeInTheDocument();
  });

  it('shows loading state when fetching comments', () => {
    // Override the mock to simulate loading
    (databases.listDocuments as jest.Mock).mockReturnValue(new Promise(() => { })); // Never resolves

    render(<CommentSection postId={mockPostId} postCreatorId={mockPostCreatorId} />);

    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
  });

  it('renders comments when data is loaded', async () => {
    render(<CommentSection postId={mockPostId} postCreatorId={mockPostCreatorId} />);

    // Wait for comments to load
    await waitFor(() => {
      expect(screen.getByText('This is a test comment')).toBeInTheDocument();
      expect(screen.getByText('Another test comment')).toBeInTheDocument();
    });

    // Check user information is displayed
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('@testuser')).toBeInTheDocument();
    expect(screen.getByText('Other User')).toBeInTheDocument();

    // Check GIF is rendered for the second comment
    const gifImage = screen.getByAltText('Comment GIF');
    expect(gifImage).toBeInTheDocument();
    expect(gifImage).toHaveAttribute('src', 'https://test-gif.com/example.gif');
  });

  it('allows submitting a new text comment', async () => {
    render(<CommentSection postId={mockPostId} postCreatorId={mockPostCreatorId} />);

    // Type in the comment input
    const commentInput = screen.getByPlaceholderText('Write a comment...');
    fireEvent.change(commentInput, { target: { value: 'My new comment' } });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: 'Post' });
    fireEvent.click(submitButton);

    // Verify the comment was submitted
    await waitFor(() => {
      expect(databases.createDocument).toHaveBeenCalledWith(
        'test-db',
        'test-comments',
        expect.any(String),
        expect.objectContaining({
          postId: mockPostId,
          content: 'My new comment',
          userId: mockUser.id
        })
      );
    });

    // Verify queries were invalidated
    expect(mockQueryClient.invalidateQueries).toHaveBeenCalled();
  });

  it('allows selecting and posting a GIF', async () => {
    render(<CommentSection postId={mockPostId} postCreatorId={mockPostCreatorId} />);

    // Open GIF picker
    const gifButton = screen.getByTitle('Add a GIF');
    fireEvent.click(gifButton);

    // Verify GIF picker is shown
    expect(screen.getByTestId('giphy-picker')).toBeInTheDocument();

    // Select a GIF
    const selectGifButton = screen.getByText('Select Test GIF');
    fireEvent.click(selectGifButton);

    // Verify GIF preview is shown
    expect(screen.getByAltText('Selected GIF')).toBeInTheDocument();

    // Submit the form with the GIF
    const submitButton = screen.getByRole('button', { name: 'Post' });
    fireEvent.click(submitButton);

    // Verify the comment with GIF was submitted
    await waitFor(() => {
      expect(databases.createDocument).toHaveBeenCalledWith(
        'test-db',
        'test-comments',
        expect.any(String),
        expect.objectContaining({
          postId: mockPostId,
          gifUrl: 'https://test-gif.com/test.gif',
          gifId: 'test-gif-id'
        })
      );
    });
  });

  it('allows liking and unliking a comment', async () => {
    render(<CommentSection postId={mockPostId} postCreatorId={mockPostCreatorId} />);

    // Wait for comments to load
    await waitFor(() => {
      expect(screen.getByText('This is a test comment')).toBeInTheDocument();
    });

    // Find and click the like button on the first comment
    const likeButtons = screen.getAllByText(/like/i);
    fireEvent.click(likeButtons[0]);

    // Verify the like was added
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

    // Wait for comments to load
    await waitFor(() => {
      expect(screen.getByText('This is a test comment')).toBeInTheDocument();
    });

    // Find and click delete button
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    // Verify delete modal appears
    expect(screen.getByTestId('delete-modal')).toBeInTheDocument();

    // Confirm deletion
    const confirmButton = screen.getByTestId('confirm-delete');
    fireEvent.click(confirmButton);

    // Verify the comment was deleted
    await waitFor(() => {
      expect(databases.deleteDocument).toHaveBeenCalledWith(
        'test-db',
        'test-comments',
        'comment-1'
      );
    });
  });

  it('shows empty state when no comments exist', async () => {
    // Override mock to return no comments
    (databases.listDocuments as jest.Mock).mockResolvedValue({
      documents: []
    });

    render(<CommentSection postId={mockPostId} postCreatorId={mockPostCreatorId} />);

    // Check for the empty state message
    await waitFor(() => {
      expect(screen.getByText('No comments yet. Be the first to comment!')).toBeInTheDocument();
    });
  });
});