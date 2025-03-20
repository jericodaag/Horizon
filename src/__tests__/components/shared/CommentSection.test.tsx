import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CommentSection from '@/components/shared/CommentSection';

// Unmock the component we're testing
jest.unmock('@/components/shared/CommentSection');

// Mock dependencies
jest.mock('react-router-dom', () => ({
  Link: ({ children, to, className }) => (
    <a href={to} className={className} data-testid={`link-to-${to}`}>
      {children}
    </a>
  ),
}));

// Mock AuthContext
jest.mock('@/context/AuthContext', () => ({
  useUserContext: () => ({
    user: {
      id: 'current-user',
      name: 'Current User',
      username: 'current_user',
      imageUrl: '/assets/icons/profile-placeholder.svg',
    },
  }),
}));

// Mock appwrite config and databases
jest.mock('@/lib/appwrite/config', () => ({
  appwriteConfig: {
    databaseId: 'test-db',
    commentsCollectionId: 'test-comments',
    userCollectionId: 'test-users',
  },
  databases: {
    listDocuments: jest.fn(),
    getDocument: jest.fn(),
    createDocument: jest.fn(),
    updateDocument: jest.fn(),
    deleteDocument: jest.fn(),
  },
}));

// Mock ID from appwrite
jest.mock('appwrite', () => ({
  ID: {
    unique: () => 'unique-id-123',
  },
  Query: {
    equal: jest.fn(),
    orderDesc: jest.fn(),
  },
}));

// Mock useQueryClient
jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: jest.fn(),
  }),
}));

// Mock utils
jest.mock('@/lib/utils', () => ({
  multiFormatDateString: () => 'a few moments ago',
}));

// Sample mock data
const mockComments = [
  {
    $id: 'comment1',
    userId: 'user1',
    postId: 'post1',
    content: 'This is the first comment',
    createdAt: '2023-06-01T10:00:00.000Z',
    likes: ['user2', 'user3'],
    gifUrl: null,
    gifId: null,
    user: {
      $id: 'user1',
      name: 'Test User 1',
      username: 'test_user1',
      imageUrl: '/assets/images/user1.jpg',
    },
  },
  {
    $id: 'comment2',
    userId: 'user2',
    postId: 'post1',
    content: 'This is the second comment with a GIF',
    createdAt: '2023-06-01T11:00:00.000Z',
    likes: ['current-user'],
    gifUrl: 'https://test.gif',
    gifId: 'test-gif-id',
    user: {
      $id: 'user2',
      name: 'Test User 2',
      username: 'test_user2',
      imageUrl: '/assets/images/user2.jpg',
    },
  },
  {
    $id: 'comment3',
    userId: 'current-user',
    postId: 'post1',
    content: 'This is my comment',
    createdAt: '2023-06-01T12:00:00.000Z',
    likes: [],
    gifUrl: null,
    gifId: null,
    user: {
      $id: 'current-user',
      name: 'Current User',
      username: 'current_user',
      imageUrl: '/assets/icons/profile-placeholder.svg',
    },
  },
];

