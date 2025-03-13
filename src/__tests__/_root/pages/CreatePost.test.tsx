import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CreatePost from '@/_root/pages/CreatePost';

// Mock the PostForm component
jest.mock('@/components/forms/PostForm', () => ({
    __esModule: true,
    default: ({ action }: { action: string }) => (
        <div data-testid="post-form" data-action={action}>
            Mocked Post Form
        </div>
    )
}));

describe('CreatePost Component', () => {
    it('renders the page header correctly', () => {
        render(<CreatePost />);

        // Check for page title
        expect(screen.getByText('Create Post')).toBeInTheDocument();

        // Check for the add post icon
        const iconImg = screen.getByAltText('add');
        expect(iconImg).toBeInTheDocument();
        expect(iconImg).toHaveAttribute('src', '/assets/icons/add-post.svg');
    });

    it('renders the PostForm component with correct action prop', () => {
        render(<CreatePost />);

        // Check if PostForm is rendered with the correct action prop
        const postForm = screen.getByTestId('post-form');
        expect(postForm).toBeInTheDocument();
        expect(postForm).toHaveAttribute('data-action', 'Create');
    });
});