import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import Loader from '@/components/shared/Loader';

// Unmock the component we're testing
jest.unmock('@/components/shared/Loader');

describe('Loader Component', () => {
    it('renders the loader with all rings', () => {
        const { container } = render(<Loader />);

        // Get the SVG element
        const svgElement = container.querySelector('svg');
        expect(svgElement).toBeInTheDocument();

        // Check if all four rings are rendered
        const rings = container.querySelectorAll('.loader-ring');
        expect(rings.length).toBe(4);

        // Verify each ring has the correct class
        expect(container.querySelector('.loader-ring-a')).toBeInTheDocument();
        expect(container.querySelector('.loader-ring-b')).toBeInTheDocument();
        expect(container.querySelector('.loader-ring-c')).toBeInTheDocument();
        expect(container.querySelector('.loader-ring-d')).toBeInTheDocument();
    });

    it('applies the correct styles and animations', () => {
        const { container } = render(<Loader />);

        // Check if the loader has the correct size
        const svg = container.querySelector('svg');
        expect(svg).toHaveAttribute('width', '240');
        expect(svg).toHaveAttribute('height', '240');
        expect(svg).toHaveClass('loader');

        // Check if rings have different stroke colors
        const ringA = container.querySelector('.loader-ring-a');
        const ringB = container.querySelector('.loader-ring-b');

        // We can't directly test computed styles in JSDOM,
        // but we can verify the classes are applied
        expect(ringA).toHaveClass('loader-ring');
        expect(ringB).toHaveClass('loader-ring');
    });
});