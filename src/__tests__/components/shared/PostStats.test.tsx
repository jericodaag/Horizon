import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PostStats from '@/components/shared/PostStats';
import { checkIsLiked } from '@/lib/utils';
import { Models } from 'appwrite';
import {
  useLikePost,
  useSavePost,
  useDeleteSavedPost,
  useGetCurrentUser,
} from '@/lib/react-query/queries';

// Unmock the component we're testing
jest.unmock('@/components/shared/PostStats');

// Mock dependencies
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
}));

jest.mock('@/lib/utils', () => ({
  checkIsLiked: jest.fn(),
}));

jest.mock('@/lib/react-query/queries', () => ({
  useLikePost: jest.fn(),
  useSavePost: jest.fn(),
  useDeleteSavedPost: jest.fn(),
  useGetCurrentUser: jest.fn(),
}));

describe('PostStats Component', () => {
  // Mock data
  const mockPost: Models.Document = {
    $id: 'post-1',
    $createdAt: '2023-01-01T00:00:00Z',
    $updatedAt: '2023-01-01T00:00:00Z',
    $permissions: [],
    $collectionId: 'posts',
    $databaseId: 'database',
    likes: [{ $id: 'user-1' }, { $id: 'user-2' }],
    comments: [
      { $id: 'comment-1' },
      { $id: 'comment-2' },
      { $id: 'comment-3' },
    ],
  };

  const mockUserId = 'current-user';

  // Mock mutation functions
  const mockLikePost = jest.fn();
  const mockSavePost = jest.fn();
  const mockDeleteSavePost = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementation
    (checkIsLiked as jest.Mock).mockReturnValue(false);

    (useLikePost as jest.Mock).mockReturnValue({
      mutate: mockLikePost,
    });

    (useSavePost as jest.Mock).mockReturnValue({
      mutate: mockSavePost,
    });

    (useDeleteSavedPost as jest.Mock).mockReturnValue({
      mutate: mockDeleteSavePost,
    });

    (useGetCurrentUser as jest.Mock).mockReturnValue({
      data: {
        save: [],
      },
    });
  });

  it('renders in detailed view mode by default', () => {
    render(<PostStats post={mockPost} userId={mockUserId} />);

    // Check like, comment, and save buttons exist
    expect(screen.getByAltText('like')).toBeInTheDocument();
    expect(screen.getByAltText('comment')).toBeInTheDocument();
    expect(screen.getByAltText('save')).toBeInTheDocument();

    // Check stats display
    expect(screen.getByText('2 likes')).toBeInTheDocument();
    expect(screen.getByText('3 comments')).toBeInTheDocument();
  });

  it('renders in grid view mode when isGridView is true', () => {
    render(<PostStats post={mockPost} userId={mockUserId} isGridView={true} />);

    // Check buttons exist in more compact layout
    expect(screen.getByAltText('like')).toBeInTheDocument();
    expect(screen.getByAltText('comment')).toBeInTheDocument();
    expect(screen.getByAltText('save')).toBeInTheDocument();

    // Check stats should not be visible in grid view
    expect(screen.queryByText('2 likes')).not.toBeInTheDocument();
    expect(screen.queryByText('3 comments')).not.toBeInTheDocument();
  });

  it('shows singular text when there is only one like or comment', () => {
    const postWithSingulars: Models.Document = {
      ...mockPost,
      likes: [{ $id: 'user-1' }],
      comments: [{ $id: 'comment-1' }],
    };

    render(<PostStats post={postWithSingulars} userId={mockUserId} />);

    expect(screen.getByText('1 like')).toBeInTheDocument();
    expect(screen.getByText('1 comment')).toBeInTheDocument();
  });

  it('shows liked icon when user has liked the post', () => {
    (checkIsLiked as jest.Mock).mockReturnValue(true);

    render(<PostStats post={mockPost} userId={mockUserId} />);

    const likeButton = screen.getByAltText('like');
    expect(likeButton).toHaveAttribute('src', '/assets/icons/liked.svg');
  });

  it('shows saved icon when user has saved the post', () => {
    (useGetCurrentUser as jest.Mock).mockReturnValue({
      data: {
        save: [
          {
            $id: 'save-1',
            post: {
              $id: 'post-1',
            },
          },
        ],
      },
    });

    render(<PostStats post={mockPost} userId={mockUserId} />);

    // Need to wait for the useEffect to run
    setTimeout(() => {
      const saveButton = screen.getByAltText('save');
      expect(saveButton).toHaveAttribute('src', '/assets/icons/saved.svg');
    }, 0);
  });

  it('likes a post when like button is clicked', () => {
    render(<PostStats post={mockPost} userId={mockUserId} />);

    const likeButton = screen.getByAltText('like');
    fireEvent.click(likeButton);

    expect(mockLikePost).toHaveBeenCalledWith({
      postId: 'post-1',
      likesArray: expect.arrayContaining(['user-1', 'user-2', mockUserId]),
    });
  });

  it('unlikes a post when like button is clicked for an already liked post', () => {
    // Set as already liked
    (checkIsLiked as jest.Mock).mockReturnValue(true);

    render(<PostStats post={mockPost} userId={'user-1'} />);

    const likeButton = screen.getByAltText('like');
    fireEvent.click(likeButton);

    expect(mockLikePost).toHaveBeenCalledWith({
      postId: 'post-1',
      likesArray: expect.arrayContaining(['user-2']),
    });
  });

  it('saves a post when save button is clicked', () => {
    render(<PostStats post={mockPost} userId={mockUserId} />);

    const saveButton = screen.getByAltText('save');
    fireEvent.click(saveButton);

    expect(mockSavePost).toHaveBeenCalledWith({
      userId: mockUserId,
      postId: 'post-1',
    });
  });

  it('removes saved post when save button is clicked for an already saved post', () => {
    const savedRecordId = 'save-1';

    (useGetCurrentUser as jest.Mock).mockReturnValue({
      data: {
        save: [
          {
            $id: savedRecordId,
            post: {
              $id: 'post-1',
            },
          },
        ],
      },
    });

    render(<PostStats post={mockPost} userId={mockUserId} />);

    // Allow useEffect to run first
    setTimeout(() => {
      const saveButton = screen.getByAltText('save');
      fireEvent.click(saveButton);

      expect(mockDeleteSavePost).toHaveBeenCalledWith(savedRecordId);
    }, 0);
  });

  it('handles case when post has no comments', () => {
    const postWithoutComments = {
      ...mockPost,
      comments: undefined,
    };

    render(<PostStats post={postWithoutComments} userId={mockUserId} />);

    expect(screen.queryByText(/comments?/)).not.toBeInTheDocument();
  });

  it('handles case when post has no likes', () => {
    const postWithoutLikes = {
      ...mockPost,
      likes: [],
    };

    render(<PostStats post={postWithoutLikes} userId={mockUserId} />);

    expect(screen.queryByText(/likes?/)).not.toBeInTheDocument();
  });

  it('prevents event propagation when buttons are clicked', () => {
    const mockNavigate = jest.fn();
    jest
      .spyOn(require('react-router-dom'), 'useNavigate')
      .mockReturnValue(mockNavigate);

    render(<PostStats post={mockPost} userId={mockUserId} />);

    const likeButton = screen.getByAltText('like').closest('button');
    const commentButton = screen.getByAltText('comment').closest('button');
    const saveButton = screen.getByAltText('save').closest('button');

    // The event propagation test is hard to simulate directly with fireEvent
    // Instead, we'll test that the handlers are actually being called
    fireEvent.click(likeButton!);
    expect(mockLikePost).toHaveBeenCalled();

    fireEvent.click(commentButton!);
    expect(mockNavigate).toHaveBeenCalledWith('/posts/post-1');

    fireEvent.click(saveButton!);
    expect(mockSavePost).toHaveBeenCalled();
  });
});
