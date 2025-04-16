import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BottomBar from '@/components/shared/BottomBar';

jest.unmock('@/components/shared/BottomBar');

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

jest.mock('@/constants', () => ({
  bottombarLinks: [
    { imgURL: '/assets/icons/home.svg', route: '/', label: 'Home' },
    { imgURL: '/assets/icons/explore.svg', route: '/explore', label: 'Explore' },
    { imgURL: '/assets/icons/create.svg', route: '/create-post', label: 'Create' },
    { imgURL: '/assets/icons/saved.svg', route: '/saved', label: 'Saved' },
  ],
}));

describe('BottomBar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all navigation links', () => {
    render(<BottomBar />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Explore')).toBeInTheDocument();
    expect(screen.getByText('Create')).toBeInTheDocument();
    expect(screen.getByText('Saved')).toBeInTheDocument();
  });

  it('renders all navigation icons', () => {
    render(<BottomBar />);

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
    render(<BottomBar />);

    const exploreLink = screen.getByTestId('link-to-/explore');
    expect(exploreLink).toHaveClass('bg-primary-500/20');

    const homeLink = screen.getByTestId('link-to-/');
    const createLink = screen.getByTestId('link-to-/create-post');
    const savedLink = screen.getByTestId('link-to-/saved');

    expect(homeLink).not.toHaveClass('bg-primary-500/20');
    expect(createLink).not.toHaveClass('bg-primary-500/20');
    expect(savedLink).not.toHaveClass('bg-primary-500/20');
  });

  it('applies appropriate styling to the active link icon', () => {
    render(<BottomBar />);

    const homeIcon = screen.getByAltText('Home');
    const exploreIcon = screen.getByAltText('Explore');


    const exploreClasses = exploreIcon.className;
    const homeClasses = homeIcon.className;

    expect(exploreClasses).not.toBe(homeClasses);
  });

  it('renders links with correct paths', () => {
    render(<BottomBar />);

    expect(screen.getByTestId('link-to-/')).toHaveAttribute('href', '/');
    expect(screen.getByTestId('link-to-/explore')).toHaveAttribute('href', '/explore');
    expect(screen.getByTestId('link-to-/create-post')).toHaveAttribute('href', '/create-post');
    expect(screen.getByTestId('link-to-/saved')).toHaveAttribute('href', '/saved');
  });
});