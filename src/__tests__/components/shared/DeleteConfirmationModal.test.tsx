import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DeleteConfirmationModal from '@/components/shared/DeleteConfirmationModal';

// Unmock the component we're testing
jest.unmock('@/components/shared/DeleteConfirmationModal');

// Mock the UI components
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
    )
}));

jest.mock('@/components/ui/button', () => ({
    Button: ({ children, onClick, className, type }) => (
        <button
            data-testid={`button-${children?.toString().toLowerCase()}`}
            className={className}
            type={type}
            onClick={onClick}
        >
            {children}
        </button>
    )
}));

describe('DeleteConfirmationModal Component', () => {
    const mockOnConfirm = jest.fn();
    const mockOnClose = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders nothing when isOpen is false', () => {
        render(
            <DeleteConfirmationModal
                isOpen={false}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
            />
        );

        expect(screen.queryByTestId('dialog')).not.toBeInTheDocument();
    });

    it('renders the modal with default title and description when isOpen is true', () => {
        render(
            <DeleteConfirmationModal
                isOpen={true}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
            />
        );

        expect(screen.getByTestId('dialog')).toBeInTheDocument();
        expect(screen.getByTestId('dialog-title')).toHaveTextContent('Delete Post');
        expect(screen.getByTestId('dialog-description')).toHaveTextContent(
            'Are you sure you want to delete this post? This action cannot be undone.'
        );
    });

    it('renders with custom title and description when provided', () => {
        const customTitle = 'Delete Comment';
        const customDescription = 'Are you sure you want to delete this comment?';

        render(
            <DeleteConfirmationModal
                isOpen={true}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
                title={customTitle}
                description={customDescription}
            />
        );

        expect(screen.getByTestId('dialog-title')).toHaveTextContent(customTitle);
        expect(screen.getByTestId('dialog-description')).toHaveTextContent(customDescription);
    });

    it('calls onClose when Cancel button is clicked', () => {
        render(
            <DeleteConfirmationModal
                isOpen={true}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
            />
        );

        const cancelButton = screen.getByTestId('button-cancel');
        fireEvent.click(cancelButton);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
        expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    it('calls both onConfirm and onClose when Delete button is clicked', () => {
        render(
            <DeleteConfirmationModal
                isOpen={true}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
            />
        );

        const deleteButton = screen.getByTestId('button-delete');
        fireEvent.click(deleteButton);

        expect(mockOnConfirm).toHaveBeenCalledTimes(1);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('applies correct styling to dialog content', () => {
        render(
            <DeleteConfirmationModal
                isOpen={true}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
            />
        );

        const dialogContent = screen.getByTestId('dialog-content');
        expect(dialogContent).toHaveClass('bg-dark-3 border-none text-light-1');
    });

    it('applies correct styling to buttons', () => {
        render(
            <DeleteConfirmationModal
                isOpen={true}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
            />
        );

        const cancelButton = screen.getByTestId('button-cancel');
        const deleteButton = screen.getByTestId('button-delete');

        expect(cancelButton).toHaveClass('text-light-2 hover:text-light-1 hover:bg-dark-4');
        expect(deleteButton).toHaveClass('bg-red-500 hover:bg-red-600');
    });
});