import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditPost from '@/_root/pages/EditPost';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
    useParams: jest.fn()
}));

// Mock the PostForm component
jest.mock('@/components/forms/PostForm', () => ({
    __esModule: true,
    default: ({ action, post }: { action: string; post: any }) => (
        <div data-testid="post-form" data-action={action} data-post-id={post?.$id}>
            Mocked Post Form
        </div>
    )
}));

// Mock the Loader component
jest.mock('@/components/shared/Loader', () => ({
    __esModule: true,
    default: () => <div data-testid="loader">Loading...</div>
}));

// Mock the query hook
jest.mock('@/lib/react-query/queries', () => ({
    useGetPostById: jest.fn()
}));

// Import mocked modules
import { useParams } from 'react-router-dom';
import { useGetPostById } from '@/lib/react-query/queries';

describe('EditPost Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shows loader when fetching post data', () => {
        // Mock route params
        (useParams as jest.Mock).mockReturnValue({ id: 'post123' });

        // Mock loading state
        (useGetPostById as jest.Mock).mockReturnValue({
            data: null,
            isLoading: true
        });

        render(<EditPost />);

        // Check for loader
        expect(screen.getByTestId('loader')).toBeInTheDocument();
    });

    it('renders the edit form with post data when loaded', () => {
        // Mock route params
        (useParams as jest.Mock).mockReturnValue({ id: 'post123' });

        // Mock post data
        const mockPost = {
            $id: 'post123',
            caption: 'Test post',
            imageUrl: 'image.jpg'
        };

        (useGetPostById as jest.Mock).mockReturnValue({
            data: mockPost,
            isLoading: false
        });

        render(<EditPost />);

        // Check for page title
        expect(screen.getByText('Edit Post')).toBeInTheDocument();

        // Check for the edit icon
        const iconImg = screen.getByAltText('edit');
        expect(iconImg).toBeInTheDocument();
        expect(iconImg).toHaveAttribute('src', '/assets/icons/edit.svg');

        // Check if PostForm is rendered with the correct props
        const postForm = screen.getByTestId('post-form');
        expect(postForm).toBeInTheDocument();
        expect(postForm).toHaveAttribute('data-action', 'Update');
        expect(postForm).toHaveAttribute('data-post-id', 'post123');
    });
});