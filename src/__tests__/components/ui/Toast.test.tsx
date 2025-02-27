import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
    Toast,
    ToastProvider,
    ToastTitle,
    ToastDescription
} from '@/components/ui/toast';

// Mock Radix UI Toast primitives without TypeScript in the mock
jest.mock('@radix-ui/react-toast', () => {
    // Create a helper function to create components with displayName
    const createComponent = (name) => {
        const Component = (props) => (
            <div data-testid={`toast-${name.toLowerCase()}`} className={props.className}>
                {props.children}
            </div>
        );
        Component.displayName = name;
        return Component;
    };

    return {
        Provider: createComponent('Provider'),
        Viewport: createComponent('Viewport'),
        Root: createComponent('Root'),
        Title: createComponent('Title'),
        Description: createComponent('Description'),
        Close: createComponent('Close'),
        Action: createComponent('Action')
    };
});

// Mock the cn utility
jest.mock('@/lib/utils', () => ({
    cn: (...args) => args.filter(Boolean).join(' '),
}));

// Simple mock for class-variance-authority
jest.mock('class-variance-authority', () => ({
    cva: () => () => 'mocked-class',
}));

// Mock lucide-react
jest.mock('lucide-react', () => ({
    X: () => <span data-testid="x-icon">×</span>,
}));

describe('Toast Component', () => {
    test('applies custom className to toast components', () => {
        render(
            <ToastProvider>
                <Toast className="custom-toast">
                    <ToastTitle className="custom-title">Title</ToastTitle>
                    <ToastDescription className="custom-description">Description</ToastDescription>
                </Toast>
            </ToastProvider>
        );

        expect(screen.getByTestId('toast-root')).toHaveClass('custom-toast');
        expect(screen.getByTestId('toast-title')).toHaveClass('custom-title');
        expect(screen.getByTestId('toast-description')).toHaveClass('custom-description');
    });

    test('renders toast content correctly', () => {
        render(
            <ToastProvider>
                <Toast>
                    <ToastTitle>Test Title</ToastTitle>
                    <ToastDescription>Test Description</ToastDescription>
                </Toast>
            </ToastProvider>
        );

        expect(screen.getByText('Test Title')).toBeInTheDocument();
        expect(screen.getByText('Test Description')).toBeInTheDocument();
    });
});