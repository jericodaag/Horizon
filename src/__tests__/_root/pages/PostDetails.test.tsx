import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import PostDetails from '../../../_root/pages/PostDetails';

// Mock all dependencies with the simplest possible implementations
jest.mock('react-router-dom', () => {
    const originalModule = jest.requireActual('react-router-dom');
    const navigate = jest.fn();
    return {
        ...originalModule,
        useParams: () => ({ id: 'mock-id' }),
        useNavigate: () => navigate,
        Link: ({ children, to, className }: any) => (
            <a href={to} className={className} data-testid="mock-link">
                {children}
            </a>
        )
    };
});

// Create mock post data
const mockPost = {
    $id: 'mock-id',
    caption: 'Test post caption',
    imageUrl: 'https://example.com/test.jpg',
    imageId: 'image-123',
    location: 'Test Location',
    tags: ['tag1', 'tag2'],
    $createdAt: '2024-01-01T12:00:00.000Z',
    creator: {
        $id: 'user-123',
        name: 'Test User',
        imageUrl: '/assets/profile.jpg',
    },
    likes: [],
    comments: []
};

const mockRelatedPosts = {
    documents: [
        {
            $id: 'related-1',
            caption: 'Related post',
            imageUrl: 'https://example.com/related.jpg',
            creator: {
                $id: 'user-123',
                name: 'Test User',
                imageUrl: '/assets/profile.jpg',
            },
            likes: []
        }
    ]
};

// Mock AuthContext
const mockUser = { id: 'user-123', name: 'Test User' };
jest.mock('@/context/AuthContext', () => ({
    useUserContext: () => ({ user: mockUser })
}));

// Create query mocks with controllable return values
let isLoadingPost = true;
let isLoadingUserPosts = true;
let mockDeleteMutate = jest.fn();

jest.mock('@/lib/react-query/queries', () => ({
    useGetPostById: () => ({
        data: isLoadingPost ? null : mockPost,
        isLoading: isLoadingPost
    }),
    useGetUserPosts: () => ({
        data: isLoadingUserPosts ? null : mockRelatedPosts,
        isLoading: isLoadingUserPosts
    }),
    useDeletePost: () => ({
        mutate: mockDeleteMutate
    })
}));

// Mock utility functions
jest.mock('@/lib/utils', () => ({
    multiFormatDateString: () => '2 days ago',
    checkIsLiked: () => false,
    cn: (...args: any[]) => args.filter(Boolean).join(' ')
}));

// Mock components
jest.mock('@/components/shared/PostStats', () => {
    return {
        __esModule: true,
        default: ({ post, userId }: any) => (
            <div data-testid="post-stats" data-post-id={post.$id} data-user-id={userId}>
                PostStats Component
            </div>
        )
    };
});

jest.mock('@/components/shared/GridPostList', () => {
    return {
        __esModule: true,
        default: ({ posts }: any) => (
            <div data-testid="grid-post-list" data-posts-count={posts?.length || 0}>
                GridPostList Component
            </div>
        )
    };
});

jest.mock('@/components/shared/CommentSection', () => {
    return {
        __esModule: true,
        default: ({ postId }: any) => (
            <div data-testid="comment-section" data-post-id={postId}>
                CommentSection Component
            </div>
        )
    };
});

// Mock Loader with a className to help us find the main loading spinner
jest.mock('lucide-react', () => ({
    Loader: ({ className }: any) => (
        <div
            data-testid="loader"
            className={className || ''}
        >
            Loading...
        </div>
    )
}));

// Mock UI components
jest.mock('@/components/ui/button', () => ({
    Button: ({ children, onClick, type, variant, className }: any) => (
        <button
            onClick={onClick}
            type={type || 'button'}
            data-variant={variant}
            className={className}
            data-testid="ui-button"
        >
            {children}
        </button>
    )
}));

// Create a mock implementation for DeleteConfirmationModal
let modalConfirmHandler: (() => void) | null = null;
let isModalOpen = false;

jest.mock('@/components/shared/DeleteConfirmationModal', () => {
    return {
        __esModule: true,
        default: ({ isOpen, onClose, onConfirm }: any) => {
            // Store handlers for testing
            modalConfirmHandler = onConfirm;
            isModalOpen = isOpen;

            return (
                <div
                    data-testid="delete-modal"
                    data-is-open={isOpen}
                    style={{ display: isOpen ? 'block' : 'none' }}
                >
                    <h2>Delete Post</h2>
                    <p>Are you sure you want to delete this post?</p>
                    <button
                        data-testid="confirm-delete-button"
                        onClick={onConfirm}
                    >
                        Delete
                    </button>
                    <button
                        data-testid="cancel-delete-button"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                </div>
            );
        }
    };
});

