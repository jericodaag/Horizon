import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import AuthLayout from '@/_auth/AuthLayout';

// Mock the Outlet component from react-router-dom
jest.mock('react-router-dom', () => ({
  Outlet: () => <div data-testid="outlet-mock">Outlet Content</div>
}));

describe('AuthLayout', () => {
  it('renders the layout with correct structure', () => {
    // Render the component
    render(<AuthLayout />);

    // Check if the section element exists with correct classes
    const sectionElement = screen.getByText('Outlet Content').closest('section');
    expect(sectionElement).toBeInTheDocument();
    expect(sectionElement).toHaveClass('flex', 'flex-1', 'justify-center', 'items-center', 'flex-col', 'py-10');

    // Verify that the Outlet component is rendered
    const outletElement = screen.getByTestId('outlet-mock');
    expect(outletElement).toBeInTheDocument();
    expect(outletElement).toHaveTextContent('Outlet Content');
  });
});