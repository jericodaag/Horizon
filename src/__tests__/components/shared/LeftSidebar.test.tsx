import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LeftSidebar from '@/components/shared/LeftSidebar';

// Unmock the component we're testing
jest.unmock('@/components/shared/LeftSidebar');

// Mock necessary dependencies
jest.mock('react-router-dom', () => ({
  Link: ({ children, to, className }) => (
    <a href={to} className={className} data-testid={`link-to-${to}`}>
      {children}
    </a>
  ),
  NavLink: ({ children, to, className }) => (
    <a href={to} className={className} data-testid={`navlink-to-${to}`}>
      {children}
    </a>
  ),
  useLocation: () => ({
    pathname: '/explore',
  }),
  useNavigate: () => jest.fn(),
}));

// Mock constants
jest.mock('@/constants', () => ({
  sidebarLinks: [
    { label: 'Home', route: '/', imgURL: '/assets/icons/home.svg' },
    {
      label: 'Explore',
      route: '/explore',
      imgURL: '/assets/icons/explore.svg',
    },
    { label: 'People', route: '/people', imgURL: '/assets/icons/people.svg' },
    { label: 'Saved', route: '/saved', imgURL: '/assets/icons/saved.svg' },
    {
      label: 'Create Post',
      route: '/create-post',
      imgURL: '/assets/icons/create.svg',
    },
  ],
}));

// Mock AuthContext
jest.mock('@/context/AuthContext', () => ({
  useUserContext: () => ({
    user: {
      id: 'user123',
      name: 'Test User',
      username: 'testuser',
      imageUrl: '/assets/icons/profile-placeholder.svg',
    },
  }),
}));

// Mock React Query
jest.mock('@/lib/react-query/queries', () => ({
  useSignOutAccount: () => ({
    mutate: jest.fn(),
    isSuccess: false,
    isPending: false,
  }),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Loader2: () => <div data-testid='loader-icon'>Loading Icon</div>,
}));

describe('LeftSidebar Component', () => {
  it('renders logo, profile, and navigation links', () => {
    render(<LeftSidebar />);

    // Check if logo is rendered
    expect(screen.getByAltText('logo')).toBeInTheDocument();

    // Check if profile is rendered
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('@testuser')).toBeInTheDocument();

    // Check if all navigation links are rendered
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Explore')).toBeInTheDocument();
    expect(screen.getByText('People')).toBeInTheDocument();
    expect(screen.getByText('Saved')).toBeInTheDocument();
    expect(screen.getByText('Create Post')).toBeInTheDocument();

    // Check if logout button is rendered
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('highlights the active navigation link', () => {
    render(<LeftSidebar />);

    // Get all sidebar links
    const sidebarItems = screen.getAllByRole('listitem');

    // Find the Explore item (index 1) which should be active based on our mock
    const exploreItem = sidebarItems.find((item) =>
      item.textContent?.includes('Explore')
    );
    expect(exploreItem).toHaveClass('bg-primary-500');

    // Find a non-active item (Home) and check it doesn't have the active class
    const homeItem = sidebarItems.find((item) =>
      item.textContent?.includes('Home')
    );
    expect(homeItem).not.toHaveClass('bg-primary-500');
  });

  it('applies invert-white class to active link icon', () => {
    render(<LeftSidebar />);

    // Find all navigation item images
    const navImages = screen
      .getAllByRole('img')
      .filter(
        (img) =>
          img.getAttribute('alt') !== 'logo' &&
          img.getAttribute('alt') !== 'profile' &&
          img.getAttribute('alt') !== 'logout'
      );

    // Find the Explore icon which should have invert-white
    const exploreIcon = navImages.find(
      (img) => img.getAttribute('alt') === 'Explore'
    );
    expect(exploreIcon).toHaveClass('invert-white');

    // Find the Home icon which should not have invert-white
    const homeIcon = navImages.find(
      (img) => img.getAttribute('alt') === 'Home'
    );
    expect(homeIcon).not.toHaveClass('invert-white');
  });

  it('shows loading state when signing out', () => {
    // Override the mock to simulate loading state
    jest
      .spyOn(require('@/lib/react-query/queries'), 'useSignOutAccount')
      .mockReturnValue({
        mutate: jest.fn(),
        isSuccess: false,
        isPending: true,
      });

    render(<LeftSidebar />);

    // Check if loading text is displayed
    expect(screen.getByText('Logging out...')).toBeInTheDocument();
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
  });

  it('calls signOut function when logout button is clicked', () => {
    const mockSignOut = jest.fn();

    // Override the mock to provide our mock function
    jest
      .spyOn(require('@/lib/react-query/queries'), 'useSignOutAccount')
      .mockReturnValue({
        mutate: mockSignOut,
        isSuccess: false,
        isPending: false,
      });

    render(<LeftSidebar />);

    // Find and click logout button
    fireEvent.click(screen.getByText('Logout'));

    // Verify the signOut function was called
    expect(mockSignOut).toHaveBeenCalled();
  });

  it('navigates to profile page when profile link is clicked', () => {
    render(<LeftSidebar />);

    // Find profile link
    const profileLink = screen.getByTestId('link-to-/profile/user123');
    expect(profileLink).toBeInTheDocument();
    expect(profileLink).toHaveAttribute('href', '/profile/user123');
  });
});
