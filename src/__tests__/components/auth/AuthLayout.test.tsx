import { render, screen } from '../../test-utils';
import AuthLayout from '@/_auth/AuthLayout';

describe('AuthLayout', () => {
  it('renders the layout with correct structure', () => {
    render(<AuthLayout />);

    // Check if the outlet element exists
    const outletElement = screen.getByTestId('outlet-mock');
    expect(outletElement).toBeInTheDocument();

    // Check if the section element exists with correct structure
    const sectionElement = outletElement.closest('section');
    expect(sectionElement).toBeInTheDocument();

    // Check for correct classes on the section
    expect(sectionElement).toHaveClass(
      'flex',
      'flex-1',
      'justify-center',
      'items-center',
      'flex-col',
      'py-10'
    );

    // Verify that the Outlet component content is displayed
    expect(outletElement).toHaveTextContent('Outlet Content');
  });
});
