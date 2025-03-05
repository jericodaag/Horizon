import '@testing-library/jest-dom'; // Import jest-dom for the matchers
import { render, screen, fireEvent } from '@testing-library/react';
import AuthPage from '@/_auth/forms/AuthPage';

// Get the mockNavigate from react-router-dom mock
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/sign-in' })
}));

// Mock the form components with correct paths
jest.mock('@/_auth/forms/SigninForm', () => ({
  __esModule: true,
  default: ({ onLoadingChange }: { onLoadingChange: (loading: boolean) => void }) => (
    <div data-testid="mock-signin-form">
      <button
        data-testid="toggle-loading-button"
        onClick={() => onLoadingChange(true)}
      >
        Toggle Loading
      </button>
    </div>
  ),
}));

jest.mock('@/_auth/forms/SignupForm', () => ({
  __esModule: true,
  default: ({ onLoadingChange }: { onLoadingChange: (loading: boolean) => void }) => (
    <div data-testid="mock-signup-form">
      <button
        data-testid="toggle-loading-button"
        onClick={() => onLoadingChange(true)}
      >
        Toggle Loading
      </button>
    </div>
  ),
}));

// Mock the Loader component
jest.mock('@/components/shared/Loader', () => ({
  __esModule: true,
  default: () => <div data-testid="loader">Loading...</div>
}));

// Fix the Image mock to use proper types
const originalImage = global.Image;
beforeAll(() => {
  // @ts-ignore - we're intentionally creating a mock implementation
  global.Image = class {
    onload: () => void = () => { };
    constructor() {
      setTimeout(() => {
        this.onload();
      }, 100);
    }
  };
});

afterAll(() => {
  global.Image = originalImage;
});

// Add TypeScript type declaration for the jest-dom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveTextContent(text: string | RegExp): R;
      toHaveClass(...classNames: string[]): R;
    }
  }
}

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
    // Set location pathname to /sign-in
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue({
      pathname: '/sign-in'
    });

    render(<AuthPage />);

    // Check if signin form is rendered
    expect(screen.getByTestId('mock-signin-form')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-signup-form')).not.toBeInTheDocument();

    // Check if welcome text is for signin
    expect(screen.getByText('Welcome Back!')).toBeInTheDocument();
  });

  it('renders signup form when path is /sign-up', () => {
    // Set location pathname to /sign-up
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue({
      pathname: '/sign-up'
    });

    render(<AuthPage />);

    // Check if signup form is rendered
    expect(screen.getByTestId('mock-signup-form')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-signin-form')).not.toBeInTheDocument();

    // Check if welcome text is for signup
    expect(screen.getByText('Join Horizon')).toBeInTheDocument();
  });

  it('navigates back to landing page when back button is clicked', () => {
    render(<AuthPage />);

    // Find and click the back button
    const backButton = screen.getByText('Back to Home');
    fireEvent.click(backButton);

    // Check if navigation was called with correct path
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('switches between signin and signup forms', () => {
    // Start with signin form
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue({
      pathname: '/sign-in'
    });

    render(<AuthPage />);

    // Initially should show signin form
    expect(screen.getByTestId('mock-signin-form')).toBeInTheDocument();

    // Click sign up button to switch
    const signupButton = screen.getByText('Sign up');
    fireEvent.click(signupButton);

    // Should navigate to signup page
    expect(mockNavigate).toHaveBeenCalledWith('/sign-up');
  });

  it('shows loading overlay when child form triggers loading state', () => {
    render(<AuthPage />);

    // Loading overlay should not be visible initially
    expect(screen.queryByText('Signing in...')).not.toBeInTheDocument();

    // Trigger loading state from the child form
    const toggleLoadingButton = screen.getByTestId('toggle-loading-button');
    fireEvent.click(toggleLoadingButton);

    // Loading overlay should now be visible
    expect(screen.getByText('Signing in...')).toBeInTheDocument();
  });

  it('displays current year in copyright footer', () => {
    render(<AuthPage />);

    const currentYear = new Date().getFullYear();
    expect(screen.getByText(`© ${currentYear} ALL RIGHTS RESERVED`)).toBeInTheDocument();
  });
});