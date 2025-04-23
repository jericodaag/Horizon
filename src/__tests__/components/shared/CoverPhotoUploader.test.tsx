import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CoverPhotoUploader from '@/components/shared/CoverPhotoUploader';

jest.unmock('@/components/shared/CoverPhotoUploader');

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

jest.mock('lucide-react', () => ({
    ArrowUp: () => <span>ArrowUp</span>,
    ArrowDown: () => <span>ArrowDown</span>,
    Check: () => <span>Check</span>,
    X: () => <span>X</span>,
}));

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

const mockCreateObjectURL = jest.fn(() => 'mock-url');
URL.createObjectURL = mockCreateObjectURL;

describe('CoverPhotoUploader Component', () => {
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

        expect(screen.getByText('Add cover photo')).toBeInTheDocument();
        expect(screen.getByAltText('add cover')).toBeInTheDocument();
    });

    it('renders the existing cover image when mediaUrl is provided', () => {
        const props = { ...defaultProps, mediaUrl: 'https://example.com/cover.jpg' };
        render(<CoverPhotoUploader {...props} />);

        const coverImage = screen.getByAltText('cover');
        expect(coverImage).toBeInTheDocument();
        expect(coverImage).toHaveAttribute('src', 'https://example.com/cover.jpg');

        expect(screen.getByText('Adjust Cover')).toBeInTheDocument();
    });

    it('enters edit mode when adjust cover button is clicked', () => {
        const props = { ...defaultProps, mediaUrl: 'https://example.com/cover.jpg' };
        render(<CoverPhotoUploader {...props} />);

        const adjustButton = screen.getByText('Adjust Cover');
        fireEvent.click(adjustButton);

        expect(screen.getByText('ArrowUp')).toBeInTheDocument();
        expect(screen.getByText('ArrowDown')).toBeInTheDocument();
        expect(screen.getByText('Check')).toBeInTheDocument();
        expect(screen.getByText('X')).toBeInTheDocument();

        expect(screen.queryByText('Adjust Cover')).not.toBeInTheDocument();
    });

    it('calls positionChange when cover position is saved', () => {
        const props = { ...defaultProps, mediaUrl: 'https://example.com/cover.jpg' };
        render(<CoverPhotoUploader {...props} />);

        const adjustButton = screen.getByText('Adjust Cover');
        fireEvent.click(adjustButton);

        const upButton = screen.getByText('ArrowUp').closest('button');
        const saveButton = screen.getByText('Check').closest('button');

        if (upButton && saveButton) {
            fireEvent.click(upButton);

            fireEvent.click(saveButton);

            expect(props.positionChange).toHaveBeenCalledWith(expect.stringContaining('"y":45'));

            expect(screen.getByText('Adjust Cover')).toBeInTheDocument();
        } else {
            throw new Error('Failed to find buttons');
        }
    });

    it('exits edit mode without saving when cancel is clicked', () => {
        const props = { ...defaultProps, mediaUrl: 'https://example.com/cover.jpg' };
        render(<CoverPhotoUploader {...props} />);

        const adjustButton = screen.getByText('Adjust Cover');
        fireEvent.click(adjustButton);

        const downButton = screen.getByText('ArrowDown').closest('button');
        const cancelButton = screen.getByText('X').closest('button');

        if (downButton && cancelButton) {
            fireEvent.click(downButton);

            fireEvent.click(cancelButton);

            expect(props.positionChange).not.toHaveBeenCalled();

            expect(screen.getByText('Adjust Cover')).toBeInTheDocument();
        } else {
            throw new Error('Failed to find buttons');
        }
    });

    it('handles missing positionChange prop gracefully', () => {
        const propsWithoutPositionChange = {
            fieldChange: jest.fn(),
            mediaUrl: 'https://example.com/cover.jpg',
        };

        render(<CoverPhotoUploader {...propsWithoutPositionChange} />);

        const adjustButton = screen.getByText('Adjust Cover');
        fireEvent.click(adjustButton);

        const upButton = screen.getByText('ArrowUp').closest('button');
        const saveButton = screen.getByText('Check').closest('button');

        if (upButton && saveButton) {
            fireEvent.click(upButton);
            fireEvent.click(saveButton);

            expect(screen.getByText('Adjust Cover')).toBeInTheDocument();
        } else {
            throw new Error('Failed to find buttons');
        }
    });
});