import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LeftSidebar from '@/components/shared/LeftSidebar';
import { useUserContext } from '@/context/AuthContext';
import { useSignOutAccount } from '@/lib/react-query/queries';
import { useSocket } from '@/context/SocketContext';
import { useTheme } from '@/context/ThemeContext';

jest.unmock('@/components/shared/LeftSidebar');

jest.mock('react-router-dom', () => ({
  Link: ({ children, to, className }) => {
    const toStr = String(to);
    return (
      <a href={toStr} className={className}>
        {children}
      </a>
    );
  },
  NavLink: ({ children, to, className }) => {
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

jest.mock('lucide-react', () => ({
  Loader2: () => <div data-testid="loader-icon">Loading...</div>,
}));

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className }) => (
      <div className={className} data-testid="notification-badge">
        {children}
      </div>
    ),
  },
}));

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
  const mockUser = {
    id: 'user-123',
    name: 'Test User',
    username: 'testuser',
    imageUrl: '/test-user.jpg',
  };

  const mockSignOut = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

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

    expect(screen.getByText(mockUser.name)).toBeInTheDocument();
    expect(screen.getByText(`@${mockUser.username}`)).toBeInTheDocument();

    const profileImg = screen.getByAltText('profile');
    expect(profileImg).toBeInTheDocument();
    expect(profileImg).toHaveAttribute('src', mockUser.imageUrl);

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

    const expectedLabels = [
      'Home', 'Notifications', 'Explore', 'People',
      'Saved', 'Messages', 'Create Post'
    ];

    expectedLabels.forEach(label => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });

    const navLinks = screen.getAllByRole('link');
    expect(navLinks.length).toBeGreaterThanOrEqual(expectedLabels.length);
  });

  it('shows notification badge for unread messages', () => {
    (useSocket as jest.Mock).mockReturnValue({
      totalUnreadMessages: 5,
      totalUnreadNotifications: 0
    });

    render(<LeftSidebar />);

    const messagesLink = screen.getByText('Messages').closest('a');
    expect(messagesLink).toBeInTheDocument();

    const badges = screen.getAllByTestId('notification-badge');
    expect(badges.length).toBeGreaterThan(0);

    const messageBadge = badges.find(badge => badge.textContent === '5');
    expect(messageBadge).toBeInTheDocument();
  });

  it('shows notification badge for unread notifications', () => {
    (useSocket as jest.Mock).mockReturnValue({
      totalUnreadMessages: 0,
      totalUnreadNotifications: 3
    });

    render(<LeftSidebar />);

    const notificationsLink = screen.getByText('Notifications').closest('a');
    expect(notificationsLink).toBeInTheDocument();

    const badges = screen.getAllByTestId('notification-badge');
    expect(badges.length).toBeGreaterThan(0);

    const notificationBadge = badges.find(badge => badge.textContent === '3');
    expect(notificationBadge).toBeInTheDocument();
  });

  it('shows "9+" when there are more than 9 unread messages', () => {
    (useSocket as jest.Mock).mockReturnValue({
      totalUnreadMessages: 12,
      totalUnreadNotifications: 0
    });

    render(<LeftSidebar />);

    const badges = screen.getAllByTestId('notification-badge');
    const messageBadge = badges.find(badge => badge.textContent === '9+');
    expect(messageBadge).toBeInTheDocument();
  });

  it('triggers sign out when logout button is clicked', () => {
    render(<LeftSidebar />);

    const logoutButton = screen.getByTestId('logout-button');
    expect(logoutButton).toBeInTheDocument();
    expect(logoutButton).toHaveTextContent('Logout');

    fireEvent.click(logoutButton);

    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it('shows loading state during sign out', () => {
    (useSignOutAccount as jest.Mock).mockReturnValue({
      mutate: mockSignOut,
      isSuccess: false,
      isPending: true,
    });

    render(<LeftSidebar />);

    const logoutButton = screen.getByTestId('logout-button');
    expect(logoutButton).toBeInTheDocument();
    expect(logoutButton).toBeDisabled();

    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();
    expect(screen.getByText('Logging out...')).toBeInTheDocument();
  });

  it('displays correct icon variants based on theme', () => {
    (useTheme as jest.Mock).mockReturnValue({ theme: 'dark' });

    const { rerender } = render(<LeftSidebar />);

    let logoutIcon = screen.getByAltText('logout');
    expect(logoutIcon).toHaveAttribute('src', '/assets/icons/logout.svg');

    (useTheme as jest.Mock).mockReturnValue({ theme: 'light' });
    rerender(<LeftSidebar />);

    logoutIcon = screen.getByAltText('logout');
    expect(logoutIcon).toHaveAttribute('src', '/assets/icons/logout-dark.svg');
  });
});