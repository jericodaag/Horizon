import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CreatePostButton from '@/components/shared/CreatePostButton';

jest.mock('react-router-dom', () => ({
    Link: ({ children, to }) => (
        <a href={to} data-testid="create-post-link">
            {children}
        </a>
    ),
}));

jest.mock('@/components/ui/button', () => ({
    Button: ({ children, className }) => (
        <button className={className} data-testid="create-post-button">
            {children}
        </button>
    ),
}));

describe('CreatePostButton Component', () => {
    it('renders with default styling', () => {
        render(<CreatePostButton />);

        const link = screen.getByTestId('create-post-link');
        expect(link).toHaveAttribute('href', '/create-post');

        const button = screen.getByTestId('create-post-button');
        expect(button).toHaveClass('w-full');
        expect(button).toHaveClass('bg-primary-500');
        expect(button).toHaveClass('hover:bg-primary-600');
        expect(button).toHaveClass('text-white');
        expect(button).toHaveClass('rounded-xl');
        expect(button).toHaveClass('py-3');

        expect(screen.getByAltText('create')).toBeInTheDocument();
        expect(screen.getByText('Create New Post')).toBeInTheDocument();
    });

    it('applies additional className when provided', () => {
        render(<CreatePostButton className="custom-class" />);

        const button = screen.getByTestId('create-post-button');
        expect(button).toHaveClass('custom-class');
        expect(button).toHaveClass('w-full');
    });
});