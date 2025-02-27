import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Checkbox } from '@/components/ui/checkbox';

describe('Checkbox Component', () => {
    test('renders checkbox input with correct attributes', () => {
        render(
            <Checkbox
                id="test-checkbox"
                checked={false}
                onCheckedChange={() => { }}
            />
        );

        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeInTheDocument();
        expect(checkbox).toHaveAttribute('id', 'test-checkbox');
        expect(checkbox).not.toBeChecked();
    });

    test('renders checkbox as checked when checked prop is true', () => {
        render(
            <Checkbox
                id="test-checkbox"
                checked={true}
                onCheckedChange={() => { }}
            />
        );

        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeChecked();
    });

    test('calls onCheckedChange when checkbox is clicked', () => {
        const handleChange = jest.fn();
        render(
            <Checkbox
                id="test-checkbox"
                checked={false}
                onCheckedChange={handleChange}
            />
        );

        const checkbox = screen.getByRole('checkbox');
        fireEvent.click(checkbox);

        expect(handleChange).toHaveBeenCalledTimes(1);
        expect(handleChange).toHaveBeenCalledWith(true);
    });

    test('applies custom className correctly', () => {
        render(
            <Checkbox
                id="test-checkbox"
                checked={false}
                onCheckedChange={() => { }}
                className="custom-checkbox-class"
            />
        );

        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toHaveClass('custom-checkbox-class');
        expect(checkbox).toHaveClass('h-4 w-4 rounded border-gray-300');
    });
});