import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Input } from '@/components/ui/input';

// Mock the cn utility function
jest.mock('@/lib/utils', () => ({
    cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

describe('Input Component', () => {
    test('renders input element with default attributes', () => {
        render(<Input placeholder="Enter text" />);

        const input = screen.getByPlaceholderText('Enter text');
        expect(input).toBeInTheDocument();
        expect(input.tagName).toBe('INPUT');
        expect(input).toHaveClass('flex h-10 w-full rounded-md border');
    });

    test('handles text input correctly', () => {
        render(<Input placeholder="Enter text" />);

        const input = screen.getByPlaceholderText('Enter text');
        fireEvent.change(input, { target: { value: 'Test Value' } });

        expect(input).toHaveValue('Test Value');
    });

    test('passes the type attribute correctly', () => {
        render(<Input type="password" placeholder="Password" />);

        const input = screen.getByPlaceholderText('Password');
        expect(input).toHaveAttribute('type', 'password');
    });

    test('applies disabled styles correctly', () => {
        render(<Input disabled placeholder="Disabled input" />);

        const input = screen.getByPlaceholderText('Disabled input');
        expect(input).toBeDisabled();
        expect(input).toHaveClass('disabled:opacity-50');
    });

    test('combines custom className with default classes', () => {
        render(<Input className="custom-input-class" placeholder="Custom class" />);

        const input = screen.getByPlaceholderText('Custom class');
        expect(input).toHaveClass('custom-input-class');
        expect(input).toHaveClass('flex h-10 w-full rounded-md border');
    });

    test('forwards ref to the input element', () => {
        const ref = React.createRef<HTMLInputElement>();
        render(<Input ref={ref} placeholder="Ref test" />);

        expect(ref.current).not.toBeNull();
        expect(ref.current?.tagName).toBe('INPUT');
    });

    test('handles onChange events correctly', () => {
        const handleChange = jest.fn();
        render(<Input onChange={handleChange} placeholder="Event test" />);

        const input = screen.getByPlaceholderText('Event test');
        fireEvent.change(input, { target: { value: 'Changed value' } });

        expect(handleChange).toHaveBeenCalledTimes(1);
    });
});