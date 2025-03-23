import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { mockGetUserById, mockUpdateUser } from '@/__tests__/__mocks__/api';

// Mock the entire module first
jest.mock('@/_root/pages/UpdateProfile', () => {
  // Import the actual function just for mocking
  const originalModule = jest.requireActual('@/_root/pages/UpdateProfile');
  // Return the default export (the component) so Jest won't actually run the real component code
  return originalModule.default;
});

// Now import the component after mocking
import UpdateProfile from '@/_root/pages/UpdateProfile';

// Mock React Router
jest.mock('react-router-dom', () => ({
  useNavigate: () => jest.fn(),
  useParams: () => ({ id: 'user123' }),
}));

// Mock Auth Context
jest.mock('@/context/AuthContext', () => {
  const mockUser = {
    id: 'user123',
    $id: 'user123',
    name: 'Test User',
    username: 'testuser',
    email: 'test@example.com',
    imageUrl: 'https://example.com/profile.jpg',
    bio: 'This is a test bio',
  };

  return {
    useUserContext: () => ({
      user: mockUser,
      setUser: jest.fn(),
      isAuthenticated: true,
    }),
  };
});

// Mock form components
jest.mock('@/components/ui/form', () => ({
  Form: ({ children }) => <form data-testid='form'>{children}</form>,
  FormControl: ({ children }) => (
    <div data-testid='form-control'>{children}</div>
  ),
  FormField: ({ render }) =>
    render({ field: { onChange: jest.fn(), value: '' } }),
  FormItem: ({ children }) => <div data-testid='form-item'>{children}</div>,
  FormLabel: ({ children }) => (
    <label data-testid='form-label'>{children}</label>
  ),
  FormMessage: ({ children }) => <p data-testid='form-message'>{children}</p>,
}));

// Mock input components
jest.mock('@/components/ui/input', () => ({
  Input: (props) => (
    <input
      data-testid='input'
      onChange={props.onChange}
      value={props.value || ''}
      disabled={props.disabled}
      {...props}
    />
  ),
}));

// Mock textarea component
jest.mock('@/components/ui/textarea', () => ({
  Textarea: (props) => (
    <textarea
      data-testid='textarea'
      onChange={props.onChange}
      value={props.value || ''}
      {...props}
    />
  ),
}));

// Mock button component
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, type, disabled }) => (
    <button
      data-testid={`button-${type || 'button'}`}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      {children}
    </button>
  ),
}));

// Mock the image uploaders
jest.mock('@/components/shared/ProfileUploader', () => ({
  __esModule: true,
  default: ({ fieldChange, mediaUrl }) => (
    <div data-testid='profile-uploader' data-media-url={mediaUrl}>
      <button
        data-testid='upload-profile-button'
        onClick={() => fieldChange([new File(['test'], 'profile.jpg')])}
      >
        Upload Profile
      </button>
    </div>
  ),
}));

jest.mock('@/components/shared/CoverPhotoUploader', () => ({
  __esModule: true,
  default: ({ fieldChange, mediaUrl, positionChange, defaultPosition }) => (
    <div
      data-testid='cover-uploader'
      data-media-url={mediaUrl}
      data-default-position={defaultPosition}
    >
      <button
        data-testid='upload-cover-button'
        onClick={() => fieldChange([new File(['test'], 'cover.jpg')])}
      >
        Upload Cover
      </button>
      <button
        data-testid='change-position-button'
        onClick={() => positionChange(JSON.stringify({ x: 10, y: 20 }))}
      >
        Change Position
      </button>
    </div>
  ),
}));

// Mock Loader icon
jest.mock('lucide-react', () => ({
  Loader: () => <div data-testid='loader-icon'>Loading...</div>,
}));

// Mock external library modules that may cause issues
jest.mock('@hookform/resolvers/zod', () => ({
  zodResolver: jest.fn(() => jest.fn()),
}));

jest.mock('react-hook-form', () => ({
  useForm: () => ({
    register: jest.fn(),
    handleSubmit: (cb) => (data) => cb(data),
    formState: { errors: {} },
    control: { _formValues: {} },
    setValue: jest.fn(),
  }),
}));

