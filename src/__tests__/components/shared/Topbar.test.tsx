import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Topbar from '@/components/shared/Topbar';

// Mock the signOut functionality
const mockSignOut = jest.fn();
jest.mock('@/lib/react-query/queries', () => ({
  useSignOutAccount: () => ({
    mutate: mockSignOut,
    isSuccess: false
  })
}));

// Mock the auth context
jest.mock('@/context/AuthContext', () => ({
  useUserContext: () => ({
    user: {
      id: 'user123',
      name: 'Test User',
      username: 'testuser',
      imageUrl: '/test-profile.jpg'
    }
  })
}));

// Mock React Router
jest.mock('react-router-dom', () => ({
  Link: ({ children, to, className }) => (
    <a href={to} className={className} data-testid={`link-${to}`}>
      {children}
    </a>
  ),
  useNavigate: () => jest.fn()
}));

describe('Topbar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the app logo', () => {
    render(<Topbar />);

    const logo = screen.getByAltText('logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/assets/images/logo.svg');
  });

  it('renders the profile link with user image', () => {
    render(<Topbar />);

    // Check for profile link
    const profileLink = screen.getByTestId(`link-/profile/user123`);
    expect(profileLink).toBeInTheDocument();

    // Check for user profile image
    const profileImage = screen.getByAltText('profile');
    expect(profileImage).toBeInTheDocument();
    expect(profileImage).toHaveAttribute('src', '/test-profile.jpg');
  });

  it('renders the logout button', () => {
    render(<Topbar />);

    const logoutIcon = screen.getByAltText('logout');
    expect(logoutIcon).toBeInTheDocument();
  });

  it('calls signOut when logout button is clicked', () => {
    render(<Topbar />);

    // Find and click the logout button
    const logoutButton = screen.getByAltText('logout').closest('button');
    if (!logoutButton) {
      throw new Error('Logout button not found');
    }

    fireEvent.click(logoutButton);

    // Check if signOut function was called
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it('navigates when sign out is successful', () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);

    // First render with isSuccess false
    const { rerender } = render(<Topbar />);

    // Then update the mock to simulate successful sign out
    jest.spyOn(require('@/lib/react-query/queries'), 'useSignOutAccount').mockReturnValue({
      mutate: mockSignOut,
      isSuccess: true
    });

    // Re-render to trigger the useEffect
    rerender(<Topbar />);

    // Check if navigate was called with 0 (which refreshes the page)
    expect(mockNavigate).toHaveBeenCalledWith(0);
  });

  it('applies the correct section class', () => {
    render(<Topbar />);

    // Get the topbar container
    const topbarSection = screen.getByRole('banner');
    expect(topbarSection).toHaveClass('topbar');
  });

  it('uses placeholder image when user has no profile image', () => {
    // Override the user context mock to return a user with no image
    jest.spyOn(require('@/context/AuthContext'), 'useUserContext').mockReturnValue({
      user: {
        id: 'user123',
        name: 'Test User',
        username: 'testuser',
        imageUrl: '' // Empty image URL
      }
    });

    render(<Topbar />);

    // Check that placeholder image is used
    const profileImage = screen.getByAltText('profile');
    expect(profileImage).toHaveAttribute('src', '/assets/icons/profile-placeholder.svg');
  });

  it('has the correct layout with flex-between class', () => {
    render(<Topbar />);

    // Since we can't easily test CSS classes on child elements in Jest,
    // we'll check that a div with flex-between class exists inside the topbar
    const layoutDiv = screen.getByAltText('logo').closest('div');
    if (!layoutDiv) {
      throw new Error('Layout div not found');
    }
    expect(layoutDiv).toHaveClass('flex-between');
  });
});