import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignupForm from '@/_auth/forms/SignupForm';

// Mock necessary dependencies
const mockNavigate = jest.fn();
const mockCreateUserAccount = jest.fn();
const mockSignInAccount = jest.fn();
const mockCheckAuthUser = jest.fn();
const mockToast = jest.fn();

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}));

// Mock API queries
jest.mock('@/lib/react-query/queries', () => ({
  useCreateUserAccount: () => ({
    mutateAsync: mockCreateUserAccount,
    isPending: false
  }),
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
      value: name === 'email' ? 'test@example.com' :
        name === 'password' ? 'password123' :
          name === 'name' ? 'Test User' : 'testuser',
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
    <input type={type || 'text'} data-testid={`input-${type || 'text'}`} {...props} />
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
      return callback({
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
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

describe('SignupForm', () => {
  const mockOnLoadingChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the signup form with all fields', () => {
    render(<SignupForm onLoadingChange={mockOnLoadingChange} />);

    // Check if form header is rendered
    expect(screen.getByText('Create Account 👋')).toBeInTheDocument();

    // Check for form fields by looking for their labels
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Password')).toBeInTheDocument();

    // Check for form controls
    const formControls = screen.getAllByTestId('form-control');
    expect(formControls.length).toBe(4); // 4 form fields

    // Check for submit button
    const signUpButton = screen.getByRole('button', { name: /Sign up/i });
    expect(signUpButton).toBeInTheDocument();
    expect(signUpButton).not.toBeDisabled();
  });

  it('handles successful account creation and sign in', async () => {
    // Mock successful account creation and sign in
    mockCreateUserAccount.mockResolvedValueOnce({ user: { id: 'user123' } });
    mockSignInAccount.mockResolvedValueOnce({ user: { id: 'user123' } });
    mockCheckAuthUser.mockResolvedValueOnce(true);

    render(<SignupForm onLoadingChange={mockOnLoadingChange} />);

    const signUpButton = screen.getByRole('button', { name: /Sign up/i });
    fireEvent.click(signUpButton);

    await waitFor(() => {
      // Verify sign up flow
      expect(mockCreateUserAccount).toHaveBeenCalledWith({
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

      // Verify sign in after signup
      expect(mockSignInAccount).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });

      // Verify authentication check
      expect(mockCheckAuthUser).toHaveBeenCalled();

      // Verify navigation to home
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });
  });

  it('handles account creation failure', async () => {
    // Mock account creation failure
    mockCreateUserAccount.mockResolvedValueOnce(null);

    render(<SignupForm onLoadingChange={mockOnLoadingChange} />);

    const signUpButton = screen.getByRole('button', { name: /Sign up/i });
    fireEvent.click(signUpButton);

    await waitFor(() => {
      // Check if error toast was shown
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Sign up failed',
        variant: 'destructive'
      }));

      // Verify sign in wasn't attempted
      expect(mockSignInAccount).not.toHaveBeenCalled();

      // Verify no navigation occurred
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('handles sign in failure after successful account creation', async () => {
    // Mock successful account creation but failed sign in
    mockCreateUserAccount.mockResolvedValueOnce({ user: { id: 'user123' } });
    mockSignInAccount.mockResolvedValueOnce(null);

    render(<SignupForm onLoadingChange={mockOnLoadingChange} />);

    const signUpButton = screen.getByRole('button', { name: /Sign up/i });
    fireEvent.click(signUpButton);

    await waitFor(() => {
      // Check both functions were called
      expect(mockCreateUserAccount).toHaveBeenCalled();
      expect(mockSignInAccount).toHaveBeenCalled();

      // Check error toast was shown
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Sign in failed',
        variant: 'destructive'
      }));

      // Verify no navigation occurred
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('notifies parent component of loading state changes', async () => {
    // Mock successful flow with some delay
    mockCreateUserAccount.mockImplementation(() => new Promise(resolve => {
      setTimeout(() => resolve({ user: { id: 'user123' } }), 100);
    }));
    mockSignInAccount.mockResolvedValueOnce({ user: { id: 'user123' } });
    mockCheckAuthUser.mockResolvedValueOnce(true);

    render(<SignupForm onLoadingChange={mockOnLoadingChange} />);

    const signUpButton = screen.getByRole('button', { name: /Sign up/i });
    fireEvent.click(signUpButton);

    // Should call with loading=true when submission starts
    expect(mockOnLoadingChange).toHaveBeenCalledWith(true);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });
  });
});