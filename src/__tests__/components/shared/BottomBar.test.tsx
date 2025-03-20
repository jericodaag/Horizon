import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Bottombar from '@/components/shared/BottomBar';

// Unmock the component we're testing
jest.unmock('@/components/shared/BottomBar');

// Mock necessary dependencies
jest.mock('react-router-dom', () => ({
  Link: ({ children, to, className }) => (
    <a href={to} className={className} data-testid={`link-to-${to}`}>
      {children}
    </a>
  ),
  useLocation: () => ({
    pathname: '/explore',
  }),
}));

// Mock constants
jest.mock('@/constants', () => ({
  bottombarLinks: [
    { label: 'Home', route: '/', imgURL: '/assets/icons/home.svg' },
    {
      label: 'Explore',
      route: '/explore',
      imgURL: '/assets/icons/explore.svg',
    },
    {
      label: 'Create',
      route: '/create-post',
      imgURL: '/assets/icons/create.svg',
    },
    { label: 'Saved', route: '/saved', imgURL: '/assets/icons/saved.svg' },
  ],
}));

describe('Bottombar Component', () => {
  it('renders all navigation links', () => {
    render(<Bottombar />);

    // Check if all links are rendered with correct text
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Explore')).toBeInTheDocument();
    expect(screen.getByText('Create')).toBeInTheDocument();
    expect(screen.getByText('Saved')).toBeInTheDocument();
  });

  it('renders all navigation icons', () => {
    render(<Bottombar />);

    // Check if all icons are rendered with correct alt text and src
    const icons = screen.getAllByRole('img');
    expect(icons).toHaveLength(4);

    expect(icons[0]).toHaveAttribute('alt', 'Home');
    expect(icons[0]).toHaveAttribute('src', '/assets/icons/home.svg');

    expect(icons[1]).toHaveAttribute('alt', 'Explore');
    expect(icons[1]).toHaveAttribute('src', '/assets/icons/explore.svg');

    expect(icons[2]).toHaveAttribute('alt', 'Create');
    expect(icons[2]).toHaveAttribute('src', '/assets/icons/create.svg');

    expect(icons[3]).toHaveAttribute('alt', 'Saved');
    expect(icons[3]).toHaveAttribute('src', '/assets/icons/saved.svg');
  });

  it('applies active styles to the current route', () => {
    render(<Bottombar />);

    // Check if the explore link has the active class (based on our mocked pathname)
    const exploreLink = screen.getByTestId('link-to-/explore');
    expect(exploreLink).toHaveClass('bg-primary-500');

    // Check if other links don't have the active class
    const homeLink = screen.getByTestId('link-to-/');
    const createLink = screen.getByTestId('link-to-/create-post');
    const savedLink = screen.getByTestId('link-to-/saved');

    expect(homeLink).not.toHaveClass('bg-primary-500');
    expect(createLink).not.toHaveClass('bg-primary-500');
    expect(savedLink).not.toHaveClass('bg-primary-500');
  });

  it('applies invert-white class to the active link icon', () => {
    render(<Bottombar />);

    // Find the icons
    const homeIcon = screen.getByAltText('Home');
    const exploreIcon = screen.getByAltText('Explore');
    const createIcon = screen.getByAltText('Create');
    const savedIcon = screen.getByAltText('Saved');

    // Check if explore icon has invert-white class (since explore is the active route)
    expect(exploreIcon).toHaveClass('invert-white');

    // Check if other icons don't have invert-white class
    expect(homeIcon).not.toHaveClass('invert-white');
    expect(createIcon).not.toHaveClass('invert-white');
    expect(savedIcon).not.toHaveClass('invert-white');
  });

  it('renders links with correct paths', () => {
    render(<Bottombar />);

    // Check if links have correct href attributes
    expect(screen.getByTestId('link-to-/')).toHaveAttribute('href', '/');
    expect(screen.getByTestId('link-to-/explore')).toHaveAttribute(
      'href',
      '/explore'
    );
    expect(screen.getByTestId('link-to-/create-post')).toHaveAttribute(
      'href',
      '/create-post'
    );
    expect(screen.getByTestId('link-to-/saved')).toHaveAttribute(
      'href',
      '/saved'
    );
  });

  it('changes active link when location changes', () => {
    // Initial render with explore as active path
    const { unmount } = render(<Bottombar />);

    // Verify Explore is active
    expect(screen.getByTestId('link-to-/explore')).toHaveClass(
      'bg-primary-500'
    );
    expect(screen.getByAltText('Explore')).toHaveClass('invert-white');

    // Unmount the first render
    unmount();

    // Change the mocked location
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue({
      pathname: '/saved',
    });

    // Render again with new location
    render(<Bottombar />);

    // Now Saved should be active
    expect(screen.getByTestId('link-to-/saved')).toHaveClass('bg-primary-500');
    expect(screen.getByAltText('Saved')).toHaveClass('invert-white');

    // And Explore should not be active
    expect(screen.getByTestId('link-to-/explore')).not.toHaveClass(
      'bg-primary-500'
    );
    expect(screen.getByAltText('Explore')).not.toHaveClass('invert-white');
  });

  it('renders with the correct container class', () => {
    const { container } = render(<Bottombar />);

    // Check if the bottombar has the correct class
    expect(container.firstChild).toHaveClass('bottom-bar');
  });
});
