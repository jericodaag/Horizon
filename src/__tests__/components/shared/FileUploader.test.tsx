import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import FileUploader from '@/components/shared/FileUploader';
import { convertFileToUrl } from '@/lib/utils';
import { FileWithPath } from 'react-dropzone';

// Unmock the component we're testing
jest.unmock('@/components/shared/FileUploader');

// Mock the convertFileToUrl utility
jest.mock('@/lib/utils', () => ({
    convertFileToUrl: jest.fn(() => 'mocked-file-url')
}));

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

// Mock Button component
jest.mock('@/components/ui/button', () => ({
    Button: ({ children, type, className }) => (
        <button type={type} className={className} data-testid="select-button">
            {children}
        </button>
    )
}));

describe('FileUploader Component', () => {
    const mockFieldChange = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders empty state correctly when no mediaUrl is provided', () => {
        render(<FileUploader fieldChange={mockFieldChange} mediaUrl="" />);

        // Check if empty state elements are rendered
        expect(screen.getByAltText('file upload')).toBeInTheDocument();
        expect(screen.getByText('Drag photo here')).toBeInTheDocument();
        expect(screen.getByText('SVG, PNG, JPG')).toBeInTheDocument();
        expect(screen.getByTestId('select-button')).toBeInTheDocument();
        expect(screen.getByText('Select from computer')).toBeInTheDocument();

        // Verify image preview is not shown
        expect(screen.queryByAltText('image')).not.toBeInTheDocument();
    });

    it('renders image preview when mediaUrl is provided', () => {
        render(<FileUploader fieldChange={mockFieldChange} mediaUrl="existing-image.jpg" />);

        // Check if image preview is rendered
        const imagePreview = screen.getByAltText('image');
        expect(imagePreview).toBeInTheDocument();
        expect(imagePreview).toHaveAttribute('src', 'existing-image.jpg');

        // Verify replacement text is shown
        expect(screen.getByText('Click or drag photo to replace')).toBeInTheDocument();

        // Verify empty state elements are not shown
        expect(screen.queryByAltText('file upload')).not.toBeInTheDocument();
        expect(screen.queryByText('Drag photo here')).not.toBeInTheDocument();
    });

    it('handles file drop correctly', () => {
        render(<FileUploader fieldChange={mockFieldChange} mediaUrl="" />);

        // Get the onDrop function from the mock
        const { useDropzone } = require('react-dropzone');
        const lastCallArgs = useDropzone.mock.calls[useDropzone.mock.calls.length - 1];
        const { onDrop } = lastCallArgs[0];

        // Create a mock file
        const mockFile = new File(['file content'], 'test-image.png', { type: 'image/png' });
        const mockFiles = [mockFile] as FileWithPath[];

        // Call onDrop with mock files
        onDrop(mockFiles);

        // Verify fieldChange was called with the files
        expect(mockFieldChange).toHaveBeenCalledWith(mockFiles);

        // Verify convertFileToUrl was called with the first file
        expect(convertFileToUrl).toHaveBeenCalledWith(mockFiles[0]);
    });

    it('applies correct classes to the container', () => {
        const { container } = render(<FileUploader fieldChange={mockFieldChange} mediaUrl="" />);

        // Get the root element
        const rootElement = container.firstChild;

        // Check if it has the expected classes
        expect(rootElement).toHaveClass('flex flex-center flex-col bg-dark-3 rounded-xl cursor-pointer');
    });

    it('uses mediaUrl as initial fileUrl value', () => {
        const testMediaUrl = 'test-media-url.jpg';
        render(<FileUploader fieldChange={mockFieldChange} mediaUrl={testMediaUrl} />);

        // Check if the image src matches the provided mediaUrl
        const imageElement = screen.getByAltText('image');
        expect(imageElement).toHaveAttribute('src', testMediaUrl);
    });
});