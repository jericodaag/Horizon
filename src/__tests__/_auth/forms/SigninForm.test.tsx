import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SigninForm from '@/_auth/forms/SigninForm';
import { BrowserRouter } from 'react-router-dom';
import { mockNavigate } from '@/__tests__/__mocks__/router';
import {
  mockSignInAccount,
  mockCheckAuthUser,
} from '@/__tests__/__mocks__/api';
import { setMockAuthContext } from '@/__tests__/__mocks__/contexts';

// Mock react-hook-form
jest.mock('@hookform/resolvers/zod', () => ({
  zodResolver: jest.fn(() => ({})),
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className }) => (
      <div className={className} data-testid='motion-div'>
        {children}
      </div>
    ),
  },
}));

// Mock UI components
jest.mock('@/components/ui/form', () => ({
  Form: ({ children }) => <div data-testid='form'>{children}</div>,
  FormControl: ({ children }) => (
    <div data-testid='form-control'>{children}</div>
  ),
  FormField: ({ render }) =>
    render({
      field: { value: '', onChange: jest.fn(), onBlur: jest.fn(), name: '' },
    }),
  FormItem: ({ children }) => <div data-testid='form-item'>{children}</div>,
  FormLabel: ({ children }) => <div data-testid='form-label'>{children}</div>,
  FormMessage: () => <div data-testid='form-message'></div>,
}));

jest.mock('@/components/ui/input', () => ({
  Input: (props) => <input data-testid='input' {...props} />,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, type }) => (
    <button
      data-testid='submit-button'
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      {children}
    </button>
  ),
}));

// Mock toast
jest.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('SigninForm', () => {
  const mockOnLoadingChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    setMockAuthContext('not-authenticated');

    // Set default mock behavior
    mockSignInAccount.mockResolvedValue({ user: { id: 'test-user' } });
    mockCheckAuthUser.mockResolvedValue(true);
  });

  it('renders the signin form with all required elements', () => {
    render(
      <BrowserRouter>
        <SigninForm onLoadingChange={mockOnLoadingChange} />
      </BrowserRouter>
    );

    expect(screen.getByText('Welcome Back 👋')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Password')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    expect(screen.getByText('Sign in')).toBeInTheDocument();
    expect(screen.getByText('Reset it here')).toBeInTheDocument();
  });

  it('successfully signs in and navigates to home page', async () => {
    render(
      <BrowserRouter>
        <SigninForm onLoadingChange={mockOnLoadingChange} />
      </BrowserRouter>
    );

    // Click submit button to trigger sign in
    fireEvent.click(screen.getByTestId('submit-button'));

    // Wait for navigation after successful login
    await waitFor(() => {
      expect(mockSignInAccount).toHaveBeenCalled();
      expect(mockCheckAuthUser).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });
  });

  it('handles sign in failure correctly', async () => {
    // Mock sign in failure
    mockSignInAccount.mockResolvedValue(null);

    render(
      <BrowserRouter>
        <SigninForm onLoadingChange={mockOnLoadingChange} />
      </BrowserRouter>
    );

    // Click submit button
    fireEvent.click(screen.getByTestId('submit-button'));

    // Verify behavior on failure
    await waitFor(() => {
      expect(mockSignInAccount).toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(mockOnLoadingChange).toHaveBeenCalledWith(false);
    });
  });

  it('navigates to password reset page when reset link is clicked', () => {
    render(
      <BrowserRouter>
        <SigninForm onLoadingChange={mockOnLoadingChange} />
      </BrowserRouter>
    );

    // Click the reset password link
    fireEvent.click(screen.getByText('Reset it here'));

    // Verify navigation
    expect(mockNavigate).toHaveBeenCalledWith('/reset-password');
  });
});
