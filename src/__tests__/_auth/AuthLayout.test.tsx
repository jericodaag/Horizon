import { render, screen } from '@testing-library/react';
import AuthLayout from '@/_auth/AuthLayout';

describe('AuthLayout', () => {
  it('renders the layout with correct structure', () => {
    render(<AuthLayout />);

    const outletElement = screen.getByTestId('outlet-mock');
    expect(outletElement).toBeInTheDocument();

    const sectionElement = outletElement.closest('section');
    expect(sectionElement).toBeInTheDocument();
    expect(sectionElement).toHaveClass(
      'flex',
      'flex-1',
      'justify-center',
      'items-center',
      'flex-col',
      'py-10'
    );
  });
});