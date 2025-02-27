import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
    Form,
    FormItem,
    FormLabel,
    FormControl,
    FormDescription,
    FormMessage,
    FormField,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';

// Mock the dependencies
jest.mock('@radix-ui/react-label', () => ({
    Root: ({ className, children, ...props }: { className?: string, children: React.ReactNode, [key: string]: any }) => (
        <label data-testid="label-root" className={className} {...props}>{children}</label>
    ),
}));

jest.mock('@radix-ui/react-slot', () => ({
    Slot: ({ children, ...props }: { children: React.ReactNode, [key: string]: any }) => (
        <div data-testid="slot" {...props}>{children}</div>
    ),
}));

jest.mock('react-hook-form', () => ({
    FormProvider: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="form-provider">{children}</div>
    ),
    useFormContext: () => ({
        getFieldState: () => ({ error: null }),
        formState: {},
    }),
    Controller: ({ render }: { render: Function }) => <div data-testid="controller">{render({ field: { value: '', onChange: jest.fn() } })}</div>,
    useForm: jest.fn().mockReturnValue({
        control: {},
        formState: { errors: {} },
    }),
}));

jest.mock('@/components/ui/label', () => ({
    Label: ({ className, children, ...props }: { className?: string, children: React.ReactNode, [key: string]: any }) => (
        <label data-testid="ui-label" className={className} {...props}>{children}</label>
    ),
}));

jest.mock('@/lib/utils', () => ({
    cn: (...args: (string | undefined | boolean)[]) => args.filter(Boolean).join(' '),
}));

// Mock useId
React.useId = jest.fn().mockReturnValue('test-id');

// Create a test component that uses the Form components
const TestForm = () => {
    const form = useForm();

    return (
        <Form {...form}>
            <form>
                <FormField
                    control={form.control}
                    name="testField"
                    render={({ field }) => (
                        <FormItem className="custom-form-item">
                            <FormLabel className="custom-form-label">Test Label</FormLabel>
                            <FormControl>
                                <input className="custom-input" {...field} />
                            </FormControl>
                            <FormDescription className="custom-form-description">This is a description</FormDescription>
                            <FormMessage className="custom-form-message">This is a message</FormMessage>
                        </FormItem>
                    )}
                />
            </form>
        </Form>
    );
};

describe('Form Components', () => {
    test('render form components with custom classNames', () => {
        render(<TestForm />);

        expect(screen.getByTestId('form-provider')).toBeInTheDocument();

        const formItem = screen.getByText('Test Label').closest('div');
        expect(formItem).toHaveClass('custom-form-item');

        expect(screen.getByTestId('ui-label')).toHaveClass('custom-form-label');

        expect(screen.getByText('This is a description')).toHaveClass('custom-form-description');

        expect(screen.getByText('This is a message')).toHaveClass('custom-form-message');
    });
});