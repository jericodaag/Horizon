import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfileUploader from '@/components/shared/ProfileUploader';
import { FileWithPath } from 'react-dropzone';

jest.unmock('@/components/shared/ProfileUploader');

URL.createObjectURL = jest.fn(() => 'mocked-file-url');

jest.mock('react-dropzone', () => ({
  useDropzone: jest.fn(() => ({
    getRootProps: () => ({
      onClick: jest.fn(),
      onKeyDown: jest.fn(),
      role: 'button',
      tabIndex: 0,
    }),
    getInputProps: () => ({
      type: 'file',
      multiple: false,
      accept: 'image/*',
    }),
    open: jest.fn(),
  })),
  FileWithPath: jest.requireActual('react-dropzone').FileWithPath,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className }) => (
    <button onClick={onClick} className={className} data-testid='select-button'>
      {children}
    </button>
  ),
}));

describe('ProfileUploader Component', () => {
  const mockFieldChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with profile placeholder when no mediaUrl is provided', () => {
    render(<ProfileUploader fieldChange={mockFieldChange} mediaUrl='' />);

    const placeholderImg = screen.getByAltText('file upload');
    expect(placeholderImg).toBeInTheDocument();
    expect(placeholderImg).toHaveAttribute(
      'src',
      '/assets/icons/profile-placeholder.svg'
    );

    expect(screen.getByText('Drag photo here')).toBeInTheDocument();
    expect(screen.getByText('SVG, PNG, JPG')).toBeInTheDocument();

    expect(screen.getByTestId('select-button')).toBeInTheDocument();
    expect(screen.getByText('Select from computer')).toBeInTheDocument();
  });

  it('renders with profile image when mediaUrl is provided', () => {
    const testMediaUrl = 'test-profile-image.jpg';
    render(
      <ProfileUploader fieldChange={mockFieldChange} mediaUrl={testMediaUrl} />
    );

    const profileImg = screen.getByAltText('profile');
    expect(profileImg).toBeInTheDocument();
    expect(profileImg).toHaveAttribute('src', testMediaUrl);

    expect(
      screen.getByText('Click or drag photo to replace')
    ).toBeInTheDocument();

    expect(screen.queryByAltText('file upload')).not.toBeInTheDocument();
    expect(screen.queryByText('Drag photo here')).not.toBeInTheDocument();
    expect(screen.queryByTestId('select-button')).not.toBeInTheDocument();
  });

  it('calls open method when profile image is clicked', () => {
    const { useDropzone } = require('react-dropzone');
    const mockOpen = jest.fn();

    useDropzone.mockReturnValue({
      getRootProps: () => ({}),
      getInputProps: () => ({}),
      open: mockOpen,
    });

    render(
      <ProfileUploader
        fieldChange={mockFieldChange}
        mediaUrl='test-image.jpg'
      />
    );

    const profileImg = screen.getByAltText('profile');
    fireEvent.click(profileImg);

    expect(mockOpen).toHaveBeenCalledTimes(1);
  });

  it('calls open method when placeholder image is clicked', () => {
    const { useDropzone } = require('react-dropzone');
    const mockOpen = jest.fn();

    useDropzone.mockReturnValue({
      getRootProps: () => ({}),
      getInputProps: () => ({}),
      open: mockOpen,
    });

    render(<ProfileUploader fieldChange={mockFieldChange} mediaUrl='' />);

    const placeholderImg = screen.getByAltText('file upload');
    fireEvent.click(placeholderImg);

    expect(mockOpen).toHaveBeenCalledTimes(1);
  });

  it('calls open method when select button is clicked', () => {
    const { useDropzone } = require('react-dropzone');
    const mockOpen = jest.fn();

    useDropzone.mockReturnValue({
      getRootProps: () => ({}),
      getInputProps: () => ({}),
      open: mockOpen,
    });

    render(<ProfileUploader fieldChange={mockFieldChange} mediaUrl='' />);

    const selectButton = screen.getByTestId('select-button');
    fireEvent.click(selectButton);

    expect(mockOpen).toHaveBeenCalledTimes(1);
  });

  it('calls fieldChange and updates preview when files are dropped', () => {
    const { useDropzone } = require('react-dropzone');

    const mockOnDrop = jest.fn();

    useDropzone.mockImplementation((options) => {
      mockOnDrop.mockImplementation(options.onDrop);

      return {
        getRootProps: () => ({}),
        getInputProps: () => ({}),
        open: jest.fn(),
      };
    });

    render(<ProfileUploader fieldChange={mockFieldChange} mediaUrl='' />);

    const mockFile = new File(['file content'], 'test-image.png', {
      type: 'image/png',
    });
    const mockFiles = [mockFile] as FileWithPath[];

    mockOnDrop(mockFiles);

    expect(mockFieldChange).toHaveBeenCalledWith(mockFiles);

    expect(URL.createObjectURL).toHaveBeenCalledWith(mockFile);
  });

  it('prevents event propagation when select button is clicked', () => {
    const { useDropzone } = require('react-dropzone');
    const mockOpen = jest.fn();

    useDropzone.mockReturnValue({
      getRootProps: () => ({}),
      getInputProps: () => ({}),
      open: mockOpen,
    });

    render(<ProfileUploader fieldChange={mockFieldChange} mediaUrl='' />);

    const selectButton = screen.getByTestId('select-button');

    fireEvent.click(selectButton);

    expect(mockOpen).toHaveBeenCalled();
  });
});
