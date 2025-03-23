import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AuthPage from '@/_auth/forms/AuthPage';
import { MemoryRouter } from 'react-router-dom';
import { mockNavigate } from '@/__tests__/__mocks__/router';
import { setMockAuthContext } from '@/__tests__/__mocks__/contexts';

// Only keep component-specific mocks that aren't in global mocks
jest.mock('@/_auth/forms/SigninForm', () => ({
  __esModule: true,
  default: ({ onLoadingChange }) => (
    <div data-testid='mock-signin-form'>
      <button
        data-testid='loading-button'
        onClick={() => onLoadingChange(true)}
      >
        Toggle Loading
      </button>
    </div>
  ),
}));

jest.mock('@/_auth/forms/SignupForm', () => ({
  __esModule: true,
  default: ({ onLoadingChange }) => (
    <div data-testid='mock-signup-form'>
      <button
        data-testid='loading-button'
        onClick={() => onLoadingChange(true)}
      >
        Toggle Loading
      </button>
    </div>
  ),
}));

// Mock Loader if it's not already in global mocks
jest.mock('@/components/shared/Loader', () => ({
  __esModule: true,
  default: () => <div data-testid='loader'>Loading...</div>,
}));

describe('AuthPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set authentication state to not authenticated
    setMockAuthContext('not-authenticated');
  });

  it('renders signin form when path is /sign-in', () => {
    // Mock location to return sign-in path
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue({
      pathname: '/sign-in',
    });

    render(
      <MemoryRouter initialEntries={['/sign-in']}>
        <AuthPage />
      </MemoryRouter>
    );

    // Check if signin form is rendered
    expect(screen.getByTestId('mock-signin-form')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-signup-form')).not.toBeInTheDocument();
    expect(screen.getByText('Welcome Back!')).toBeInTheDocument();
  });

  it('renders signup form when path is /sign-up', () => {
    // Mock location to return sign-up path
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue({
      pathname: '/sign-up',
    });

    render(
      <MemoryRouter initialEntries={['/sign-up']}>
        <AuthPage />
      </MemoryRouter>
    );

    // Check if signup form is rendered
    expect(screen.getByTestId('mock-signup-form')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-signin-form')).not.toBeInTheDocument();
    expect(screen.getByText('Join Horizon')).toBeInTheDocument();
  });

  it('navigates back to landing page when back button is clicked', () => {
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue({
      pathname: '/sign-in',
    });

    render(
      <MemoryRouter initialEntries={['/sign-in']}>
        <AuthPage />
      </MemoryRouter>
    );

    // Click back button
    mockNavigate.mockClear();
    fireEvent.click(screen.getByText('Back to Home'));

    // Verify navigation
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('shows loading overlay when form triggers loading state', () => {
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue({
      pathname: '/sign-in',
    });

    render(
      <MemoryRouter initialEntries={['/sign-in']}>
        <AuthPage />
      </MemoryRouter>
    );

    // Trigger loading state
    fireEvent.click(screen.getByTestId('loading-button'));

    // Check if loader is displayed
    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });
});
