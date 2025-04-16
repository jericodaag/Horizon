import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LeftSidebar from '@/components/shared/LeftSidebar';
import { useUserContext } from '@/context/AuthContext';
import { useSignOutAccount } from '@/lib/react-query/queries';
import { useSocket } from '@/context/SocketContext';
import { useTheme } from '@/context/ThemeContext';

// Unmock the component we're testing
jest.unmock('@/components/shared/LeftSidebar');

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  Link: ({ children, to, className }) => {
    // Convert to string to handle all types of paths
    const toStr = String(to);
    return (
      <a href={toStr} className={className}>
        {children}
      </a>
    );
  },
  NavLink: ({ children, to, className }) => {
    // Call className function if it's a function to simulate active state
    const resolvedClassName = typeof className === 'function'
      ? className({ isActive: to === '/explore' })
      : className;

    return (
      <a
        href={to}
        className={resolvedClassName}
      >
        {children}
      </a>
    );
  },
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/explore' }),
}));

// Mock dependencies
jest.mock('@/context/AuthContext', () => ({
  useUserContext: jest.fn(),
}));

jest.mock('@/lib/react-query/queries', () => ({
  useSignOutAccount: jest.fn(),
}));

jest.mock('@/context/SocketContext', () => ({
  useSocket: jest.fn(),
}));

jest.mock('@/context/ThemeContext', () => ({
  useTheme: jest.fn(),
}));

// Mock Button component
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, variant, className }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-variant={variant}
      className={className}
      data-testid="logout-button"
    >
      {children}
    </button>
  ),
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Loader2: () => <div data-testid="loader-icon">Loading...</div>,
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className }) => (
      <div className={className} data-testid="notification-badge">
        {children}
      </div>
    ),
  },
}));

// Define constant for sidebar links to use in tests if needed
jest.mock('@/constants', () => ({
  sidebarLinks: [
    { imgURL: '/assets/icons/home.svg', route: '/home', label: 'Home' },
    { imgURL: '/assets/icons/notification.svg', route: '/notifications', label: 'Notifications' },
    { imgURL: '/assets/icons/wallpaper.svg', route: '/explore', label: 'Explore' },
    { imgURL: '/assets/icons/people.svg', route: '/all-users', label: 'People' },
    { imgURL: '/assets/icons/bookmark.svg', route: '/saved', label: 'Saved' },
    { imgURL: '/assets/icons/message.svg', route: '/messages', label: 'Messages' },
    { imgURL: '/assets/icons/gallery-add.svg', route: '/create-post', label: 'Create Post' }
  ],
}));

