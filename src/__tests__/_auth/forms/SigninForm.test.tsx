import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SigninForm from '@/_auth/forms/SigninForm';
import '@testing-library/jest-dom';

// These should be imported from your setupMocks.tsx
import { mockNavigate, mockSignInAccount, mockCheckAuthUser, mockToast } from '@/__tests__/__mocks__/setupMocks';

describe('SigninForm', () => {
  const mockOnLoadingChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the signin form with all fields', () => {
    render(<SigninForm onLoadingChange={mockOnLoadingChange} />);

    expect(screen.getByText('Welcome Back 👋')).toBeInTheDocument();
    expect(screen.getByTestId('input-email')).toBeInTheDocument();
    expect(screen.getByTestId('input-password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign in/i })).toBeInTheDocument();
    expect(screen.getByText(/Reset it here/i)).toBeInTheDocument();
  });

  it('navigates to reset password page when reset link is clicked', () => {
    render(<SigninForm onLoadingChange={mockOnLoadingChange} />);

    fireEvent.click(screen.getByText('Reset it here'));

    expect(mockNavigate).toHaveBeenCalledWith('/reset-password');
  });

  it('handles successful sign in', async () => {
    mockSignInAccount.mockResolvedValueOnce({ user: { id: 'user123' } });
    mockCheckAuthUser.mockResolvedValueOnce(true);

    render(<SigninForm onLoadingChange={mockOnLoadingChange} />);
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/home');
      expect(mockSignInAccount).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
      expect(mockCheckAuthUser).toHaveBeenCalled();
    });
  });

  it('handles sign in failure', async () => {
    mockSignInAccount.mockResolvedValueOnce(null);

    render(<SigninForm onLoadingChange={mockOnLoadingChange} />);
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }));

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Sign in failed',
        variant: 'destructive'
      }));
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  it('notifies parent component of loading state changes', async () => {
    mockSignInAccount.mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({ user: { id: 'user123' } }), 100))
    );
    mockCheckAuthUser.mockResolvedValueOnce(true);

    render(<SigninForm onLoadingChange={mockOnLoadingChange} />);
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }));

    expect(mockOnLoadingChange).toHaveBeenCalledWith(true);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });
  });
});