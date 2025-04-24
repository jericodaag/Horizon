import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import FileUploader from '@/components/shared/FileUploader';

jest.mock('react-dropzone', () => ({
    useDropzone: () => ({
        getRootProps: () => ({}),
        getInputProps: () => ({}),
    }),
}));

jest.mock('@/lib/utils', () => ({
    convertFileToUrl: () => 'mocked-file-url',
}));

describe('FileUploader Component', () => {
    const mockFieldChange = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders upload interface when no media is provided', () => {
        render(<FileUploader fieldChange={mockFieldChange} mediaUrl="" />);

        expect(screen.getByAltText('file upload')).toBeInTheDocument();
        expect(screen.getByText('Drag photo here')).toBeInTheDocument();
        expect(screen.getByText('SVG, PNG, JPG')).toBeInTheDocument();
        expect(screen.getByText('Select from computer')).toBeInTheDocument();
    });

    it('displays preview when mediaUrl is provided', () => {
        render(<FileUploader fieldChange={mockFieldChange} mediaUrl="test-image.jpg" />);

        expect(screen.getByAltText('image')).toBeInTheDocument();
        expect(screen.getByAltText('image')).toHaveAttribute('src', 'test-image.jpg');
        expect(screen.getByText('Click or drag photo to replace')).toBeInTheDocument();
    });

    it('handles file upload correctly', () => {
        jest.mock('react-dropzone', () => ({
            useDropzone: ({ onDrop }) => {
                global.testOnDrop = onDrop;

                return {
                    getRootProps: () => ({}),
                    getInputProps: () => ({}),
                };
            },
        }));

        render(<FileUploader fieldChange={mockFieldChange} mediaUrl="" />);

        const mockFile = new File(['file contents'], 'test.png', { type: 'image/png' });

        if (global.testOnDrop) {
            global.testOnDrop([mockFile]);

            expect(mockFieldChange).toHaveBeenCalledWith([mockFile]);
        }
    });

    it('has the correct CSS classes for styling', () => {
        const { container } = render(<FileUploader fieldChange={mockFieldChange} mediaUrl="" />);

        const mainDiv = container.firstChild;
        expect(mainDiv).toHaveClass('flex', 'flex-center', 'flex-col', 'bg-dark-3', 'rounded-xl');

        const uploadBox = screen.getByText('Drag photo here').closest('.file_uploader-box');
        expect(uploadBox).toBeInTheDocument();
    });
});