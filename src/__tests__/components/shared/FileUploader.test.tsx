import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import FileUploader from '@/components/shared/FileUploader';
import { convertFileToUrl } from '@/lib/utils';

jest.unmock('@/components/shared/FileUploader');

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

jest.mock('@/lib/utils', () => ({
    convertFileToUrl: jest.fn(() => 'mock-file-url'),
}));

jest.mock('@/components/ui/button', () => ({
    Button: ({ children, type, className }) => (
        <button type={type || 'button'} className={className}>
            {children}
        </button>
    ),
}));

describe('FileUploader Component', () => {
    const defaultProps = {
        fieldChange: jest.fn(),
        mediaUrl: '',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders upload placeholder when no image is provided', () => {
        render(<FileUploader {...defaultProps} />);

        expect(screen.getByText('Drag photo here')).toBeInTheDocument();
        expect(screen.getByText('SVG, PNG, JPG')).toBeInTheDocument();
        expect(screen.getByText('Select from computer')).toBeInTheDocument();
        expect(screen.getByAltText('file upload')).toBeInTheDocument();

        expect(screen.queryByAltText('image')).not.toBeInTheDocument();
    });

    it('renders image preview when mediaUrl is provided', () => {
        const props = {
            ...defaultProps,
            mediaUrl: 'https://example.com/test-image.jpg',
        };

        render(<FileUploader {...props} />);

        const imageElement = screen.getByAltText('image');
        expect(imageElement).toBeInTheDocument();
        expect(imageElement).toHaveAttribute('src', 'https://example.com/test-image.jpg');

        expect(screen.getByText('Click or drag photo to replace')).toBeInTheDocument();

        expect(screen.queryByText('Drag photo here')).not.toBeInTheDocument();
    });

    it('simulates file drop and updates the UI', () => {
        render(<FileUploader {...defaultProps} />);

        const component = screen.getByText('Drag photo here').closest('div');
        expect(component).toBeInTheDocument();

        if (component) {
            const file = new File(['dummy content'], 'test.png', { type: 'image/png' });

            const onDropCallback = require('react-dropzone').useDropzone().getRootProps.mock.calls[0][0].onDrop;
            if (onDropCallback) {
                onDropCallback([file]);

                expect(defaultProps.fieldChange).toHaveBeenCalledWith([file]);

                expect(convertFileToUrl).toHaveBeenCalledWith(file);

                const imageElement = screen.getByAltText('image');
                expect(imageElement).toBeInTheDocument();
                expect(imageElement).toHaveAttribute('src', 'mock-file-url');
            }
        }
    });
});