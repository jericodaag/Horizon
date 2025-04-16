import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CoverPhotoUploader from '@/components/shared/CoverPhotoUploader';

// Unmock the component we're testing
jest.unmock('@/components/shared/CoverPhotoUploader');

// Mock react-dropzone
jest.mock('react-dropzone', () => ({
    useDropzone: () => ({
        getRootProps: () => ({
            onClick: jest.fn(),
            onKeyDown: jest.fn(),
            tabIndex: 0,
            role: 'button',
        }),
        getInputProps: () => ({
            type: 'file',
            accept: 'image/*',
            multiple: false,
        }),
    }),
}));

// Mock Lucide icons with recognizable text content
jest.mock('lucide-react', () => ({
    ArrowUp: () => <span>ArrowUp</span>,
    ArrowDown: () => <span>ArrowDown</span>,
    Check: () => <span>Check</span>,
    X: () => <span>X</span>,
}));

// Mock Button component to render actual content
jest.mock('@/components/ui/button', () => ({
    Button: ({ children, onClick, type, className, title }) => (
        <button
            onClick={onClick}
            type={type || 'button'}
            className={className}
            title={title}
        >
            {children}
        </button>
    ),
}));

// Mock URL.createObjectURL
const mockCreateObjectURL = jest.fn(() => 'mock-url');
URL.createObjectURL = mockCreateObjectURL;

describe('CoverPhotoUploader Component', () => {
    // Setup common test props
    const defaultProps = {
        fieldChange: jest.fn(),
        mediaUrl: null,
        positionChange: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the dropzone when no media is provided', () => {
        render(<CoverPhotoUploader {...defaultProps} />);

        // Check if the placeholder is rendered
        expect(screen.getByText('Add cover photo')).toBeInTheDocument();
        expect(screen.getByAltText('add cover')).toBeInTheDocument();
    });

    it('renders the existing cover image when mediaUrl is provided', () => {
        const props = { ...defaultProps, mediaUrl: 'https://example.com/cover.jpg' };
        render(<CoverPhotoUploader {...props} />);

        // Check if the image with provided mediaUrl is displayed
        const coverImage = screen.getByAltText('cover');
        expect(coverImage).toBeInTheDocument();
        expect(coverImage).toHaveAttribute('src', 'https://example.com/cover.jpg');

        // Check if the edit button is visible
        expect(screen.getByText('Adjust Cover')).toBeInTheDocument();
    });

    it('enters edit mode when adjust cover button is clicked', () => {
        const props = { ...defaultProps, mediaUrl: 'https://example.com/cover.jpg' };
        render(<CoverPhotoUploader {...props} />);

        // Click the adjust cover button
        const adjustButton = screen.getByText('Adjust Cover');
        fireEvent.click(adjustButton);

        // Check if position controls are displayed
        expect(screen.getByText('ArrowUp')).toBeInTheDocument();
        expect(screen.getByText('ArrowDown')).toBeInTheDocument();
        expect(screen.getByText('Check')).toBeInTheDocument();
        expect(screen.getByText('X')).toBeInTheDocument();

        // The adjust cover button should no longer be visible
        expect(screen.queryByText('Adjust Cover')).not.toBeInTheDocument();
    });

    it('calls positionChange when cover position is saved', () => {
        const props = { ...defaultProps, mediaUrl: 'https://example.com/cover.jpg' };
        render(<CoverPhotoUploader {...props} />);

        // Enter edit mode
        const adjustButton = screen.getByText('Adjust Cover');
        fireEvent.click(adjustButton);

        // Find buttons by their text content (simpler and more reliable)
        const upButton = screen.getByText('ArrowUp').closest('button');
        const saveButton = screen.getByText('Check').closest('button');

        if (upButton && saveButton) {
            // Change position by clicking arrow up
            fireEvent.click(upButton);

            // Save the changes
            fireEvent.click(saveButton);

            // Check if positionChange was called with updated position
            expect(props.positionChange).toHaveBeenCalledWith(expect.stringContaining('"y":45'));

            // Should exit edit mode (adjust cover button should be visible again)
            expect(screen.getByText('Adjust Cover')).toBeInTheDocument();
        } else {
            throw new Error('Failed to find buttons');
        }
    });

    it('exits edit mode without saving when cancel is clicked', () => {
        const props = { ...defaultProps, mediaUrl: 'https://example.com/cover.jpg' };
        render(<CoverPhotoUploader {...props} />);

        // Enter edit mode
        const adjustButton = screen.getByText('Adjust Cover');
        fireEvent.click(adjustButton);

        // Find buttons by their text content
        const downButton = screen.getByText('ArrowDown').closest('button');
        const cancelButton = screen.getByText('X').closest('button');

        if (downButton && cancelButton) {
            // Change position by clicking arrow down
            fireEvent.click(downButton);

            // Cancel the changes
            fireEvent.click(cancelButton);

            // Check that positionChange was not called
            expect(props.positionChange).not.toHaveBeenCalled();

            // Should exit edit mode
            expect(screen.getByText('Adjust Cover')).toBeInTheDocument();
        } else {
            throw new Error('Failed to find buttons');
        }
    });

    it('handles missing positionChange prop gracefully', () => {
        // Create props without positionChange
        const propsWithoutPositionChange = {
            fieldChange: jest.fn(),
            mediaUrl: 'https://example.com/cover.jpg',
        };

        render(<CoverPhotoUploader {...propsWithoutPositionChange} />);

        // Enter edit mode
        const adjustButton = screen.getByText('Adjust Cover');
        fireEvent.click(adjustButton);

        // Find buttons by their text content
        const upButton = screen.getByText('ArrowUp').closest('button');
        const saveButton = screen.getByText('Check').closest('button');

        if (upButton && saveButton) {
            // Change position and save - should not throw errors
            fireEvent.click(upButton);
            fireEvent.click(saveButton);

            // Check that we're back to non-edit mode
            expect(screen.getByText('Adjust Cover')).toBeInTheDocument();
        } else {
            throw new Error('Failed to find buttons');
        }
    });
});