describe('UpdateProfile Component', () => {
  const mockUserData = {
    $id: 'user123',
    name: 'Test User',
    username: 'testuser',
    email: 'test@example.com',
    imageUrl: 'https://example.com/profile.jpg',
    coverImageUrl: 'https://example.com/cover.jpg',
    bio: 'This is a test bio',
    coverPosition: '{ "x": 0, "y": 0 }',
    imageId: 'profile-image-id',
    coverImageId: 'cover-image-id',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset mock implementations
    mockGetUserById.mockReturnValue({
      data: mockUserData,
      isLoading: false,
    });

    mockUpdateUser.mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue({
        ...mockUserData,
        name: 'Updated Name',
        bio: 'Updated bio',
      }),
      isPending: false,
    });
  });

  it('renders the form with correct field labels', () => {
    render(<UpdateProfile />);

    // Check for page title
    expect(screen.getByText('Edit Profile')).toBeInTheDocument();

    // Check for form labels
    expect(screen.getAllByTestId('form-label')[0]).toHaveTextContent(
      'Cover Photo'
    );
    expect(screen.getAllByTestId('form-label')[1]).toHaveTextContent(
      'Profile Picture'
    );
    expect(screen.getAllByTestId('form-label')[2]).toHaveTextContent('Name');
    expect(screen.getAllByTestId('form-label')[3]).toHaveTextContent(
      'Username'
    );
    expect(screen.getAllByTestId('form-label')[4]).toHaveTextContent('Email');
    expect(screen.getAllByTestId('form-label')[5]).toHaveTextContent('Bio');
  });

  it('renders the profile uploader with correct media URL', () => {
    render(<UpdateProfile />);

    const profileUploader = screen.getByTestId('profile-uploader');
    expect(profileUploader).toBeInTheDocument();
    expect(profileUploader).toHaveAttribute(
      'data-media-url',
      'https://example.com/profile.jpg'
    );
  });

  it('renders the cover uploader with correct media URL and position', () => {
    render(<UpdateProfile />);

    const coverUploader = screen.getByTestId('cover-uploader');
    expect(coverUploader).toBeInTheDocument();
    expect(coverUploader).toHaveAttribute(
      'data-media-url',
      'https://example.com/cover.jpg'
    );
    expect(coverUploader).toHaveAttribute(
      'data-default-position',
      '{ "x": 0, "y": 0 }'
    );
  });

  it('renders action buttons (Cancel and Update)', () => {
    render(<UpdateProfile />);

    const cancelButton = screen.getByTestId('button-button');
    expect(cancelButton).toBeInTheDocument();
    expect(cancelButton).toHaveTextContent('Cancel');

    const updateButton = screen.getByTestId('button-submit');
    expect(updateButton).toBeInTheDocument();
    expect(updateButton).toHaveTextContent('Update Profile');
  });

  it('shows loader when updating the profile', () => {
    // Mock the update user function to be in loading state
    mockUpdateUser.mockReturnValue({
      mutateAsync: jest.fn().mockResolvedValue(mockUserData),
      isPending: true,
    });

    render(<UpdateProfile />);

    // Update button should show loading state
    const updateButton = screen.getByTestId('button-submit');
    expect(updateButton).toHaveTextContent('Update Profile');
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
  });

  it('handles profile image upload', () => {
    render(<UpdateProfile />);

    const uploadButton = screen.getByTestId('upload-profile-button');
    expect(uploadButton).toBeInTheDocument();

    fireEvent.click(uploadButton);
    // Since we're mocking fieldChange, we just verify the button is available and clickable
  });

  it('handles cover image upload and position change', () => {
    render(<UpdateProfile />);

    const uploadButton = screen.getByTestId('upload-cover-button');
    expect(uploadButton).toBeInTheDocument();

    const positionButton = screen.getByTestId('change-position-button');
    expect(positionButton).toBeInTheDocument();

    fireEvent.click(uploadButton);
    fireEvent.click(positionButton);
    // Since we're mocking the handlers, we just verify the buttons are available and clickable
  });
});
