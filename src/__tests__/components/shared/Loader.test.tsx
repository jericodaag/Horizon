import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import Loader from '@/components/shared/Loader';

jest.unmock('@/components/shared/Loader');

describe('Loader Component', () => {
    it('renders the loader with all rings', () => {
        const { container } = render(<Loader />);

        const svgElement = container.querySelector('svg');
        expect(svgElement).toBeInTheDocument();

        const rings = container.querySelectorAll('.loader-ring');
        expect(rings.length).toBe(4);

        expect(container.querySelector('.loader-ring-a')).toBeInTheDocument();
        expect(container.querySelector('.loader-ring-b')).toBeInTheDocument();
        expect(container.querySelector('.loader-ring-c')).toBeInTheDocument();
        expect(container.querySelector('.loader-ring-d')).toBeInTheDocument();
    });

    it('applies the correct styles and animations', () => {
        const { container } = render(<Loader />);

        const svg = container.querySelector('svg');
        expect(svg).toHaveAttribute('width', '240');
        expect(svg).toHaveAttribute('height', '240');
        expect(svg).toHaveClass('loader');

        const ringA = container.querySelector('.loader-ring-a');
        const ringB = container.querySelector('.loader-ring-b');

        expect(ringA).toHaveClass('loader-ring');
        expect(ringB).toHaveClass('loader-ring');
    });
});