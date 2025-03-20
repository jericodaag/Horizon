import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DeleteConfirmationModal from '@/components/shared/DeleteConfirmationModal';

describe('DeleteConfirmationModal Component', () => {
    const mockOnClose = jest.fn();
    const mockOnConfirm = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the modal when isOpen is true', () => {
        render(
            <DeleteConfirmationModal
                isOpen={true}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
            />
        );

        // Check if the modal content is displayed
        expect(screen.getByText('Delete Post')).toBeInTheDocument();
        expect(screen.getByText('Are you sure you want to delete this post? This action cannot be undone.')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });

    it('does not render the modal when isOpen is false', () => {
        render(
            <DeleteConfirmationModal
                isOpen={false}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
            />
        );

        // Check that the modal content is not displayed
        expect(screen.queryByText('Delete Post')).not.toBeInTheDocument();
    });

    it('calls onClose when Cancel button is clicked', () => {
        render(
            <DeleteConfirmationModal
                isOpen={true}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
            />
        );

        // Click the Cancel button
        fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

        // Check if onClose was called
        expect(mockOnClose).toHaveBeenCalledTimes(1);
        // Confirm should not be called
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

        // Click the Delete button
        fireEvent.click(screen.getByRole('button', { name: /delete/i }));

        // Check if both functions were called
        expect(mockOnConfirm).toHaveBeenCalledTimes(1);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('renders with custom title and description', () => {
        const customTitle = 'Custom Delete Title';
        const customDescription = 'Custom delete description text';

        render(
            <DeleteConfirmationModal
                isOpen={true}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
                title={customTitle}
                description={customDescription}
            />
        );

        // Check if custom title and description are displayed
        expect(screen.getByText(customTitle)).toBeInTheDocument();
        expect(screen.getByText(customDescription)).toBeInTheDocument();
    });
});