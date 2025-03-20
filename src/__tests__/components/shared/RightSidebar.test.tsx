import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RightSideBar from '@/components/shared/RightSideBar';

// Unmock the component we're testing
jest.unmock('@/components/shared/RightSideBar');

// Mock Link component
jest.mock('react-router-dom', () => ({
  Link: ({ children, to, className }) => (
    <a href={to} className={className} data-testid={`link-to-${to}`}>
      {children}
    </a>
  ),
}));

// Mock FollowButton component
jest.mock('@/components/shared/FollowButton', () => ({
  __esModule: true,
  default: ({ userId, className }) => (
    <button data-testid={`follow-button-${userId}`} className={className}>
      Follow
    </button>
  ),
}));

// Mock Loader component
jest.mock('lucide-react', () => ({
  Loader: () => <div data-testid='loader-icon'>Loading...</div>,
}));

// Mock the react-query hook
jest.mock('@/lib/react-query/queries', () => ({
  useGetTopCreators: () => {
    // Return mock creators or loading state based on test needs
    return {
      data: [
        {
          $id: 'creator1',
          name: 'Creator One',
          username: 'creator_one',
          email: 'creator1@example.com',
          imageUrl: '/assets/images/creator1.jpg',
          followerCount: 120,
        },
        {
          $id: 'creator2',
          name: 'Creator Two',
          username: 'creator_two',
          email: 'creator2@example.com',
          imageUrl: '',
          followerCount: 85,
        },
        {
          $id: 'creator3',
          name: 'Creator Three',
          username: 'creator_three',
          email: 'creator3@example.com',
          imageUrl: '/assets/images/creator3.jpg',
          followerCount: 65,
        },
        {
          $id: 'creator4',
          name: 'Creator Four',
          username: 'creator_four',
          email: 'creator4@example.com',
          imageUrl: '/assets/images/creator4.jpg',
          followerCount: 42,
        },
        {
          $id: 'creator5',
          name: 'Creator Five',
          username: 'creator_five',
          email: 'creator5@example.com',
          imageUrl: '/assets/images/creator5.jpg',
          followerCount: 35,
        },
        {
          $id: 'creator6',
          name: 'Creator Six',
          username: 'creator_six',
          email: 'creator6@example.com',
          imageUrl: '',
          followerCount: 20,
        },
      ],
      isLoading: false,
    };
  },
}));

