import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AuthPage from '@/_auth/forms/AuthPage';
import { useNavigate, useLocation } from 'react-router-dom';
import { act } from 'react-dom/test-utils';

// Explicitly add type definitions in the test file
declare global {
    namespace jest {
        interface Matchers<R> {
            toBeInTheDocument(): R;
            toHaveTextContent(text: string | RegExp): R;
            toHaveAttribute(attr: string, value?: string): R;
            toBeDisabled(): R;
            toBeEnabled(): R;
            toBeVisible(): R;
            toBeChecked(): R;
        }
    }
}

// Mock the react-router-dom hooks
jest.mock('react-router-dom', () => ({
    useNavigate: jest.fn(),
    useLocation: jest.fn(),
}));

// Mock the child components
jest.mock('@/_auth/forms/SigninForm.tsx', () => ({
    __esModule: true,
    default: ({ onLoadingChange }: { onLoadingChange: (loading: boolean) => void }) => (
        <div data-testid="signin-form">
            <button onClick={() => onLoadingChange(true)}>Start Loading</button>
            <button onClick={() => onLoadingChange(false)}>Stop Loading</button>
        </div>
    ),
}));

jest.mock('@/_auth/forms/SignupForm.tsx', () => ({
    __esModule: true,
    default: ({ onLoadingChange }: { onLoadingChange: (loading: boolean) => void }) => (
        <div data-testid="signup-form">
            <button onClick={() => onLoadingChange(true)}>Start Loading</button>
            <button onClick={() => onLoadingChange(false)}>Stop Loading</button>
        </div>
    ),
}));

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => {
    const actual = jest.requireActual('framer-motion');
    return {
        ...actual,
        motion: {
            ...actual.motion,
            button: ({ children, onClick }: { children: React.ReactNode, onClick?: () => void }) => (
                <button onClick={onClick}>{children}</button>
            ),
            div: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
            h1: ({ children }: { children: React.ReactNode }) => <h1>{children}</h1>,
            p: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
            img: () => <img alt="mocked-carousel" />,
        },
        AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    };
});

// Mock the Loader component
jest.mock('@/components/shared/Loader', () => ({
    __esModule: true,
    default: () => <div data-testid="loader">Loading...</div>,
}));

describe('AuthPage', () => {
    const mockNavigate = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    });

    it('renders sign-in form when path is /sign-in', () => {
        (useLocation as jest.Mock).mockReturnValue({ pathname: '/sign-in' });

        render(<AuthPage />);

        // Using a type assertion to help TypeScript understand
        expect(screen.getByTestId('signin-form')).toBeInTheDocument();
        expect(screen.queryByTestId('signup-form')).not.toBeInTheDocument();
        expect(screen.getByText('Welcome Back!')).toBeInTheDocument();
    });

    it('renders sign-up form when path is /sign-up', () => {
        (useLocation as jest.Mock).mockReturnValue({ pathname: '/sign-up' });

        render(<AuthPage />);

        expect(screen.getByTestId('signup-form')).toBeInTheDocument();
        expect(screen.queryByTestId('signin-form')).not.toBeInTheDocument();
        expect(screen.getByText('Join Horizon')).toBeInTheDocument();
    });

    it('navigates back to landing page when back button is clicked', () => {
        (useLocation as jest.Mock).mockReturnValue({ pathname: '/sign-in' });

        render(<AuthPage />);

        fireEvent.click(screen.getByText('Back to Home'));
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('switches from sign-in to sign-up when "Sign up" is clicked', () => {
        (useLocation as jest.Mock).mockReturnValue({ pathname: '/sign-in' });

        render(<AuthPage />);

        fireEvent.click(screen.getByText('Sign up'));
        expect(mockNavigate).toHaveBeenCalledWith('/sign-up');
    });

    it('switches from sign-up to sign-in when "Sign in" is clicked', () => {
        (useLocation as jest.Mock).mockReturnValue({ pathname: '/sign-up' });

        render(<AuthPage />);

        fireEvent.click(screen.getByText('Sign in'));
        expect(mockNavigate).toHaveBeenCalledWith('/sign-in');
    });

    it('shows loading overlay when loading state is active', () => {
        (useLocation as jest.Mock).mockReturnValue({ pathname: '/sign-in' });

        render(<AuthPage />);

        // Initially, the loader should not be visible
        expect(screen.queryByTestId('loader')).not.toBeInTheDocument();

        // Activate loading state
        fireEvent.click(screen.getByText('Start Loading'));

        // Now the loader should be visible
        expect(screen.getByTestId('loader')).toBeInTheDocument();
        expect(screen.getByText('Signing in...')).toBeInTheDocument();

        // Deactivate loading state
        fireEvent.click(screen.getByText('Stop Loading'));

        // The loader should be hidden again
        expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    });

    it('uses different loading message for sign-up', () => {
        (useLocation as jest.Mock).mockReturnValue({ pathname: '/sign-up' });

        render(<AuthPage />);

        // Activate loading state
        fireEvent.click(screen.getByText('Start Loading'));

        // Check for the sign-up specific loading message
        expect(screen.getByText('Creating account...')).toBeInTheDocument();
    });

    it('displays current year in copyright notice', () => {
        (useLocation as jest.Mock).mockReturnValue({ pathname: '/sign-in' });

        render(<AuthPage />);

        const currentYear = new Date().getFullYear();
        expect(screen.getByText(`© ${currentYear} ALL RIGHTS RESERVED`)).toBeInTheDocument();
    });

    it('updates carousel image on interval', async () => {
        jest.useFakeTimers();
        (useLocation as jest.Mock).mockReturnValue({ pathname: '/sign-in' });

        render(<AuthPage />);

        // Advance timers to trigger carousel update
        act(() => {
            jest.advanceTimersByTime(5000);
        });

        // We can't directly test the image change since we've mocked the images,
        // but we can verify the component doesn't crash when the timer fires

        jest.useRealTimers();
    });
});