import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Label } from '@/components/ui/label';

// Mock the cn utility function
jest.mock('@/lib/utils', () => ({
    cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

describe('Label Component', () => {
    test('renders label with text content', () => {
        render(<Label>Test Label</Label>);

        expect(screen.getByText('Test Label')).toBeInTheDocument();
        expect(screen.getByText('Test Label').tagName).toBe('LABEL');
    });

    test('applies default classes', () => {
        render(<Label>Test Label</Label>);

        const label = screen.getByText('Test Label');
        expect(label).toHaveClass('text-sm');
        expect(label).toHaveClass('font-medium');
        expect(label).toHaveClass('leading-none');
    });

    test('combines custom className with default classes', () => {
        render(<Label className="custom-label">Custom Label</Label>);

        const label = screen.getByText('Custom Label');
        expect(label).toHaveClass('custom-label');
        expect(label).toHaveClass('text-sm');
        expect(label).toHaveClass('font-medium');
    });

    test('forwards htmlFor attribute correctly', () => {
        render(<Label htmlFor="test-input">Input Label</Label>);

        expect(screen.getByText('Input Label')).toHaveAttribute('for', 'test-input');
    });

    test('renders with provided ref', () => {
        const ref = React.createRef<HTMLLabelElement>();
        render(<Label ref={ref}>Ref Label</Label>);

        expect(ref.current).not.toBeNull();
        expect(ref.current?.textContent).toBe('Ref Label');
    });
});