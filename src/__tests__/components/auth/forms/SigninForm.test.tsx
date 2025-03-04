import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@/__tests__/test-utils';
import SigninForm from '@/_auth/forms/SigninForm';
import { mockNavigate } from '@/__tests__/test-utils';
import { useSignInAccount } from '@/lib/react-query/queries';
import { useUserContext } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';

// Mock the modules to control their behavior in tests
jest.mock('@/lib/react-query/queries', () => ({
  useSignInAccount: jest.fn(),
}));

jest.mock('@/context/AuthContext', () => ({
  useUserContext: jest.fn(),
}));

jest.mock('@/components/ui/use-toast', () => ({
  useToast: jest.fn(),
}));

describe('SigninForm', () => {
  const mockToast = jest.fn();
  const mockCheckAuthUser = jest.fn();
  const mockSignInAccount = jest.fn();
  const mockOnLoadingChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mocks with more explicit typing
    (useUserContext as jest.Mock).mockReturnValue({
      checkAuthUser: mockCheckAuthUser,
      isLoading: false,
    });
    (useSignInAccount as jest.Mock).mockReturnValue({
      mutateAsync: mockSignInAccount,
      isPending: false,
    });
    (useToast as jest.Mock).mockReturnValue({
      toast: mockToast,
    });
    mockNavigate.mockClear();
  });

  it('renders the signin form with all required elements', () => {
    render(<SigninForm onLoadingChange={mockOnLoadingChange} />);

    // Check for essential elements
    expect(screen.getByText('Welcome Back 👋')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Password')).toBeInTheDocument();
    expect(screen.getByText('Sign in')).toBeInTheDocument();
    expect(screen.getByText(/Forgot your password\?/)).toBeInTheDocument();
  });

  it('handles form submission', async () => {
    // Setup successful responses
    mockSignInAccount.mockResolvedValue({ success: true });
    mockCheckAuthUser.mockResolvedValue(true);

    render(<SigninForm onLoadingChange={mockOnLoadingChange} />);

    // Fill in form inputs
    const emailInput = screen.getByPlaceholderText('example@email.com');
    const passwordInput = screen.getByPlaceholderText('At least 8 characters');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Submit the form
    const submitButton = screen.getByText('Sign in');
    fireEvent.click(submitButton);

    // Check that loading state is communicated to parent
    expect(mockOnLoadingChange).toHaveBeenCalledWith(true);

    // Wait for the async operations to complete
    await waitFor(() => {
      // Check that the right functions were called
      expect(mockSignInAccount).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(mockCheckAuthUser).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });
  });

  it('shows reset password functionality', () => {
    render(<SigninForm onLoadingChange={mockOnLoadingChange} />);

    // Click the reset password link
    const resetPasswordButton = screen.getByText('Reset it here');
    fireEvent.click(resetPasswordButton);

    // Should call navigate with the reset password route
    expect(mockNavigate).toHaveBeenCalledWith('/reset-password');
  });
});
