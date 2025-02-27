import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';

// Mock Radix UI Dialog primitives
jest.mock('@radix-ui/react-dialog', () => ({
    Root: ({ children, open }: { children: React.ReactNode, open?: boolean }) => (
        <div data-testid="dialog-root" data-state={open ? 'open' : 'closed'}>{children}</div>
    ),
    Trigger: ({ className, children, ...props }: { className?: string, children: React.ReactNode, [key: string]: any }) => (
        <button data-testid="dialog-trigger" className={className} {...props}>{children}</button>
    ),
    Portal: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-portal">{children}</div>,
    Overlay: ({ className }: { className?: string }) => <div data-testid="dialog-overlay" className={className} />,
    Content: ({ className, children, ...props }: { className?: string, children: React.ReactNode, [key: string]: any }) => (
        <div data-testid="dialog-content" className={className} {...props}>{children}</div>
    ),
    Title: ({ className, children, ...props }: { className?: string, children: React.ReactNode, [key: string]: any }) => (
        <h2 data-testid="dialog-title" className={className} {...props}>{children}</h2>
    ),
    Description: ({ className, children, ...props }: { className?: string, children: React.ReactNode, [key: string]: any }) => (
        <p data-testid="dialog-description" className={className} {...props}>{children}</p>
    ),
    Close: ({ children }: { children?: React.ReactNode }) => <button data-testid="dialog-close">{children}</button>
}));

// Mock the cn utility
jest.mock('@/lib/utils', () => ({
    cn: (...args: (string | undefined | boolean)[]) => args.filter(Boolean).join(' '),
}));

// Mock lucide-react
jest.mock('lucide-react', () => ({
    X: () => <span data-testid="x-icon">×</span>,
}));

describe('Dialog Component', () => {
    test('applies custom className to dialog components', () => {
        render(
            <Dialog open={true}>
                <DialogContent className="custom-content">
                    <DialogHeader className="custom-header">
                        <DialogTitle className="custom-title">Dialog Title</DialogTitle>
                        <DialogDescription className="custom-description">Description</DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="custom-footer">
                        <button>Close</button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );

        expect(screen.getByTestId('dialog-content')).toHaveClass('custom-content');
        expect(screen.getByTestId('dialog-title')).toHaveClass('custom-title');
        expect(screen.getByTestId('dialog-description')).toHaveClass('custom-description');

        // Get the footer element directly and check its class
        const footerElements = document.querySelectorAll('.custom-footer');
        expect(footerElements.length).toBeGreaterThan(0);
        expect(footerElements[0]).toHaveClass('custom-footer');
    });
});