describe('RightSideBar Component', () => {
  it('renders the top creators heading', () => {
    render(<RightSideBar />);

    expect(screen.getByText('Top Creators')).toBeInTheDocument();
    expect(screen.getByText('(Most Followed)')).toBeInTheDocument();
  });

  it('renders all creator cards', () => {
    render(<RightSideBar />);

    // Check that all creator names are displayed
    expect(screen.getByText('Creator One')).toBeInTheDocument();
    expect(screen.getByText('Creator Two')).toBeInTheDocument();
    expect(screen.getByText('Creator Three')).toBeInTheDocument();
    expect(screen.getByText('Creator Four')).toBeInTheDocument();
    expect(screen.getByText('Creator Five')).toBeInTheDocument();
    expect(screen.getByText('Creator Six')).toBeInTheDocument();

    // Check that all usernames are displayed
    expect(screen.getByText('@creator_one')).toBeInTheDocument();
    expect(screen.getByText('@creator_two')).toBeInTheDocument();
    expect(screen.getByText('@creator_three')).toBeInTheDocument();
    expect(screen.getByText('@creator_four')).toBeInTheDocument();
    expect(screen.getByText('@creator_five')).toBeInTheDocument();
    expect(screen.getByText('@creator_six')).toBeInTheDocument();
  });

  it('displays follower counts for each creator', () => {
    render(<RightSideBar />);

    expect(screen.getByText('120 followers')).toBeInTheDocument();
    expect(screen.getByText('85 followers')).toBeInTheDocument();
    expect(screen.getByText('65 followers')).toBeInTheDocument();
    expect(screen.getByText('42 followers')).toBeInTheDocument();
    expect(screen.getByText('35 followers')).toBeInTheDocument();
    expect(screen.getByText('20 followers')).toBeInTheDocument();
  });

  it('uses profile images when available', () => {
    render(<RightSideBar />);

    // Find all images
    const images = screen.getAllByRole('img');

    // Check attributes of first image (Creator One)
    expect(images[0]).toHaveAttribute('src', '/assets/images/creator1.jpg');
    expect(images[0]).toHaveAttribute('alt', 'Creator One');
  });

  it('shows first letter of name when image is not available', () => {
    render(<RightSideBar />);

    // Creator Two doesn't have an image, so it should show "C" (first letter of Creator)
    expect(screen.getAllByText('C')[0]).toBeInTheDocument();

    // Similarly for Creator Six
    expect(screen.getAllByText('C')[1]).toBeInTheDocument();
  });

  it('renders follow buttons for all creators', () => {
    render(<RightSideBar />);

    // Check for follow buttons
    expect(screen.getByTestId('follow-button-creator1')).toBeInTheDocument();
    expect(screen.getByTestId('follow-button-creator2')).toBeInTheDocument();
    expect(screen.getByTestId('follow-button-creator3')).toBeInTheDocument();
    expect(screen.getByTestId('follow-button-creator4')).toBeInTheDocument();
    expect(screen.getByTestId('follow-button-creator5')).toBeInTheDocument();
    expect(screen.getByTestId('follow-button-creator6')).toBeInTheDocument();
  });

  it('renders correct profile links for each creator', () => {
    render(<RightSideBar />);

    // Verify profile links
    expect(screen.getByTestId('link-to-/profile/creator1')).toHaveAttribute(
      'href',
      '/profile/creator1'
    );
    expect(screen.getByTestId('link-to-/profile/creator2')).toHaveAttribute(
      'href',
      '/profile/creator2'
    );
    expect(screen.getByTestId('link-to-/profile/creator3')).toHaveAttribute(
      'href',
      '/profile/creator3'
    );
    expect(screen.getByTestId('link-to-/profile/creator4')).toHaveAttribute(
      'href',
      '/profile/creator4'
    );
    expect(screen.getByTestId('link-to-/profile/creator5')).toHaveAttribute(
      'href',
      '/profile/creator5'
    );
    expect(screen.getByTestId('link-to-/profile/creator6')).toHaveAttribute(
      'href',
      '/profile/creator6'
    );
  });

  it('shows loading state when data is fetching', () => {
    // Override the mock to simulate loading
    jest
      .spyOn(require('@/lib/react-query/queries'), 'useGetTopCreators')
      .mockReturnValue({
        data: [],
        isLoading: true,
      });

    render(<RightSideBar />);

    // Verify loader is shown
    expect(screen.getByTestId('loader-icon')).toBeInTheDocument();

    // Verify creator cards are not shown
    expect(screen.queryByText('Creator One')).not.toBeInTheDocument();
  });

  it('shows a message when no creators are found', () => {
    // Override the mock to return empty data
    jest
      .spyOn(require('@/lib/react-query/queries'), 'useGetTopCreators')
      .mockReturnValue({
        data: [],
        isLoading: false,
      });

    render(<RightSideBar />);

    // Check for the "No creators found" message
    expect(screen.getByText('No creators found')).toBeInTheDocument();

    // Verify loader is not shown
    expect(screen.queryByTestId('loader-icon')).not.toBeInTheDocument();
  });

  it('has the correct container styles', () => {
    const { container } = render(<RightSideBar />);

    // Check the main container's classes
    const mainContainer = container.firstChild;
    expect(mainContainer).toHaveClass('hidden');
    expect(mainContainer).toHaveClass('xl:flex');
    expect(mainContainer).toHaveClass('flex-col');
    expect(mainContainer).toHaveClass('w-72');
  });
});
