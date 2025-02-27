import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Textarea } from '@/components/ui/textarea';

// Mock the cn utility function
jest.mock('@/lib/utils', () => ({
    cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

describe('Textarea Component', () => {
    test('renders textarea element with default attributes', () => {
        render(<Textarea placeholder="Enter text" />);

        const textarea = screen.getByPlaceholderText('Enter text');
        expect(textarea).toBeInTheDocument();
        expect(textarea.tagName).toBe('TEXTAREA');
        expect(textarea).toHaveClass('flex min-h-[80px] w-full rounded-md border');
    });

    test('handles text input correctly', () => {
        render(<Textarea placeholder="Enter text" />);

        const textarea = screen.getByPlaceholderText('Enter text');
        fireEvent.change(textarea, { target: { value: 'Test Content\nMultiple lines' } });

        expect(textarea).toHaveValue('Test Content\nMultiple lines');
    });

    test('applies disabled styles correctly', () => {
        render(<Textarea disabled placeholder="Disabled textarea" />);

        const textarea = screen.getByPlaceholderText('Disabled textarea');
        expect(textarea).toBeDisabled();
        expect(textarea).toHaveClass('disabled:opacity-50');
    });

    test('combines custom className with default classes', () => {
        render(<Textarea className="custom-textarea-class" placeholder="Custom class" />);

        const textarea = screen.getByPlaceholderText('Custom class');
        expect(textarea).toHaveClass('custom-textarea-class');
        expect(textarea).toHaveClass('flex min-h-[80px] w-full rounded-md border');
    });

    test('forwards ref to the textarea element', () => {
        const ref = React.createRef<HTMLTextAreaElement>();
        render(<Textarea ref={ref} placeholder="Ref test" />);

        expect(ref.current).not.toBeNull();
        expect(ref.current?.tagName).toBe('TEXTAREA');
    });

    test('handles onChange events correctly', () => {
        const handleChange = jest.fn();
        render(<Textarea onChange={handleChange} placeholder="Event test" />);

        const textarea = screen.getByPlaceholderText('Event test');
        fireEvent.change(textarea, { target: { value: 'Changed content' } });

        expect(handleChange).toHaveBeenCalledTimes(1);
    });

    test('applies rows attribute correctly', () => {
        render(<Textarea rows={5} placeholder="Row test" />);

        const textarea = screen.getByPlaceholderText('Row test');
        expect(textarea).toHaveAttribute('rows', '5');
    });
});