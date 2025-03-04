import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from '@/components/ui/button';

// No need to mock the cn utility - since it's done globally in setup.ts

describe('Button Component', () => {
    test('renders button with correct text', () => {
        render(<Button>Test Button</Button>);
        expect(screen.getByRole('button')).toHaveTextContent('Test Button');
    });

    test('calls onClick handler when clicked', () => {
        const handleClick = jest.fn();
        render(<Button onClick={handleClick}>Click Me</Button>);

        fireEvent.click(screen.getByRole('button'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('applies default variant and size classes', () => {
        render(<Button>Default Button</Button>);

        const button = screen.getByRole('button');
        // Check for default variant class
        expect(button.className).toContain('bg-primary');
        // Check for default size class
        expect(button.className).toContain('h-10');
    });

    test('applies different variant classes correctly', () => {
        const { rerender } = render(<Button variant="destructive">Destructive</Button>);
        expect(screen.getByRole('button').className).toContain('bg-destructive');

        rerender(<Button variant="outline">Outline</Button>);
        expect(screen.getByRole('button').className).toContain('border-input');

        rerender(<Button variant="ghost">Ghost</Button>);
        expect(screen.getByRole('button').className).toContain('hover:bg-accent');
    });

    test('applies different size classes correctly', () => {
        const { rerender } = render(<Button size="sm">Small</Button>);
        expect(screen.getByRole('button').className).toContain('h-9');

        rerender(<Button size="lg">Large</Button>);
        expect(screen.getByRole('button').className).toContain('h-11');

        rerender(<Button size="icon">Icon</Button>);
        expect(screen.getByRole('button').className).toContain('w-10');
    });

    test('renders as child element when asChild is true', () => {
        render(
            <Button asChild>
                <a href="/test">Link Button</a>
            </Button>
        );

        expect(screen.getByRole('link')).toBeInTheDocument();
        expect(screen.getByRole('link')).toHaveAttribute('href', '/test');
        // Should still apply button classes
        expect(screen.getByRole('link').className).toContain('inline-flex');
    });

    test('applies disabled styles correctly', () => {
        render(<Button disabled>Disabled Button</Button>);

        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
        expect(button.className).toContain('disabled:opacity-50');
    });

    test('combines custom className with default classes', () => {
        render(<Button className="custom-class">Custom Class Button</Button>);

        const button = screen.getByRole('button');
        expect(button.className).toContain('custom-class');
        // Should still have the default classes
        expect(button.className).toContain('inline-flex');
    });
});