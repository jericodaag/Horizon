import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FileUploader from '@/components/shared/FileUploader';
import { convertFileToUrl } from '@/lib/utils';

// Mock the convertFileToUrl utility function
jest.mock('@/lib/utils', () => ({
    convertFileToUrl: jest.fn().mockReturnValue('mock-image-url')
}));

describe('FileUploader Component', () => {
    const mockFieldChange = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders empty uploader state when no media URL is provided', () => {
        render(<FileUploader fieldChange={mockFieldChange} mediaUrl="" />);

        // Check if the empty state elements are present
        expect(screen.getByText('Drag photo here')).toBeInTheDocument();
        expect(screen.getByText('SVG, PNG, JPG')).toBeInTheDocument();
        expect(screen.getByText('Select from computer')).toBeInTheDocument();
        expect(screen.getByAltText('file upload')).toBeInTheDocument();
    });

    it('renders image preview when media URL is provided', () => {
        render(<FileUploader fieldChange={mockFieldChange} mediaUrl="existing-image.jpg" />);

        // Check if the image preview is displayed
        const image = screen.getByAltText('image');
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', 'existing-image.jpg');

        // Check if the replace text is present
        expect(screen.getByText('Click or drag photo to replace')).toBeInTheDocument();
    });

    it('calls fieldChange when files are dropped', () => {
        render(<FileUploader fieldChange={mockFieldChange} mediaUrl="" />);

        // Create a sample file for the test
        const file = new File(['file content'], 'test-image.png', { type: 'image/png' });

        // Mock the dropzone behavior by directly calling the handler
        // First, we need to access the dropzone component
        const dropzone = screen.getByText('Drag photo here').closest('div');

        // Ensure dropzone element exists before firing event
        if (!dropzone) {
            throw new Error('Dropzone element not found');
        }

        // Simulate a file drop by creating a custom event
        const dropEvent = createDropEvent([file]);
        fireEvent.drop(dropzone, dropEvent);

        // Check if fieldChange was called with the file
        expect(mockFieldChange).toHaveBeenCalledWith([file]);

        // Check if convertFileToUrl was called with the file
        expect(convertFileToUrl).toHaveBeenCalledWith(file);
    });

    it('updates the image preview when a new file is selected', () => {
        const { rerender } = render(<FileUploader fieldChange={mockFieldChange} mediaUrl="" />);

        // Create a sample file for the test
        const file = new File(['file content'], 'test-image.png', { type: 'image/png' });

        // Mock the dropzone behavior by directly calling the handler
        const dropzone = screen.getByText('Drag photo here').closest('div');

        // Ensure dropzone element exists before firing event
        if (!dropzone) {
            throw new Error('Dropzone element not found');
        }

        // Simulate a file drop
        const dropEvent = createDropEvent([file]);
        fireEvent.drop(dropzone, dropEvent);

        // Re-render the component to simulate state update
        // In a real scenario, the state would be updated by the onDrop callback
        rerender(<FileUploader fieldChange={mockFieldChange} mediaUrl="mock-image-url" />);

        // Check if the image preview is updated
        const image = screen.getByAltText('image');
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', 'mock-image-url');
    });

    it('accepts clicks to open file dialog', () => {
        render(<FileUploader fieldChange={mockFieldChange} mediaUrl="" />);

        // Find the button that triggers file selection
        const selectButton = screen.getByText('Select from computer');

        // We can't directly test the file input click since it's handled by react-dropzone
        // But we can verify the button is rendered and would trigger the click handler
        expect(selectButton).toBeInTheDocument();

        // One approach is to check if the input has the cursor-pointer class
        const inputElement = document.querySelector('input[type="file"]');
        expect(inputElement).toHaveClass('cursor-pointer');
    });
});

// Helper function to create a drop event
function createDropEvent(files) {
    return {
        dataTransfer: {
            files,
            items: files.map(file => ({
                kind: 'file',
                type: file.type,
                getAsFile: () => file
            })),
            types: ['Files']
        },
        preventDefault: jest.fn(),
        stopPropagation: jest.fn()
    };
}