import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RightSidebar from '@/components/shared/RightSideBar';
import { useGetTopCreators } from '@/lib/react-query/queries';
import { BrowserRouter } from 'react-router-dom';

// Mock the necessary hooks and components
jest.mock('@/lib/react-query/queries', () => ({
  useGetTopCreators: jest.fn(),
}));

// Mock the FollowButton component
jest.mock('@/components/shared/FollowButton', () => ({
  __esModule: true,
  default: ({ userId, compact }) => (
    <button data-testid={`follow-button-${userId}`} data-compact={compact}>
      Follow
    </button>
  ),
}));

describe('RightSidebar Component', () => {
  // Sample creators data
  const mockCreators = [
    {
      $id: 'user1',
      name: 'User One',
      username: 'userone',
      email: 'user1@example.com',
      imageUrl: '/path/to/image1.jpg',
      bio: 'User bio',
      followerCount: 120,
    },
    {
      $id: 'user2',
      name: 'User Two',
      username: 'usertwo',
      email: 'user2@example.com',
      imageUrl: '/path/to/image2.jpg',
      bio: 'User bio',
      followerCount: 150,
    },
  ];

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Default mock implementation for useGetTopCreators
    (useGetTopCreators as jest.Mock).mockReturnValue({
      data: mockCreators,
      isLoading: false,
    });
  });

  it('renders the sidebar with correct structure', () => {
    render(
      <BrowserRouter>
        <RightSidebar />
      </BrowserRouter>
    );

    // Check main sections exist
    expect(screen.getByText('Top Creators')).toBeInTheDocument();
    expect(screen.getByText('Trending Topics')).toBeInTheDocument();

    // Check footer exists
    expect(screen.getByText('© 2025 Horizon Social')).toBeInTheDocument();

    // Verify navigation links
    expect(screen.getByText('See all')).toBeInTheDocument();

    // Check for footer links
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Privacy')).toBeInTheDocument();
    expect(screen.getByText('Terms')).toBeInTheDocument();
  });

  it('renders creators correctly when data is loaded', () => {
    render(
      <BrowserRouter>
        <RightSidebar />
      </BrowserRouter>
    );

    // Check if creator names are rendered
    expect(screen.getByText('User One')).toBeInTheDocument();
    expect(screen.getByText('User Two')).toBeInTheDocument();

    // Check if creator usernames are rendered
    expect(screen.getByText('@userone')).toBeInTheDocument();
    expect(screen.getByText('@usertwo')).toBeInTheDocument();

    // Check if follow buttons are rendered for each creator
    expect(screen.getByTestId('follow-button-user1')).toBeInTheDocument();
    expect(screen.getByTestId('follow-button-user2')).toBeInTheDocument();
  });

  it('renders trending topics', () => {
    render(
      <BrowserRouter>
        <RightSidebar />
      </BrowserRouter>
    );

    // Check if trending topics are rendered
    expect(screen.getByText('#photography')).toBeInTheDocument();
    expect(screen.getByText('#design')).toBeInTheDocument();
    expect(screen.getByText('#travel')).toBeInTheDocument();
    expect(screen.getByText('#coding')).toBeInTheDocument();

    // Check post counts
    expect(screen.getByText('1240 posts')).toBeInTheDocument();
    expect(screen.getByText('980 posts')).toBeInTheDocument();
    expect(screen.getByText('843 posts')).toBeInTheDocument();
    expect(screen.getByText('712 posts')).toBeInTheDocument();
  });

  it('renders loading state when creators are loading', () => {
    // Override the mock to simulate loading
    (useGetTopCreators as jest.Mock).mockReturnValue({
      data: [],
      isLoading: true,
    });

    render(
      <BrowserRouter>
        <RightSidebar />
      </BrowserRouter>
    );

    // Check if loading indicator is shown
    const loadingElement = screen.getByTestId('loader-icon');
    expect(loadingElement).toBeInTheDocument();
  });
});