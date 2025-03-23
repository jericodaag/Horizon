import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SignupForm from '@/_auth/forms/SignupForm';
import { BrowserRouter } from 'react-router-dom';
import { mockNavigate } from '@/__tests__/__mocks__/router';
import {
  mockCreateUserAccount,
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

describe('SignupForm', () => {
  const mockOnLoadingChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    setMockAuthContext('not-authenticated');

    // Set default mock behavior
    mockCreateUserAccount.mockResolvedValue({ user: { id: 'test-user' } });
    mockSignInAccount.mockResolvedValue({ user: { id: 'test-user' } });
    mockCheckAuthUser.mockResolvedValue(true);
  });

  it('renders the signup form with all required fields', () => {
    render(
      <BrowserRouter>
        <SignupForm onLoadingChange={mockOnLoadingChange} />
      </BrowserRouter>
    );

    // Verify all form elements are present
    expect(screen.getByText('Create Account 👋')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Password')).toBeInTheDocument();
    expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    expect(screen.getByText('Sign up')).toBeInTheDocument();
  });

  it('successfully creates account and navigates to home page', async () => {
    render(
      <BrowserRouter>
        <SignupForm onLoadingChange={mockOnLoadingChange} />
      </BrowserRouter>
    );

    // Click submit button to trigger sign up process
    fireEvent.click(screen.getByTestId('submit-button'));

    // Wait for navigation after successful signup
    await waitFor(() => {
      expect(mockCreateUserAccount).toHaveBeenCalled();
      expect(mockSignInAccount).toHaveBeenCalled();
      expect(mockCheckAuthUser).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });
  });

  it('handles account creation failure', async () => {
    // Mock account creation failure
    mockCreateUserAccount.mockResolvedValue(null);

    render(
      <BrowserRouter>
        <SignupForm onLoadingChange={mockOnLoadingChange} />
      </BrowserRouter>
    );

    // Click submit button
    fireEvent.click(screen.getByTestId('submit-button'));

    // Verify behavior on failure
    await waitFor(() => {
      expect(mockCreateUserAccount).toHaveBeenCalled();
      expect(mockSignInAccount).not.toHaveBeenCalled(); // Sign in shouldn't be called if account creation fails
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(mockOnLoadingChange).toHaveBeenCalledWith(false);
    });
  });

  it('notifies parent component of loading state changes', () => {
    render(
      <BrowserRouter>
        <SignupForm onLoadingChange={mockOnLoadingChange} />
      </BrowserRouter>
    );

    // Click submit button to start loading
    fireEvent.click(screen.getByTestId('submit-button'));

    // Check if onLoadingChange was called with true
    expect(mockOnLoadingChange).toHaveBeenCalledWith(true);
  });
});
