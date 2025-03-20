import { render, screen } from '@testing-library/react';
import RootLayout from '@/_root/RootLayout';
import '@testing-library/jest-dom';

describe('RootLayout', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders all layout components correctly', () => {
        render(<RootLayout />);

        // Check if all layout components are rendered
        expect(screen.getByTestId('topbar-mock')).toBeInTheDocument();
        expect(screen.getByTestId('left-sidebar-mock')).toBeInTheDocument();
        expect(screen.getByTestId('right-sidebar-mock')).toBeInTheDocument();
        expect(screen.getByTestId('bottom-bar-mock')).toBeInTheDocument();
        expect(screen.getByTestId('outlet-mock')).toBeInTheDocument();
    });

    it('renders correct structure with proper nesting', () => {
        const { container } = render(<RootLayout />);

        // The main container is the root div of the component
        const mainContainer = container.firstChild;
        expect(mainContainer).toHaveClass('w-full');

        // The section containing Outlet should have expected classes
        const sectionElement = screen.getByTestId('outlet-mock').closest('section');
        expect(sectionElement).toBeInTheDocument();
        expect(sectionElement).toHaveClass('flex', 'flex-1', 'h-full');
    });
});