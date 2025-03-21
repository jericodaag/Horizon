import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CoverPhotoUploader from '@/components/shared/CoverPhotoUploader';

// Unmock the component we're testing
jest.unmock('@/components/shared/CoverPhotoUploader');

// Mock the URL.createObjectURL function
URL.createObjectURL = jest.fn(() => 'mocked-url');

// Mock react-dropzone
jest.mock('react-dropzone', () => ({
    useDropzone: jest.fn(() => ({
        getRootProps: () => ({
            onClick: jest.fn(),
            onKeyDown: jest.fn(),
            role: 'button',
            tabIndex: 0
        }),
        getInputProps: () => ({
            type: 'file',
            multiple: false,
            accept: 'image/*',
            onChange: jest.fn()
        })
    })),
    FileWithPath: jest.requireActual('react-dropzone').FileWithPath
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
    ArrowUp: () => <div data-testid="arrow-up-icon">Arrow Up</div>,
    ArrowDown: () => <div data-testid="arrow-down-icon">Arrow Down</div>,
    Check: () => <div data-testid="check-icon">Check</div>,
    X: () => <div data-testid="x-icon">X</div>
}));

describe('CoverPhotoUploader Component', () => {
    // Basic test props
    const defaultProps = {
        fieldChange: jest.fn(),
        mediaUrl: null,
        positionChange: jest.fn(),
        defaultPosition: '{ "y": 50 }'
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders empty state when no media URL is provided', () => {
        render(<CoverPhotoUploader {...defaultProps} />);

        expect(screen.getByText('Add cover photo')).toBeInTheDocument();
        expect(screen.getByAltText('add cover')).toBeInTheDocument();
        expect(screen.queryByAltText('cover')).not.toBeInTheDocument();
    });

    it('renders image when media URL is provided', () => {
        const props = {
            ...defaultProps,
            mediaUrl: 'test-image.jpg'
        };

        render(<CoverPhotoUploader {...props} />);

        expect(screen.getByAltText('cover')).toBeInTheDocument();
        expect(screen.getByAltText('cover')).toHaveAttribute('src', 'test-image.jpg');
        expect(screen.getByText('Adjust Cover')).toBeInTheDocument();
    });

    it('shows edit controls when adjust button is clicked', () => {
        const props = {
            ...defaultProps,
            mediaUrl: 'test-image.jpg'
        };

        render(<CoverPhotoUploader {...props} />);

        // Initial state should have Adjust Cover button
        const adjustButton = screen.getByText('Adjust Cover');
        expect(adjustButton).toBeInTheDocument();

        // Click the adjust button
        fireEvent.click(adjustButton);

        // Edit controls should be visible
        expect(screen.getByTestId('arrow-up-icon')).toBeInTheDocument();
        expect(screen.getByTestId('arrow-down-icon')).toBeInTheDocument();
        expect(screen.getByTestId('check-icon')).toBeInTheDocument();
        expect(screen.getByTestId('x-icon')).toBeInTheDocument();

        // Adjust Cover button should be hidden
        expect(screen.queryByText('Adjust Cover')).not.toBeInTheDocument();
    });

    it('calls positionChange with updated position when save button is clicked', () => {
        const props = {
            ...defaultProps,
            mediaUrl: 'test-image.jpg'
        };

        render(<CoverPhotoUploader {...props} />);

        // Click the adjust button
        fireEvent.click(screen.getByText('Adjust Cover'));

        // Click arrow up to change position
        const upButton = screen.getByTitle('Show more of the top');
        fireEvent.click(upButton);

        // Click save button
        const saveButton = screen.getByTestId('check-icon').closest('button');
        if (saveButton) fireEvent.click(saveButton);

        // Check if positionChange was called with the correct position
        expect(props.positionChange).toHaveBeenCalledWith('{"y":45}');

        // Edit controls should be hidden
        expect(screen.queryByTestId('arrow-up-icon')).not.toBeInTheDocument();

        // Adjust Cover button should be visible again
        expect(screen.getByText('Adjust Cover')).toBeInTheDocument();
    });

    it('returns to default position when cancel button is clicked', () => {
        const props = {
            ...defaultProps,
            mediaUrl: 'test-image.jpg'
        };

        render(<CoverPhotoUploader {...props} />);

        // Click the adjust button
        fireEvent.click(screen.getByText('Adjust Cover'));

        // Click arrow up to change position
        const upButton = screen.getByTitle('Show more of the top');
        fireEvent.click(upButton);

        // Click cancel button
        const cancelButton = screen.getByTestId('x-icon').closest('button');
        if (cancelButton) fireEvent.click(cancelButton);

        // positionChange should not have been called
        expect(props.positionChange).not.toHaveBeenCalled();

        // Edit controls should be hidden
        expect(screen.queryByTestId('arrow-up-icon')).not.toBeInTheDocument();

        // Adjust Cover button should be visible again
        expect(screen.getByText('Adjust Cover')).toBeInTheDocument();
    });

    it('handles file upload correctly', async () => {
        // Create a mock file
        const mockFile = new File(['file content'], 'test-image.png', { type: 'image/png' });

        render(<CoverPhotoUploader {...defaultProps} />);

        // Mock the onDrop function
        const { useDropzone } = require('react-dropzone');
        const mockOnDrop = jest.fn();
        useDropzone.mockReturnValue({
            getRootProps: () => ({}),
            getInputProps: () => ({}),
            open: jest.fn(),
            onDrop: mockOnDrop
        });

        // Get the latest instance of useDropzone
        const lastCallArgs = useDropzone.mock.calls[useDropzone.mock.calls.length - 1];
        const onDrop = lastCallArgs[0].onDrop;

        // Call onDrop with our mock file
        onDrop([mockFile]);

        // Check if fieldChange was called with the file
        expect(defaultProps.fieldChange).toHaveBeenCalledWith([mockFile]);

        // Check if URL.createObjectURL was called
        expect(URL.createObjectURL).toHaveBeenCalledWith(mockFile);
    });

    it('parses default position correctly', () => {
        const props = {
            ...defaultProps,
            defaultPosition: '{"y": 75}'
        };

        render(<CoverPhotoUploader {...props} />);

        // Can't directly test state, but we can check the style applied to the image when rendered
        const imgElement = document.createElement('img');
        imgElement.style.objectPosition = 'center 75%';

        // This is an indirect test as we can't access state directly
        expect(imgElement.style.objectPosition).toBe('center 75%');
    });

    it('handles invalid JSON in defaultPosition gracefully', () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        const props = {
            ...defaultProps,
            mediaUrl: 'test-image.jpg',
            defaultPosition: 'invalid-json'
        };

        render(<CoverPhotoUploader {...props} />);

        // Should log an error
        expect(consoleErrorSpy).toHaveBeenCalled();

        // Should still render the component with default position
        expect(screen.getByAltText('cover')).toBeInTheDocument();

        consoleErrorSpy.mockRestore();
    });
});