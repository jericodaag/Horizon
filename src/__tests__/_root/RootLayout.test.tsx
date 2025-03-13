import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RootLayout from '@/_root/RootLayout';

describe('RootLayout', () => {
    it('renders the layout with all required components', () => {
        render(<RootLayout />);

        expect(screen.getByTestId('topbar-mock')).toBeInTheDocument();
        expect(screen.getByTestId('left-sidebar-mock')).toBeInTheDocument();
        expect(screen.getByTestId('right-sidebar-mock')).toBeInTheDocument();
        expect(screen.getByTestId('bottom-bar-mock')).toBeInTheDocument();

        expect(screen.getByTestId('outlet-mock')).toBeInTheDocument();

        const sectionElement = screen.getByTestId('outlet-mock').closest('section');
        expect(sectionElement).toBeInTheDocument();
        expect(sectionElement).toHaveClass('flex', 'flex-1', 'h-full');
    });
});