import { render, screen } from '@testing-library/react';
import RootLayout from '@/_root/RootLayout';
import '@testing-library/jest-dom';

// These mocks are specific to this test and not covered by global setupMocks
jest.mock('@/components/shared/Topbar', () => ({
    __esModule: true,
    default: () => <div data-testid="topbar-mock">Topbar Component</div>
}));

jest.mock('@/components/shared/LeftSidebar', () => ({
    __esModule: true,
    default: () => <div data-testid="left-sidebar-mock">LeftSidebar Component</div>
}));

jest.mock('@/components/shared/RightSideBar', () => ({
    __esModule: true,
    default: () => <div data-testid="right-sidebar-mock">RightSidebar Component</div>
}));

jest.mock('@/components/shared/BottomBar', () => ({
    __esModule: true,
    default: () => <div data-testid="bottom-bar-mock">BottomBar Component</div>
}));

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