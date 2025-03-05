import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SigninForm from '@/_auth/forms/SigninForm';

// Mock necessary dependencies
const mockNavigate = jest.fn();
const mockSignInAccount = jest.fn();
const mockCheckAuthUser = jest.fn();
const mockToast = jest.fn();

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}));

// Mock API queries
jest.mock('@/lib/react-query/queries', () => ({
  useSignInAccount: () => ({
    mutateAsync: mockSignInAccount,
    isPending: false
  })
}));

// Mock auth context
jest.mock('@/context/AuthContext', () => ({
  useUserContext: () => ({
    checkAuthUser: mockCheckAuthUser,
    isLoading: false
  })
}));

// Mock toast
jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({ toast: mockToast })
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  }
}));

// Mock UI components
jest.mock('@/components/ui/form', () => ({
  Form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
  FormControl: ({ children }: any) => <div data-testid="form-control">{children}</div>,
  FormField: ({ name, render }: any) => {
    const field = {
      name,
      value: name === 'email' ? 'test@example.com' : 'password123',
      onChange: jest.fn(),
      onBlur: jest.fn(),
      ref: jest.fn()
    };
    return render({ field });
  },
  FormItem: ({ children }: any) => <div data-testid="form-item">{children}</div>,
  FormLabel: ({ children }: any) => <label>{children}</label>,
  FormMessage: () => <div data-testid="form-message"></div>
}));

// Mock Input component
jest.mock('@/components/ui/input', () => ({
  Input: ({ type, ...props }: any) => (
    <input type={type} data-testid={`input-${type}`} {...props} />
  )
}));

// Mock Button component
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, type, disabled, ...props }: any) => (
    <button type={type} disabled={disabled} {...props}>{children}</button>
  )
}));

// Mock the form hook
jest.mock('react-hook-form', () => ({
  useForm: () => ({
    handleSubmit: (callback: any) => (e: any) => {
      e?.preventDefault?.();
      return callback({ email: 'test@example.com', password: 'password123' });
    },
    register: jest.fn(),
    control: {},
    formState: { errors: {} },
    reset: jest.fn()
  })
}));

// Mock the zod resolver
jest.mock('@hookform/resolvers/zod', () => ({
  zodResolver: jest.fn()
}));

describe('SigninForm', () => {
  const mockOnLoadingChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the signin form with all fields', () => {
    render(<SigninForm onLoadingChange={mockOnLoadingChange} />);

    // Check if form header is rendered
    expect(screen.getByText('Welcome Back 👋')).toBeInTheDocument();

    // Check for form fields
    expect(screen.getByTestId('input-email')).toBeInTheDocument();
    expect(screen.getByTestId('input-password')).toBeInTheDocument();

    // Check for submit button
    const signInButton = screen.getByRole('button', { name: /Sign in/i });
    expect(signInButton).toBeInTheDocument();
    expect(signInButton).not.toBeDisabled();

    // Check for forgot password link
    expect(screen.getByText(/Forgot your password/i)).toBeInTheDocument();
    expect(screen.getByText(/Reset it here/i)).toBeInTheDocument();
  });

  it('navigates to reset password page when reset link is clicked', () => {
    render(<SigninForm onLoadingChange={mockOnLoadingChange} />);

    const resetLink = screen.getByText('Reset it here');
    fireEvent.click(resetLink);

    expect(mockNavigate).toHaveBeenCalledWith('/reset-password');
  });

  it('handles successful sign in', async () => {
    // Mock successful sign in
    mockSignInAccount.mockResolvedValueOnce({ user: { id: 'user123' } });
    mockCheckAuthUser.mockResolvedValueOnce(true);

    render(<SigninForm onLoadingChange={mockOnLoadingChange} />);

    const signInButton = screen.getByRole('button', { name: /Sign in/i });
    fireEvent.click(signInButton);

    await waitFor(() => {
      // Check if mockNavigate was called with the correct route
      expect(mockNavigate).toHaveBeenCalledWith('/home');

      // Check if the API was called with correct credentials
      expect(mockSignInAccount).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });

      // Check if authentication was verified
      expect(mockCheckAuthUser).toHaveBeenCalled();
    });
  });

  it('handles sign in failure', async () => {
    // Mock sign in failure
    mockSignInAccount.mockResolvedValueOnce(null);

    render(<SigninForm onLoadingChange={mockOnLoadingChange} />);

    const signInButton = screen.getByRole('button', { name: /Sign in/i });
    fireEvent.click(signInButton);

    await waitFor(() => {
      // Check if error toast was shown
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Sign in failed',
        variant: 'destructive'
      }));

      // Check that navigation didn't happen
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('notifies parent component of loading state changes', async () => {
    mockSignInAccount.mockImplementation(() => new Promise(resolve => {
      setTimeout(() => resolve({ user: { id: 'user123' } }), 100);
    }));
    mockCheckAuthUser.mockResolvedValueOnce(true);

    render(<SigninForm onLoadingChange={mockOnLoadingChange} />);

    const signInButton = screen.getByRole('button', { name: /Sign in/i });
    fireEvent.click(signInButton);

    // Should call with loading=true when submission starts
    expect(mockOnLoadingChange).toHaveBeenCalledWith(true);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });
  });
});