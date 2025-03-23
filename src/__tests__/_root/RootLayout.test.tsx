import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RootLayout from '@/_root/RootLayout';

// Mock all child components
jest.mock('@/components/shared/Topbar', () => ({
  __esModule: true,
  default: () => <div data-testid='topbar-component'>Topbar Component</div>,
}));

jest.mock('@/components/shared/LeftSidebar', () => ({
  __esModule: true,
  default: () => (
    <div data-testid='left-sidebar-component'>LeftSidebar Component</div>
  ),
}));

jest.mock('@/components/shared/RightSideBar', () => ({
  __esModule: true,
  default: () => (
    <div data-testid='right-sidebar-component'>RightSidebar Component</div>
  ),
}));

jest.mock('@/components/shared/BottomBar', () => ({
  __esModule: true,
  default: () => (
    <div data-testid='bottom-bar-component'>BottomBar Component</div>
  ),
}));

// Mock the Outlet from react-router-dom
jest.mock('react-router-dom', () => ({
  Outlet: () => <div data-testid='outlet-content'>Main Content</div>,
}));

describe('RootLayout Component', () => {
  it('renders all layout components in the correct structure', () => {
    render(<RootLayout />);

    // Verify that all layout components are rendered
    expect(screen.getByTestId('topbar-component')).toBeInTheDocument();
    expect(screen.getByTestId('left-sidebar-component')).toBeInTheDocument();
    expect(screen.getByTestId('right-sidebar-component')).toBeInTheDocument();
    expect(screen.getByTestId('bottom-bar-component')).toBeInTheDocument();
    expect(screen.getByTestId('outlet-content')).toBeInTheDocument();

    // Verify the outlet is within a section element with correct classes
    const mainSection = screen.getByTestId('outlet-content').closest('section');
    expect(mainSection).toHaveClass('flex flex-1 h-full');
  });

  it('has the correct root container class', () => {
    render(<RootLayout />);

    // Get the root div element
    const rootContainer = screen.getByTestId('topbar-component').parentElement;
    expect(rootContainer).toHaveClass('w-full md:flex');
  });
});
