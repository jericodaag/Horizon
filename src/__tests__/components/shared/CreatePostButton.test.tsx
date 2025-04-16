import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CreatePostButton from '@/components/shared/CreatePostButton';

// Unmock the component we're testing
jest.unmock('@/components/shared/CreatePostButton');

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
    Link: ({ children, to }) => (
        <a href={to} data-testid={`link-to-${to.replace(/\//g, '-')}`}>
            {children}
        </a>
    ),
}));

// Mock Button component
jest.mock('@/components/ui/button', () => ({
    Button: ({ children, className }) => (
        <button className={className} data-testid="create-post-button">
            {children}
        </button>
    ),
}));

describe('CreatePostButton Component', () => {
    it('renders correctly with default className', () => {
        render(<CreatePostButton />);

        // Check if the button renders with correct text
        expect(screen.getByText('Create New Post')).toBeInTheDocument();

        // Check if the icon is rendered
        const icon = screen.getByAltText('create');
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveAttribute('src', '/assets/icons/gallery-add.svg');

        // Check if the link points to the correct route
        const link = screen.getByTestId('link-to-create-post');
        expect(link).toHaveAttribute('href', '/create-post');
    });

    it('applies additional className when provided', () => {
        render(<CreatePostButton className="test-class" />);

        // The button should contain both the default and custom classes
        const button = screen.getByTestId('create-post-button');
        expect(button).toHaveClass('w-full');
        expect(button).toHaveClass('bg-primary-500');
        expect(button).toHaveClass('test-class');
    });
});