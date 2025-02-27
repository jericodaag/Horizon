import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Toaster } from '@/components/ui/toaster';

// Mock the useToast hook
jest.mock('@/components/ui/use-toast', () => ({
    useToast: jest.fn(() => ({
        toasts: [
            {
                id: 'test-toast-1',
                title: 'Test Toast',
                description: 'This is a test toast notification',
            }
        ]
    })),
}));

// Mock the Toast components from @/components/ui/toast
jest.mock('@/components/ui/toast', () => ({
    Toast: ({ children, ...props }: { children: React.ReactNode, [key: string]: any }) => (
        <div data-testid="toast-root" {...props}>{children}</div>
    ),
    ToastTitle: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="toast-title">{children}</div>
    ),
    ToastDescription: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="toast-description">{children}</div>
    ),
    ToastClose: () => <button data-testid="toast-close">Close</button>,
    ToastProvider: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="toast-provider">{children}</div>
    ),
    ToastViewport: () => <div data-testid="toast-viewport" />,
}));

describe('Toaster Component', () => {
    test('renders toast from useToast hook', () => {
        render(<Toaster />);

        expect(screen.getByTestId('toast-root')).toBeInTheDocument();
        expect(screen.getByTestId('toast-title')).toBeInTheDocument();
        expect(screen.getByTestId('toast-description')).toBeInTheDocument();
        expect(screen.getByText('Test Toast')).toBeInTheDocument();
        expect(screen.getByText('This is a test toast notification')).toBeInTheDocument();
    });
});