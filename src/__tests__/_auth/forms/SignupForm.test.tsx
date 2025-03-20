import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SignupForm from '@/_auth/forms/SignupForm';
import '@testing-library/jest-dom';

// Import mock functions from organized mock files
import { mockNavigate } from '@/__tests__/__mocks__/router';
import { mockCreateUserAccount, mockSignInAccount, mockCheckAuthUser } from '@/__tests__/__mocks__/api';
import { mockToast } from '@/__tests__/__mocks__/ui';

describe('SignupForm', () => {
  const mockOnLoadingChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the signup form with all fields', () => {
    render(<SignupForm onLoadingChange={mockOnLoadingChange} />);

    expect(screen.getByText('Create Account 👋')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Password')).toBeInTheDocument();

    const formControls = screen.getAllByTestId('form-control');
    expect(formControls.length).toBe(4);

    const signUpButton = screen.getByRole('button', { name: /Sign up/i });
    expect(signUpButton).toBeInTheDocument();
  });

  it('handles successful account creation and sign in', async () => {
    mockCreateUserAccount.mockResolvedValueOnce({ user: { id: 'user123' } });
    mockSignInAccount.mockResolvedValueOnce({ user: { id: 'user123' } });
    mockCheckAuthUser.mockResolvedValueOnce(true);

    render(<SignupForm onLoadingChange={mockOnLoadingChange} />);
    fireEvent.click(screen.getByRole('button', { name: /Sign up/i }));

    await waitFor(() => {
      expect(mockCreateUserAccount).toHaveBeenCalledWith({
        name: 'Test User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
      expect(mockSignInAccount).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
      expect(mockCheckAuthUser).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });
  });

  it('handles account creation failure', async () => {
    mockCreateUserAccount.mockResolvedValueOnce(null);

    render(<SignupForm onLoadingChange={mockOnLoadingChange} />);
    fireEvent.click(screen.getByRole('button', { name: /Sign up/i }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Sign up failed',
        variant: 'destructive'
      }));
      expect(mockSignInAccount).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('handles sign in failure after successful account creation', async () => {
    mockCreateUserAccount.mockResolvedValueOnce({ user: { id: 'user123' } });
    mockSignInAccount.mockResolvedValueOnce(null);

    render(<SignupForm onLoadingChange={mockOnLoadingChange} />);
    fireEvent.click(screen.getByRole('button', { name: /Sign up/i }));

    await waitFor(() => {
      expect(mockCreateUserAccount).toHaveBeenCalled();
      expect(mockSignInAccount).toHaveBeenCalled();
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Sign in failed',
        variant: 'destructive'
      }));
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('notifies parent component of loading state changes', async () => {
    mockCreateUserAccount.mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({ user: { id: 'user123' } }), 100))
    );
    mockSignInAccount.mockResolvedValueOnce({ user: { id: 'user123' } });
    mockCheckAuthUser.mockResolvedValueOnce(true);

    render(<SignupForm onLoadingChange={mockOnLoadingChange} />);
    fireEvent.click(screen.getByRole('button', { name: /Sign up/i }));

    expect(mockOnLoadingChange).toHaveBeenCalledWith(true);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });
  });
});