import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DeleteConfirmationModal from '@/components/shared/DeleteConfirmationModal';

// Unmock the component we're testing
jest.unmock('@/components/shared/DeleteConfirmationModal');

// Mock the UI components
jest.mock('@/components/ui/button', () => ({
    Button: ({ children, onClick, type, variant, className }) => (
        <button
            onClick={onClick}
            type={type || 'button'}
            data-variant={variant}
            className={className}
        >
            {children}
        </button>
    ),
}));

jest.mock('@/components/ui/dialog', () => ({
    Dialog: ({ children, open }) => (
        open ? <div data-testid="dialog">{children}</div> : null
    ),
    DialogContent: ({ children, className }) => (
        <div data-testid="dialog-content" className={className}>{children}</div>
    ),
    DialogHeader: ({ children }) => (
        <div data-testid="dialog-header">{children}</div>
    ),
    DialogTitle: ({ children, className }) => (
        <h2 data-testid="dialog-title" className={className}>{children}</h2>
    ),
    DialogDescription: ({ children, className }) => (
        <p data-testid="dialog-description" className={className}>{children}</p>
    ),
    DialogFooter: ({ children, className }) => (
        <div data-testid="dialog-footer" className={className}>{children}</div>
    ),
}));

describe('DeleteConfirmationModal Component', () => {
    // Setup common test props
    const defaultProps = {
        isOpen: true,
        onClose: jest.fn(),
        onConfirm: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders when isOpen is true', () => {
        render(<DeleteConfirmationModal {...defaultProps} />);

        // The dialog should be visible
        expect(screen.getByTestId('dialog')).toBeInTheDocument();

        // Check for title and description with default values
        expect(screen.getByTestId('dialog-title')).toHaveTextContent('Delete Post');
        expect(screen.getByTestId('dialog-description')).toHaveTextContent(
            'Are you sure you want to delete this post? This action cannot be undone.'
        );

        // Check for buttons
        expect(screen.getByText('Cancel')).toBeInTheDocument();
        expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
        render(<DeleteConfirmationModal {...defaultProps} isOpen={false} />);

        // The dialog should not be visible
        expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
    });

    it('renders with custom title and description', () => {
        const customProps = {
            ...defaultProps,
            title: 'Custom Title',
            description: 'Custom description text for testing.',
        };

        render(<DeleteConfirmationModal {...customProps} />);

        // Check for custom title and description
        expect(screen.getByTestId('dialog-title')).toHaveTextContent('Custom Title');
        expect(screen.getByTestId('dialog-description')).toHaveTextContent(
            'Custom description text for testing.'
        );
    });

    it('calls onClose when Cancel button is clicked', () => {
        render(<DeleteConfirmationModal {...defaultProps} />);

        // Click the Cancel button
        fireEvent.click(screen.getByText('Cancel'));

        // onClose should be called
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
        // onConfirm should not be called
        expect(defaultProps.onConfirm).not.toHaveBeenCalled();
    });

    it('calls both onConfirm and onClose when Delete button is clicked', () => {
        render(<DeleteConfirmationModal {...defaultProps} />);

        // Click the Delete button
        fireEvent.click(screen.getByText('Delete'));

        // Both callbacks should be called
        expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });
});