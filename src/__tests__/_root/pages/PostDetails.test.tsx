import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PostDetails from '@/_root/pages/PostDetails';
import { mockDeletePost } from '@/__tests__/__mocks__/api';

// Mock useNavigate and useParams
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: 'test-post-id' }),
  useNavigate: () => mockNavigate,
  Link: ({ to, children, className }: any) => (
    <a href={to} className={className}>{children}</a>
  )
}));

// Mock DeleteConfirmationModal component
jest.mock('@/components/shared/DeleteConfirmationModal', () => ({
  __esModule: true,
  default: ({ isOpen, onClose, onConfirm, title = 'Delete Post', description = 'Are you sure you want to delete this post? This action cannot be undone.' }: any) => {
    if (!isOpen) return null;

    return (
      <div data-testid="delete-modal">
        <div data-testid="dialog-title">{title}</div>
        <div data-testid="dialog-description">{description}</div>
        <div data-testid="dialog-footer">
          <button
            data-testid="cancel-button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            data-testid="confirm-delete"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Delete
          </button>
        </div>
      </div>
    );
  }
}));

describe('PostDetails Component', () => {
  // Mock post data
  const mockPost = {
    $id: 'test-post-id',
    $createdAt: '2023-01-15T16:30:00.000Z',
    creator: {
      $id: 'user-1',
      name: 'Test User',
      username: 'testuser',
      email: 'test@example.com',
      imageUrl: '/test-profile.jpg'
    },
    caption: 'Test post caption',
    imageUrl: '/test-image.jpg',
    imageId: 'image-1',
    location: 'Test Location',
    tags: ['test', 'react', 'jest'],
    likes: ['user-2', 'user-3']
  };

  // Mock related posts
  const mockUserPosts = {
    documents: [
      {
        $id: 'test-post-id', // Current post
        caption: 'Test post caption',
        imageUrl: '/test-image.jpg',
        creator: { $id: 'user-1', name: 'Test User' }
      },
      {
        $id: 'related-post-1',
        caption: 'Related post 1',
        imageUrl: '/related-image-1.jpg',
        creator: { $id: 'user-1', name: 'Test User' }
      },
      {
        $id: 'related-post-2',
        caption: 'Related post 2',
        imageUrl: '/related-image-2.jpg',
        creator: { $id: 'user-1', name: 'Test User' }
      }
    ]
  };

  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock global window properties for resize detection
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024 // Default to desktop view
    });

    window.dispatchEvent = jest.fn();

    // Mock API responses
    jest.spyOn(require('@/lib/react-query/queries'), 'useGetPostById')
      .mockImplementation(() => ({
        data: mockPost,
        isLoading: false
      }));

    jest.spyOn(require('@/lib/react-query/queries'), 'useGetUserPosts')
      .mockImplementation(() => ({
        data: mockUserPosts,
        isLoading: false
      }));

    jest.spyOn(require('@/lib/react-query/queries'), 'useDeletePost')
      .mockImplementation(() => ({
        mutate: mockDeletePost
      }));

    // Set default auth context - not the post creator by default
    jest.spyOn(require('@/context/AuthContext'), 'useUserContext')
      .mockImplementation(() => ({
        user: {
          id: 'user-2', // Not the post creator by default
          name: 'Current User',
          email: 'current@example.com',
          imageUrl: '/current-profile.jpg',
          bio: '',
          username: 'currentuser'
        },
        isLoading: false,
        isAuthenticated: true,
        setUser: jest.fn(),
        checkAuthUser: jest.fn(),
        signOut: jest.fn(),
        setIsAuthenticated: jest.fn()
      }));
  });

  it('renders loading state when fetching post', () => {
    // Override the hook to return loading state
    jest.spyOn(require('@/lib/react-query/queries'), 'useGetPostById')
      .mockImplementation(() => ({
        data: undefined,
        isLoading: true
      }));

    render(<PostDetails />);

    // Check for loader element
    const loader = screen.getByTestId('lucide-loader');
    expect(loader).toBeInTheDocument();
  });

  it('renders post details in desktop view', async () => {
    render(<PostDetails />);

    // Wait for the component to process the post data
    await waitFor(() => {
      // Check for post creator
      expect(screen.getByText('Test User')).toBeInTheDocument();

      // Check for post caption
      expect(screen.getByText('Test post caption')).toBeInTheDocument();

      // Check for post location
      expect(screen.getByText('Test Location')).toBeInTheDocument();

      // Check for post tags
      const tags = screen.getAllByText(/^#/);
      expect(tags.length).toBe(3);
      expect(tags[0]).toHaveTextContent('#test');
    });
  });

  it('renders post details in mobile view', async () => {
    // Set window width to mobile size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 700
    });

    // Render the component
    const { rerender } = render(<PostDetails />);

    // Trigger resize event to update isMobile state
    window.dispatchEvent(new Event('resize'));

    // Rerender to apply the changed window size
    rerender(<PostDetails />);

    // Wait for mobile view to appear
    await waitFor(() => {
      // Check for post elements in mobile view
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('Test post caption')).toBeInTheDocument();
    });
  });

  it('navigates back when back button is clicked', async () => {
    render(<PostDetails />);

    // Find all back buttons (there may be separate ones for mobile and desktop)
    const backText = screen.getAllByText('Back');
    expect(backText.length).toBeGreaterThanOrEqual(1);

    // Click the first back button
    const backButton = backText[0].closest('button');
    if (backButton) {
      fireEvent.click(backButton);
    }

    // Check that navigate was called
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('shows edit and delete buttons when user is post creator', async () => {
    // Set the user as the post creator
    jest.spyOn(require('@/context/AuthContext'), 'useUserContext')
      .mockImplementation(() => ({
        user: {
          id: 'user-1', // Same as post creator ID
          name: 'Test User',
          email: 'test@example.com',
          imageUrl: '/test-profile.jpg',
          bio: '',
          username: 'testuser'
        },
        isLoading: false,
        isAuthenticated: true,
        setUser: jest.fn(),
        checkAuthUser: jest.fn(),
        signOut: jest.fn(),
        setIsAuthenticated: jest.fn()
      }));

    render(<PostDetails />);

    // Wait for component to process the user context
    await waitFor(() => {
      // Look for edit and delete elements by their alt text
      const editImage = screen.getAllByAltText('edit');
      const deleteImage = screen.getAllByAltText('delete');

      expect(editImage.length).toBeGreaterThanOrEqual(1);
      expect(deleteImage.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('does not show edit and delete buttons when user is not post creator', async () => {
    // User is already set to non-creator in beforeEach
    render(<PostDetails />);

    // Wait a bit to ensure component has processed
    await waitFor(() => {
      // Check that edit and delete buttons don't exist
      expect(screen.queryByAltText('edit')).not.toBeInTheDocument();
      expect(screen.queryByAltText('delete')).not.toBeInTheDocument();
    });
  });

  it('opens delete confirmation modal when delete button is clicked', async () => {
    // Set the user as the post creator
    jest.spyOn(require('@/context/AuthContext'), 'useUserContext')
      .mockImplementation(() => ({
        user: {
          id: 'user-1', // Same as post creator ID
          name: 'Test User',
          email: 'test@example.com',
          imageUrl: '/test-profile.jpg',
          bio: '',
          username: 'testuser'
        },
        isLoading: false,
        isAuthenticated: true,
        setUser: jest.fn(),
        checkAuthUser: jest.fn(),
        signOut: jest.fn(),
        setIsAuthenticated: jest.fn()
      }));

    render(<PostDetails />);

    // Wait for component to process the user context
    await waitFor(() => {
      const deleteImages = screen.getAllByAltText('delete');
      expect(deleteImages.length).toBeGreaterThan(0);

      // Click the delete button
      const deleteButton = deleteImages[0].closest('button');
      if (deleteButton) {
        fireEvent.click(deleteButton);
      }
    });

    // Check if modal is shown
    const modalElement = screen.getByTestId('delete-modal');
    expect(modalElement).toBeInTheDocument();
    expect(screen.getByTestId('dialog-title')).toHaveTextContent('Delete Post');
  });

  it('deletes post and navigates back when confirm delete is clicked', async () => {
    // Set the user as the post creator
    jest.spyOn(require('@/context/AuthContext'), 'useUserContext')
      .mockImplementation(() => ({
        user: {
          id: 'user-1', // Same as post creator ID
          name: 'Test User',
          email: 'test@example.com',
          imageUrl: '/test-profile.jpg',
          bio: '',
          username: 'testuser'
        },
        isLoading: false,
        isAuthenticated: true,
        setUser: jest.fn(),
        checkAuthUser: jest.fn(),
        signOut: jest.fn(),
        setIsAuthenticated: jest.fn()
      }));

    render(<PostDetails />);

    // Click delete button to open modal
    await waitFor(() => {
      const deleteImages = screen.getAllByAltText('delete');
      const deleteButton = deleteImages[0].closest('button');
      if (deleteButton) {
        fireEvent.click(deleteButton);
      }
    });

    // Wait for modal to appear
    await waitFor(() => {
      expect(screen.getByTestId('delete-modal')).toBeInTheDocument();
    });

    // Click confirm delete button
    const confirmButton = screen.getByTestId('confirm-delete');
    fireEvent.click(confirmButton);

    // Check deletePost was called with correct parameters
    expect(mockDeletePost).toHaveBeenCalledWith({
      postId: 'test-post-id',
      imageId: 'image-1'
    });

    // Check navigation
    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('renders related posts correctly', async () => {
    render(<PostDetails />);

    // Wait for component to process
    await waitFor(() => {
      // Check for the related posts heading
      expect(screen.getByText('More Related Posts')).toBeInTheDocument();
    });
  });

  it('shows loader for related posts when loading', async () => {
    // Mock the related posts to be loading
    jest.spyOn(require('@/lib/react-query/queries'), 'useGetUserPosts')
      .mockImplementation(() => ({
        data: undefined,
        isLoading: true
      }));

    render(<PostDetails />);

    // Wait for component to process
    await waitFor(() => {
      // The heading should still be there
      expect(screen.getByText('More Related Posts')).toBeInTheDocument();

      // And there should be a loader for related posts
      const loaders = screen.getAllByTestId('lucide-loader');
      expect(loaders.length).toBeGreaterThanOrEqual(1);
    });
  });
});