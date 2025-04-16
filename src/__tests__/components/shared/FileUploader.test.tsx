import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import FileUploader from '@/components/shared/FileUploader';
import { convertFileToUrl } from '@/lib/utils';

// Unmock the component we're testing
jest.unmock('@/components/shared/FileUploader');

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

// Mock utility functions
jest.mock('@/lib/utils', () => ({
    convertFileToUrl: jest.fn(() => 'mock-file-url'),
}));

// Mock Button component
jest.mock('@/components/ui/button', () => ({
    Button: ({ children, type, className }) => (
        <button type={type || 'button'} className={className}>
            {children}
        </button>
    ),
}));

describe('FileUploader Component', () => {
    // Common test props
    const defaultProps = {
        fieldChange: jest.fn(),
        mediaUrl: '',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders upload placeholder when no image is provided', () => {
        render(<FileUploader {...defaultProps} />);

        // Check if the upload placeholder is rendered
        expect(screen.getByText('Drag photo here')).toBeInTheDocument();
        expect(screen.getByText('SVG, PNG, JPG')).toBeInTheDocument();
        expect(screen.getByText('Select from computer')).toBeInTheDocument();
        expect(screen.getByAltText('file upload')).toBeInTheDocument();

        // Image preview should not be shown
        expect(screen.queryByAltText('image')).not.toBeInTheDocument();
    });

    it('renders image preview when mediaUrl is provided', () => {
        const props = {
            ...defaultProps,
            mediaUrl: 'https://example.com/test-image.jpg',
        };

        render(<FileUploader {...props} />);

        // Check if the image preview is shown
        const imageElement = screen.getByAltText('image');
        expect(imageElement).toBeInTheDocument();
        expect(imageElement).toHaveAttribute('src', 'https://example.com/test-image.jpg');

        // Check if replacement text is shown
        expect(screen.getByText('Click or drag photo to replace')).toBeInTheDocument();

        // Upload placeholder should not be shown
        expect(screen.queryByText('Drag photo here')).not.toBeInTheDocument();
    });

    it('simulates file drop and updates the UI', () => {
        render(<FileUploader {...defaultProps} />);

        // Get the component instance
        const component = screen.getByText('Drag photo here').closest('div');
        expect(component).toBeInTheDocument();

        if (component) {
            // Create a mock file
            const file = new File(['dummy content'], 'test.png', { type: 'image/png' });

            // Simulate the onDrop callback
            const onDropCallback = require('react-dropzone').useDropzone().getRootProps.mock.calls[0][0].onDrop;
            if (onDropCallback) {
                onDropCallback([file]);

                // Check if fieldChange was called with the file
                expect(defaultProps.fieldChange).toHaveBeenCalledWith([file]);

                // Check if convertFileToUrl was called with the file
                expect(convertFileToUrl).toHaveBeenCalledWith(file);

                // Since we mocked convertFileToUrl to return 'mock-file-url',
                // the image source should now be 'mock-file-url'
                const imageElement = screen.getByAltText('image');
                expect(imageElement).toBeInTheDocument();
                expect(imageElement).toHaveAttribute('src', 'mock-file-url');
            }
        }
    });
});