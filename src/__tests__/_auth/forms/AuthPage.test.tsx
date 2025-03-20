import { render, screen, fireEvent } from '@testing-library/react';
import AuthPage from '@/_auth/forms/AuthPage';
import '@testing-library/jest-dom';
import { mockNavigate } from '@/__tests__/__mocks__/router';

// These mocks are specific to this test and not covered by global mocks
jest.mock('@/_auth/forms/SigninForm', () => ({
  __esModule: true,
  default: ({ onLoadingChange }) => (
    <div data-testid="mock-signin-form">
      <button data-testid="toggle-loading-button" onClick={() => onLoadingChange(true)}>
        Toggle Loading
      </button>
    </div>
  ),
}));

jest.mock('@/_auth/forms/SignupForm', () => ({
  __esModule: true,
  default: ({ onLoadingChange }) => (
    <div data-testid="mock-signup-form">
      <button data-testid="toggle-loading-button" onClick={() => onLoadingChange(true)}>
        Toggle Loading
      </button>
    </div>
  ),
}));

// Mock for Image constructor can remain at the test level
const originalImage = global.Image;
beforeAll(() => {
  // @ts-ignore - we need to use this approach for mocking the Image constructor
  global.Image = class {
    onload: (() => void) = () => { };
    width: number = 0;
    height: number = 0;
    src: string = '';

    constructor() {
      setTimeout(() => this.onload(), 100);
    }
  } as unknown as typeof global.Image;
});

afterAll(() => {
  global.Image = originalImage;
});

describe('AuthPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders signin form when path is /sign-in', () => {
    // Reset the mock to return sign-in path
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue({
      pathname: '/sign-in'
    });

    render(<AuthPage />);

    expect(screen.getByTestId('mock-signin-form')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-signup-form')).not.toBeInTheDocument();
    expect(screen.getByText('Welcome Back!')).toBeInTheDocument();
  });

  it('renders signup form when path is /sign-up', () => {
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue({
      pathname: '/sign-up'
    });

    render(<AuthPage />);

    expect(screen.getByTestId('mock-signup-form')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-signin-form')).not.toBeInTheDocument();
    expect(screen.getByText('Join Horizon')).toBeInTheDocument();
  });

  it('navigates back to landing page when back button is clicked', () => {
    mockNavigate.mockClear();
    render(<AuthPage />);
    fireEvent.click(screen.getByText('Back to Home'));

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('navigates to signup page when Sign up button is clicked', () => {
    mockNavigate.mockClear();
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue({
      pathname: '/sign-in'
    });

    render(<AuthPage />);
    fireEvent.click(screen.getByText('Sign up'));

    expect(mockNavigate).toHaveBeenCalledWith('/sign-up');
  });

  it('shows loading overlay when child form triggers loading state', () => {
    render(<AuthPage />);

    expect(screen.queryByText('Signing in...')).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId('toggle-loading-button'));

    expect(screen.getByText('Signing in...')).toBeInTheDocument();
  });

  it('displays current year in copyright footer', () => {
    render(<AuthPage />);

    const currentYear = new Date().getFullYear();
    expect(screen.getByText(`© ${currentYear} ALL RIGHTS RESERVED`)).toBeInTheDocument();
  });
});