describe('LeftSidebar Component', () => {
  // Common test data
  const mockUser = {
    id: 'user-123',
    name: 'Test User',
    username: 'testuser',
    imageUrl: '/test-user.jpg',
  };

  // Mock implementations
  const mockSignOut = jest.fn();

  // Setup before each test
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    (useUserContext as jest.Mock).mockReturnValue({ user: mockUser });
    (useSignOutAccount as jest.Mock).mockReturnValue({
      mutate: mockSignOut,
      isSuccess: false,
      isPending: false,
    });
    (useSocket as jest.Mock).mockReturnValue({
      totalUnreadMessages: 0,
      totalUnreadNotifications: 0
    });
    (useTheme as jest.Mock).mockReturnValue({ theme: 'dark' });
  });

  it('renders user profile information correctly', () => {
    render(<LeftSidebar />);

    // Check user profile section
    expect(screen.getByText(mockUser.name)).toBeInTheDocument();
    expect(screen.getByText(`@${mockUser.username}`)).toBeInTheDocument();

    // Check profile image
    const profileImg = screen.getByAltText('profile');
    expect(profileImg).toBeInTheDocument();
    expect(profileImg).toHaveAttribute('src', mockUser.imageUrl);

    // Check profile link exists (without using testId)
    const profileLinks = screen.getAllByRole('link');
    const profileLink = profileLinks.find(link =>
      link.getAttribute('href')?.includes(`/profile/${mockUser.id}`)
    );
    expect(profileLink).toBeInTheDocument();
  });

  it('renders correct logo for dark theme', () => {
    render(<LeftSidebar />);

    const logo = screen.getByAltText('Horizon');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/assets/images/logo.svg');
  });

  it('renders correct logo for light theme', () => {
    (useTheme as jest.Mock).mockReturnValue({ theme: 'light' });

    render(<LeftSidebar />);

    const logo = screen.getByAltText('Horizon');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/assets/images/logo-dark.svg');
  });

  it('renders all sidebar links from constants', () => {
    render(<LeftSidebar />);

    // Check if all sidebar links are rendered by their label text
    const expectedLabels = [
      'Home', 'Notifications', 'Explore', 'People',
      'Saved', 'Messages', 'Create Post'
    ];

    expectedLabels.forEach(label => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });

    // Verify we can find all the navigation links
    const navLinks = screen.getAllByRole('link');
    expect(navLinks.length).toBeGreaterThanOrEqual(expectedLabels.length);
  });

  it('shows notification badge for unread messages', () => {
    (useSocket as jest.Mock).mockReturnValue({
      totalUnreadMessages: 5,
      totalUnreadNotifications: 0
    });

    render(<LeftSidebar />);

    // Find the Messages nav item by text
    const messagesLink = screen.getByText('Messages').closest('a');
    expect(messagesLink).toBeInTheDocument();

    // Check that the badge is shown with correct number
    const badges = screen.getAllByTestId('notification-badge');
    expect(badges.length).toBeGreaterThan(0);

    // Check that at least one badge contains "5"
    const messageBadge = badges.find(badge => badge.textContent === '5');
    expect(messageBadge).toBeInTheDocument();
  });

  it('shows notification badge for unread notifications', () => {
    (useSocket as jest.Mock).mockReturnValue({
      totalUnreadMessages: 0,
      totalUnreadNotifications: 3
    });

    render(<LeftSidebar />);

    // Find the Notifications nav item by text
    const notificationsLink = screen.getByText('Notifications').closest('a');
    expect(notificationsLink).toBeInTheDocument();

    // Check that the badge is shown with correct number
    const badges = screen.getAllByTestId('notification-badge');
    expect(badges.length).toBeGreaterThan(0);

    // Check that at least one badge contains "3"
    const notificationBadge = badges.find(badge => badge.textContent === '3');
    expect(notificationBadge).toBeInTheDocument();
  });

  it('shows "9+" when there are more than 9 unread messages', () => {
    (useSocket as jest.Mock).mockReturnValue({
      totalUnreadMessages: 12,
      totalUnreadNotifications: 0
    });

    render(<LeftSidebar />);

    // Check that the badge shows "9+"
    const badges = screen.getAllByTestId('notification-badge');
    const messageBadge = badges.find(badge => badge.textContent === '9+');
    expect(messageBadge).toBeInTheDocument();
  });

  it('triggers sign out when logout button is clicked', () => {
    render(<LeftSidebar />);

    // Find the logout button
    const logoutButton = screen.getByTestId('logout-button');
    expect(logoutButton).toBeInTheDocument();
    expect(logoutButton).toHaveTextContent('Logout');

    // Click the logout button
    fireEvent.click(logoutButton);

    // Check that the sign out function was called
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it('shows loading state during sign out', () => {
    // Set the sign out state to loading
    (useSignOutAccount as jest.Mock).mockReturnValue({
      mutate: mockSignOut,
      isSuccess: false,
      isPending: true,
    });

    render(<LeftSidebar />);

    // Check that the button shows loading state
    const logoutButton = screen.getByTestId('logout-button');
    expect(logoutButton).toBeInTheDocument();
    expect(logoutButton).toBeDisabled();

    // Check that the loading spinner is shown
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
    expect(screen.getByText('Logging out...')).toBeInTheDocument();
  });

  it('displays correct icon variants based on theme', () => {
    // Test with dark theme
    (useTheme as jest.Mock).mockReturnValue({ theme: 'dark' });

    const { rerender } = render(<LeftSidebar />);

    // Check logout icon in dark theme
    let logoutIcon = screen.getByAltText('logout');
    expect(logoutIcon).toHaveAttribute('src', '/assets/icons/logout.svg');

    // Change to light theme and re-render
    (useTheme as jest.Mock).mockReturnValue({ theme: 'light' });
    rerender(<LeftSidebar />);

    // Check logout icon in light theme
    logoutIcon = screen.getByAltText('logout');
    expect(logoutIcon).toHaveAttribute('src', '/assets/icons/logout-dark.svg');
  });
});