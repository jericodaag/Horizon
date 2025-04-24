import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Topbar from '@/components/shared/Topbar';

jest.unmock('@/components/shared/Topbar');

jest.mock('react-router-dom', () => ({
  Link: ({ children, to, className }) => (
    <a href={to} className={className} data-testid={`link-to-${to}`}>
      {children}
    </a>
  ),
  useNavigate: () => jest.fn(),
}));

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

jest.mock('@/lib/react-query/queries', () => ({
  useSignOutAccount: () => ({
    mutate: jest.fn(),
    isSuccess: false,
  }),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, variant, className, onClick }) => (
    <button
      onClick={onClick}
      className={className}
      data-variant={variant}
      data-testid='ui-button'
    >
      {children}
    </button>
  ),
}));

describe('Topbar Component', () => {
  it('renders the logo', () => {
    render(<Topbar />);

    const logo = screen.getByAltText('logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/assets/images/logo.svg');
    expect(logo).toHaveAttribute('width', '130');
    expect(logo).toHaveAttribute('height', '325');
  });

  it('renders the profile link with user image', () => {
    render(<Topbar />);

    const profileLink = screen.getByTestId('link-to-/profile/user123');
    expect(profileLink).toBeInTheDocument();
    expect(profileLink).toHaveAttribute('href', '/profile/user123');
    expect(profileLink).toHaveClass('flex-center gap-3');

    const profileImage = screen.getByAltText('profile');
    expect(profileImage).toBeInTheDocument();
    expect(profileImage).toHaveAttribute(
      'src',
      '/assets/icons/profile-placeholder.svg'
    );
    expect(profileImage).toHaveClass('h-8 w-8 rounded-full');
  });

  it('renders the logout button', () => {
    render(<Topbar />);

    const logoutButton = screen.getByTestId('ui-button');
    expect(logoutButton).toBeInTheDocument();
    expect(logoutButton).toHaveAttribute('data-variant', 'ghost');
    expect(logoutButton).toHaveClass('shad-button_ghost');

    const logoutIcon = screen.getByAltText('logout');
    expect(logoutIcon).toBeInTheDocument();
    expect(logoutIcon).toHaveAttribute('src', '/assets/icons/logout.svg');
  });

  it('calls signOut function when logout button is clicked', () => {
    const mockSignOut = jest.fn();

    jest
      .spyOn(require('@/lib/react-query/queries'), 'useSignOutAccount')
      .mockReturnValue({
        mutate: mockSignOut,
        isSuccess: false,
      });

    render(<Topbar />);

    const logoutButton = screen.getByTestId('ui-button');
    fireEvent.click(logoutButton);

    expect(mockSignOut).toHaveBeenCalled();
  });

  it('refreshes the page on successful signout', () => {
    const mockNavigate = jest.fn();

    jest
      .spyOn(require('react-router-dom'), 'useNavigate')
      .mockReturnValue(mockNavigate);

    jest
      .spyOn(require('@/lib/react-query/queries'), 'useSignOutAccount')
      .mockReturnValue({
        mutate: jest.fn(),
        isSuccess: true,
      });

    render(<Topbar />);

    expect(mockNavigate).toHaveBeenCalledWith(0);
  });

  it('has correct container structure and styling', () => {
    const { container } = render(<Topbar />);

    const topbar = container.firstChild;
    expect(topbar).not.toBeNull();
    if (topbar) {
      expect(topbar).toHaveClass('topbar');

      const innerContainer = topbar.firstChild;
      expect(innerContainer).not.toBeNull();
      if (innerContainer) {
        expect(innerContainer).toHaveClass('flex-between');
        expect(innerContainer).toHaveClass('py-4');
        expect(innerContainer).toHaveClass('px-5');
      }
    }
  });
});
