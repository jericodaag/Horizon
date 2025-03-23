import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AllUsers from '@/_root/pages/AllUsers';
import { BrowserRouter } from 'react-router-dom';

// Import specific mocks we need
import { mockGetUsers } from '@/__tests__/__mocks__/api';

// Mock the FollowButton component
jest.mock('@/components/shared/FollowButton', () => ({
  __esModule: true,
  default: ({ userId }) => (
    <button data-testid={`follow-button-${userId}`}>Follow</button>
  ),
}));

// Mock the motion component from framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    li: ({ children, ...props }) => <li {...props}>{children}</li>,
  },
}));

describe('AllUsers Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithRouter = (component) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  it('renders the header correctly', () => {
    // Configure the mock for this test
    mockGetUsers.mockReturnValue({
      data: { documents: [] },
      isLoading: false,
    });

    renderWithRouter(<AllUsers />);
    expect(screen.getByText('All Users')).toBeInTheDocument();
  });

  it('shows loader when fetching users', () => {
    // Configure the mock for this test
    mockGetUsers.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    renderWithRouter(<AllUsers />);

    // Check for loader
    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  it('renders user list when data is loaded', () => {
    // Configure the mock for this test
    mockGetUsers.mockReturnValue({
      data: {
        documents: [
          {
            $id: 'user1',
            name: 'John Doe',
            username: 'johndoe',
            imageUrl: '/assets/images/profile1.jpg',
            posts: [1, 2, 3],
            totalLikes: 42,
          },
          {
            $id: 'user2',
            name: 'Jane Smith',
            username: 'janesmith',
            imageUrl: null,
            posts: [],
            totalLikes: 0,
          },
        ],
      },
      isLoading: false,
    });

    renderWithRouter(<AllUsers />);

    // Check for user names
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();

    // Check for usernames (with @ symbol)
    expect(screen.getByText('@johndoe')).toBeInTheDocument();
    expect(screen.getByText('@janesmith')).toBeInTheDocument();

    // Check for follow buttons
    expect(screen.getByTestId('follow-button-user1')).toBeInTheDocument();
    expect(screen.getByTestId('follow-button-user2')).toBeInTheDocument();

    // Check for post counts and likes
    const postCounts = screen.getAllByText(/\d+/);
    expect(
      postCounts.some((element) => element.textContent === '3')
    ).toBeTruthy();
    expect(
      postCounts.some((element) => element.textContent === '42')
    ).toBeTruthy();
    expect(
      postCounts.some((element) => element.textContent === '0')
    ).toBeTruthy();
  });
});
