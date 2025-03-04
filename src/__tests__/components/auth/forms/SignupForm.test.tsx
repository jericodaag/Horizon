import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignupForm from '@/_auth/forms/SignupForm';

// Mock dependencies
const createUserAccountMock = jest.fn();
const signInAccountMock = jest.fn();
const checkAuthUserMock = jest.fn();
const navigateMock = jest.fn();
const toastMock = jest.fn();

jest.mock('@/lib/react-query/queries', () => ({
  useCreateUserAccount: () => ({
    mutateAsync: createUserAccountMock,
    isPending: false,
  }),
  useSignInAccount: () => ({
    mutateAsync: signInAccountMock,
    isPending: false,
  }),
}));

jest.mock('@/context/AuthContext', () => ({
  useUserContext: () => ({
    checkAuthUser: checkAuthUserMock,
    isLoading: false,
  }),
}));

jest.mock('react-router-dom', () => ({
  useNavigate: () => navigateMock,
}));

jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: toastMock,
  }),
}));

describe('SignupForm', () => {
  const mockOnLoadingChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const fillForm = () => {
    fireEvent.change(screen.getByPlaceholderText('Enter your name'), {
      target: { value: 'Test User' },
    });
    fireEvent.change(screen.getByPlaceholderText('Choose a username'), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByPlaceholderText('example@email.com'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('At least 8 characters'), {
      target: { value: 'password123' },
    });
  };

  it('renders all form elements correctly', () => {
    render(<SignupForm onLoadingChange={mockOnLoadingChange} />);

    expect(screen.getByText('Create Account 👋')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Password')).toBeInTheDocument();
    expect(screen.getByText('Sign up')).toBeInTheDocument();
  });

  it('successfully creates an account and navigates home', async () => {
    // Setup successful mocks
    createUserAccountMock.mockResolvedValue({ user: { id: 'user123' } });
    signInAccountMock.mockResolvedValue({ session: { id: 'session123' } });
    checkAuthUserMock.mockResolvedValue(true);

    render(<SignupForm onLoadingChange={mockOnLoadingChange} />);

    // Fill and submit form
    fillForm();
    fireEvent.click(screen.getByText('Sign up'));

    // Wait and verify
    await waitFor(() => {
      expect(createUserAccountMock).toHaveBeenCalledWith({
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });
      expect(signInAccountMock).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(checkAuthUserMock).toHaveBeenCalled();
      expect(navigateMock).toHaveBeenCalledWith('/home');
    });
  });

  it('handles account creation failure', async () => {
    // Setup failure scenario
    createUserAccountMock.mockResolvedValue(null);

    render(<SignupForm onLoadingChange={mockOnLoadingChange} />);

    // Fill and submit form
    fillForm();
    fireEvent.click(screen.getByText('Sign up'));

    // Wait and verify
    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Sign up failed',
          variant: 'destructive',
        })
      );
    });
  });

  it('handles sign in failure after account creation', async () => {
    // Setup partial failure scenario
    createUserAccountMock.mockResolvedValue({ user: { id: 'user123' } });
    signInAccountMock.mockResolvedValue(null);

    render(<SignupForm onLoadingChange={mockOnLoadingChange} />);

    // Fill and submit form
    fillForm();
    fireEvent.click(screen.getByText('Sign up'));

    // Wait and verify
    await waitFor(() => {
      expect(toastMock).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Sign in failed',
          variant: 'destructive',
        })
      );
    });
  });
});
