import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditPost from '@/_root/pages/EditPost';

// Import specific mocks we need
import { mockGetPostById } from '@/__tests__/__mocks__/api';

// Mock useParams to return a specific ID
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: () => ({ id: 'post123' })
}));

describe('EditPost Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shows loader when fetching post data', () => {
        // Configure the mock for this test
        mockGetPostById.mockReturnValue({
            data: null,
            isLoading: true
        });

        render(<EditPost />);

        // Check for loader
        expect(screen.getByTestId('loader')).toBeInTheDocument();
    });

    it('renders the edit form with post data when loaded', () => {
        // Configure the mock for this test
        const mockPost = {
            $id: 'post123',
            caption: 'Test post',
            imageUrl: 'image.jpg'
        };

        mockGetPostById.mockReturnValue({
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

        // Check if PostForm is rendered with the correct attributes
        const postForm = screen.getByTestId('post-form');
        expect(postForm).toBeInTheDocument();
        expect(postForm).toHaveAttribute('data-action', 'Update');
        expect(postForm).toHaveAttribute('data-post-id', 'post123');
    });
});