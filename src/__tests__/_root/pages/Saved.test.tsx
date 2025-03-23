import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Saved from '@/_root/pages/Saved';

// Import API mocks
import { mockGetSavedPosts } from '@/__tests__/__mocks__/api';

// Mock the auth context
jest.mock('@/context/AuthContext', () => {
  const currentUser = {
    id: 'user123',
    $id: 'user123',
    name: 'Current User',
    username: 'currentuser',
    email: 'current@example.com',
    imageUrl: '/avatar.jpg',
    bio: 'Current user bio',
  };

  return {
    useUserContext: () => ({
      user: currentUser,
      isLoading: false,
      isAuthenticated: true,
      checkAuthUser: jest.fn().mockResolvedValue(true),
      setUser: jest.fn(),
      setIsAuthenticated: jest.fn(),
    }),
  };
});

// Mock components
jest.mock('@/components/shared/GridPostList', () => ({
  __esModule: true,
  default: ({ showStats, showUser }) => (
    <div
      data-testid='grid-post-list'
      data-showstats={String(showStats)}
      data-showuser={showUser ? String(showUser) : 'false'}
    >
      Grid Post List
    </div>
  ),
}));

jest.mock('@/components/shared/Loader', () => ({
  __esModule: true,
  default: () => <div data-testid='loader'>Loading...</div>,
}));

describe('Saved Component', () => {
  // Mock saved posts data
  const mockSavedPostsData = [
    {
      $id: 'saved1',
      caption: 'Saved post 1',
      imageUrl: 'https://example.com/saved1.jpg',
      creator: { $id: 'otheruser', name: 'Other User' },
    },
    {
      $id: 'saved2',
      caption: 'Saved post 2',
      imageUrl: 'https://example.com/saved2.jpg',
      creator: { $id: 'anotheruser', name: 'Another User' },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state while fetching saved posts', () => {
    // Set up mock to return loading state
    mockGetSavedPosts.mockReturnValue({
      data: null,
      isLoading: true,
    });

    render(<Saved />);

    // Check for loader
    expect(screen.getByTestId('loader')).toBeInTheDocument();

    // Verify page content is not shown during loading
    expect(screen.queryByText('Saved Posts')).not.toBeInTheDocument();
  });

  it('renders saved posts when available', () => {
    // Mock saved posts data
    mockGetSavedPosts.mockReturnValue({
      data: mockSavedPostsData,
      isLoading: false,
    });

    render(<Saved />);

    // Check for page title
    expect(screen.getByText('Saved Posts')).toBeInTheDocument();

    // Check that GridPostList is rendered with correct props
    const gridPostList = screen.getByTestId('grid-post-list');
    expect(gridPostList).toBeInTheDocument();
    expect(gridPostList).toHaveAttribute('data-showstats', 'true');
    expect(gridPostList).toHaveAttribute('data-showuser', 'true');
  });

  it('shows empty state when no saved posts exist', () => {
    // Mock empty saved posts
    mockGetSavedPosts.mockReturnValue({
      data: [],
      isLoading: false,
    });

    render(<Saved />);

    // Check for page title
    expect(screen.getByText('Saved Posts')).toBeInTheDocument();

    // Check for empty state message
    expect(screen.getByText('No saved posts yet')).toBeInTheDocument();

    // GridPostList should not be present
    expect(screen.queryByTestId('grid-post-list')).not.toBeInTheDocument();
  });
});
