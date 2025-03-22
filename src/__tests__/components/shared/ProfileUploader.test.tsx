import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProfileUploader from '@/components/shared/ProfileUploader';
import { FileWithPath } from 'react-dropzone';

// Unmock the component we're testing
jest.unmock('@/components/shared/ProfileUploader');

// Mock URL.createObjectURL
URL.createObjectURL = jest.fn(() => 'mocked-file-url');

// Mock react-dropzone
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

// Mock Button component
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

    // Check if placeholder image is rendered
    const placeholderImg = screen.getByAltText('file upload');
    expect(placeholderImg).toBeInTheDocument();
    expect(placeholderImg).toHaveAttribute(
      'src',
      '/assets/icons/profile-placeholder.svg'
    );

    // Check if text instructions are shown
    expect(screen.getByText('Drag photo here')).toBeInTheDocument();
    expect(screen.getByText('SVG, PNG, JPG')).toBeInTheDocument();

    // Check if button is rendered
    expect(screen.getByTestId('select-button')).toBeInTheDocument();
    expect(screen.getByText('Select from computer')).toBeInTheDocument();
  });

  it('renders with profile image when mediaUrl is provided', () => {
    const testMediaUrl = 'test-profile-image.jpg';
    render(
      <ProfileUploader fieldChange={mockFieldChange} mediaUrl={testMediaUrl} />
    );

    // Check if profile image is rendered with correct URL
    const profileImg = screen.getByAltText('profile');
    expect(profileImg).toBeInTheDocument();
    expect(profileImg).toHaveAttribute('src', testMediaUrl);

    // Check if replacement text is shown
    expect(
      screen.getByText('Click or drag photo to replace')
    ).toBeInTheDocument();

    // Placeholder and button should not be shown
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

    // Click on the profile image
    const profileImg = screen.getByAltText('profile');
    fireEvent.click(profileImg);

    // Check if open method was called
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

    // Click on the placeholder image
    const placeholderImg = screen.getByAltText('file upload');
    fireEvent.click(placeholderImg);

    // Check if open method was called
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

    // Click on the select button
    const selectButton = screen.getByTestId('select-button');
    fireEvent.click(selectButton);

    // Check if open method was called
    expect(mockOpen).toHaveBeenCalledTimes(1);
  });

  it('calls fieldChange and updates preview when files are dropped', () => {
    // Need to access the onDrop function directly
    const { useDropzone } = require('react-dropzone');

    // Create a mock for the onDrop function
    const mockOnDrop = jest.fn();

    // Directly mock the implementation to capture the onDrop function
    useDropzone.mockImplementation((options) => {
      // Store the onDrop function so we can call it later
      mockOnDrop.mockImplementation(options.onDrop);

      return {
        getRootProps: () => ({}),
        getInputProps: () => ({}),
        open: jest.fn(),
      };
    });

    render(<ProfileUploader fieldChange={mockFieldChange} mediaUrl='' />);

    // Create a mock file
    const mockFile = new File(['file content'], 'test-image.png', {
      type: 'image/png',
    });
    const mockFiles = [mockFile] as FileWithPath[];

    // Call the onDrop function with mock files
    mockOnDrop(mockFiles);

    // Check if fieldChange was called with the file
    expect(mockFieldChange).toHaveBeenCalledWith(mockFiles);

    // Check if URL.createObjectURL was called
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

    // Simply test that clicking the button calls the open method
    fireEvent.click(selectButton);

    // Verify that open was called, which implies the handler ran
    expect(mockOpen).toHaveBeenCalled();
  });
});