describe('CommentSection Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock behavior
    const { databases } = require('@/lib/appwrite/config');

    // Mock listDocuments to return our sample comments
    databases.listDocuments.mockResolvedValue({
      documents: mockComments,
    });

    // Mock getDocument for user data
    databases.getDocument.mockImplementation((...args) => {
      const userId = args[2]; // Third argument is userId
      const user = mockComments.find(
        (comment) => comment.user.$id === userId
      )?.user;
      if (user) return Promise.resolve(user);
      throw new Error('User not found');
    });
  });

  it('renders the comment input form', async () => {
    render(<CommentSection postId='post1' postCreatorId='creator1' />);

    // Check for comment input
    expect(
      screen.getByPlaceholderText('Write a comment...')
    ).toBeInTheDocument();

    // Check for Post button
    expect(screen.getByText('Post')).toBeInTheDocument();
  });

  it('shows loading state initially, then displays comments', async () => {
    render(<CommentSection postId='post1' postCreatorId='creator1' />);

    // Check if loader is displayed initially
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Wait for comments to load
    await waitFor(() => {
      expect(screen.getByText('This is the first comment')).toBeInTheDocument();
    });

    // Check if all comments are displayed
    expect(
      screen.getByText('This is the second comment with a GIF')
    ).toBeInTheDocument();
    expect(screen.getByText('This is my comment')).toBeInTheDocument();
  });

  it('displays GIFs in comments when available', async () => {
    render(<CommentSection postId='post1' postCreatorId='creator1' />);

    // Wait for comments to load
    await waitFor(() => {
      expect(
        screen.getByText('This is the second comment with a GIF')
      ).toBeInTheDocument();
    });

    // Check for GIF image in second comment
    const images = screen.getAllByRole('img');
    const commentGifs = images.filter(
      (img) => img.getAttribute('alt') === 'Comment GIF'
    );
    expect(commentGifs.length).toBeGreaterThan(0);
  });

  it('shows appropriate like information', async () => {
    render(<CommentSection postId='post1' postCreatorId='creator1' />);

    // Wait for comments to load
    await waitFor(() => {
      expect(screen.getByText('This is the first comment')).toBeInTheDocument();
    });

    // Check that like counts are displayed correctly
    expect(screen.getByText('(2)')).toBeInTheDocument(); // First comment has 2 likes
  });

  it('allows submitting a new comment', async () => {
    const { databases } = require('@/lib/appwrite/config');
    databases.createDocument.mockResolvedValue({});

    render(<CommentSection postId='post1' postCreatorId='creator1' />);

    // Wait for UI to be ready
    await waitFor(() => {
      expect(
        screen.getByPlaceholderText('Write a comment...')
      ).toBeInTheDocument();
    });

    // Type in the comment input
    const commentInput = screen.getByPlaceholderText('Write a comment...');
    fireEvent.change(commentInput, {
      target: { value: 'This is a new comment' },
    });

    // Submit the comment
    const postButton = screen.getByText('Post');
    fireEvent.click(postButton);

    // Verify API call was made with correct data
    await waitFor(() => {
      expect(databases.createDocument).toHaveBeenCalledWith(
        'test-db',
        'test-comments',
        expect.any(String),
        expect.objectContaining({
          postId: 'post1',
          content: 'This is a new comment',
          userId: 'current-user',
        })
      );
    });
  });

  it('allows deleting own comments', async () => {
    const { databases } = require('@/lib/appwrite/config');
    databases.deleteDocument.mockResolvedValue({});

    render(<CommentSection postId='post1' postCreatorId='creator1' />);

    // Wait for comments to load
    await waitFor(() => {
      expect(screen.getByText('This is my comment')).toBeInTheDocument();
    });

    // There should be a delete button for the user's own comment
    const deleteButtons = screen.getAllByText('Delete');
    expect(deleteButtons.length).toBeGreaterThan(0);

    // Click the first delete button
    if (deleteButtons[0]) {
      fireEvent.click(deleteButtons[0]);
    }

    // Check that delete modal appears
    expect(screen.getByTestId('delete-modal')).toBeInTheDocument();

    // Confirm delete
    const confirmButton = screen.getByTestId('confirm-delete-button');
    fireEvent.click(confirmButton);

    // Verify API call was made to delete the comment
    await waitFor(() => {
      expect(databases.deleteDocument).toHaveBeenCalled();
    });
  });

  it('shows a message when no comments exist', async () => {
    // Override mock to return empty comments
    const { databases } = require('@/lib/appwrite/config');
    databases.listDocuments.mockResolvedValue({ documents: [] });

    render(<CommentSection postId='post1' postCreatorId='creator1' />);

    // Check for no comments message
    await waitFor(() => {
      expect(
        screen.getByText('No comments yet. Be the first to comment!')
      ).toBeInTheDocument();
    });
  });
});