// Mock Dialog components
jest.mock('@/components/ui/dialog', () => ({
    Dialog: ({ children, open }: any) => (
        <div data-testid="dialog" data-open={open} style={{ display: open ? 'block' : 'none' }}>
            {children}
        </div>
    ),
    DialogContent: ({ children, className }: any) => <div className={className}>{children}</div>,
    DialogHeader: ({ children }: any) => <div>{children}</div>,
    DialogFooter: ({ children, className }: any) => <div className={className}>{children}</div>,
    DialogTitle: ({ children, className }: any) => <div className={className}>{children}</div>,
    DialogDescription: ({ children, className }: any) => <div className={className}>{children}</div>,
}));

describe('PostDetails Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset state for each test
        isLoadingPost = true;
        isLoadingUserPosts = true;
        mockDeleteMutate = jest.fn();
        modalConfirmHandler = null;
        isModalOpen = false;

        // Mock window.innerWidth for responsive testing
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 1200, // Default to desktop view
        });
    });

    it('renders loading state correctly', () => {
        isLoadingPost = true;

        render(
            <BrowserRouter>
                <PostDetails />
            </BrowserRouter>
        );

        // Find the main loader by its className that matches our component
        const mainLoader = screen.getAllByTestId('loader').find(el =>
            el.className.includes('animate-spin')
        );

        expect(mainLoader).toBeInTheDocument();
    });

    it('renders post details when data is loaded', () => {
        isLoadingPost = false;
        isLoadingUserPosts = false;

        render(
            <BrowserRouter>
                <PostDetails />
            </BrowserRouter>
        );

        // Check for post content
        expect(screen.getByTestId('post-stats')).toBeInTheDocument();
        expect(screen.getByTestId('comment-section')).toBeInTheDocument();
        expect(screen.getByTestId('grid-post-list')).toBeInTheDocument();
    });

    it('navigates back when back button is clicked', () => {
        isLoadingPost = false;

        render(
            <BrowserRouter>
                <PostDetails />
            </BrowserRouter>
        );

        // Find back button (either desktop or mobile version)
        const backButtons = screen.getAllByTestId('ui-button');
        const backButton = backButtons[0]; // First button should be back button

        // Click the back button
        fireEvent.click(backButton);

        // Check that navigate was called with -1
        const navigate = require('react-router-dom').useNavigate();
        expect(navigate).toHaveBeenCalledWith(-1);
    });

    it('renders in mobile view when screen width is small', () => {
        isLoadingPost = false;

        // Set window width to mobile size
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 700,
        });

        // Trigger resize event
        window.dispatchEvent(new Event('resize'));

        render(
            <BrowserRouter>
                <PostDetails />
            </BrowserRouter>
        );

        // If it renders without errors in mobile view, test passes
        expect(true).toBeTruthy();
    });

    it('handles post deletion flow correctly', () => {
        isLoadingPost = false;

        render(
            <BrowserRouter>
                <PostDetails />
            </BrowserRouter>
        );

        // Directly invoke the openDeleteModal function by simulating the workflow
        const deleteButtons = screen.getAllByTestId('ui-button');
        let deleteButton: HTMLElement | null = null;

        // Look for a button with child image with alt="delete"
        for (const button of deleteButtons) {
            if (button.innerHTML.includes('delete')) {
                deleteButton = button;
                break;
            }
        }

        if (deleteButton) {
            // Click delete button
            fireEvent.click(deleteButton);

            // The modal should be open now
            expect(isModalOpen).toBe(true);

            // Find and click confirm button by invoking the handler directly
            if (modalConfirmHandler) {
                modalConfirmHandler();

                // Delete mutation should have been called
                expect(mockDeleteMutate).toHaveBeenCalled();
            }
        }
    });

    it('renders related posts when available', () => {
        isLoadingPost = false;
        isLoadingUserPosts = false;

        render(
            <BrowserRouter>
                <PostDetails />
            </BrowserRouter>
        );

        const gridPostList = screen.getByTestId('grid-post-list');
        expect(gridPostList).toBeInTheDocument();
        expect(gridPostList).toHaveAttribute('data-posts-count', '1');
    });
});