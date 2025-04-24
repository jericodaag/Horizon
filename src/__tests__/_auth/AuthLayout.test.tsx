import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AuthLayout from '@/_auth/AuthLayout';

jest.mock('react-router-dom', () => ({
  Outlet: () => <div data-testid="mock-outlet">Outlet Content</div>,
}));

describe('AuthLayout Component', () => {
  it('renders with correct structure', () => {
    const { container } = render(<AuthLayout />);

    const sectionElement = container.querySelector('section');
    expect(sectionElement).toBeInTheDocument();
    expect(sectionElement).toHaveClass('h-screen');
    expect(sectionElement).toHaveClass('w-full');
  });

  it('renders the Outlet component for child routes', () => {
    render(<AuthLayout />);

    const outletElement = screen.getByTestId('mock-outlet');
    expect(outletElement).toBeInTheDocument();
    expect(outletElement).toHaveTextContent('Outlet Content');
  });

  it('contains only the section and Outlet without additional elements', () => {
    const { container } = render(<AuthLayout />);

    expect(container.childNodes.length).toBe(1);

    const sectionElement = container.querySelector('section');
    expect(sectionElement?.childNodes.length).toBe(1);
  });
});