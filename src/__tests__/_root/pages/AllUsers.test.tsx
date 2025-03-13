import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AllUsers from '@/_root/pages/AllUsers';

// Mock the dependencies
jest.mock('@/lib/react-query/queries', () => ({
    useGetUsers: jest.fn()
}));

jest.mock('@/components/shared/Loader', () => ({
    __esModule: true,
    default: () => <div data-testid="loader">Loading...</div>
}));

jest.mock('@/components/shared/FollowButton', () => ({
    __esModule: true,
    default: ({ userId, className }: any) => (
        <button data-testid={`follow-button-${userId}`} className={className}>
            Follow
        </button>
    )
}));

// Mock react-router-dom Link component
jest.mock('react-router-dom', () => ({
    Link: ({ to, className, children }: any) => (
        <a href={to} className={className} data-testid="router-link">
            {children}
        </a>
    )
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
    motion: {
        li: ({ children, ...props }: any) => (
            <li {...props}>{children}</li>
        )
    },
}));

// Import the mocked module to control its behavior
import { useGetUsers } from '@/lib/react-query/queries';

describe('AllUsers Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the header correctly', () => {
        // Mock the hook with default state (loaded)
        (useGetUsers as jest.Mock).mockReturnValue({
            data: { documents: [] },
            isLoading: false
        });

        render(<AllUsers />);
        expect(screen.getByText('All Users')).toBeInTheDocument();
    });

    it('shows loader when fetching users', () => {
        // Mock the hook to return loading state
        (useGetUsers as jest.Mock).mockReturnValue({
            data: undefined,
            isLoading: true
        });

        render(<AllUsers />);

        // Check for loader
        expect(screen.getByTestId('loader')).toBeInTheDocument();
    });

    it('renders user list when data is loaded', () => {
        // Mock the hook to return users
        (useGetUsers as jest.Mock).mockReturnValue({
            data: {
                documents: [
                    {
                        $id: 'user1',
                        name: 'John Doe',
                        username: 'johndoe',
                        imageUrl: '/assets/images/profile1.jpg',
                        posts: [1, 2, 3],
                        totalLikes: 42
                    },
                    {
                        $id: 'user2',
                        name: 'Jane Smith',
                        username: 'janesmith',
                        imageUrl: null,
                        posts: [],
                        totalLikes: 0
                    }
                ]
            },
            isLoading: false
        });

        render(<AllUsers />);

        // Check for user names
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();

        // Check for usernames (with @ symbol)
        expect(screen.getByText('@johndoe')).toBeInTheDocument();
        expect(screen.getByText('@janesmith')).toBeInTheDocument();

        // Check for follow buttons
        expect(screen.getByTestId('follow-button-user1')).toBeInTheDocument();
        expect(screen.getByTestId('follow-button-user2')).toBeInTheDocument();

        // Check for post counts (simplify by just checking for the values)
        const postCounts = screen.getAllByText(/\d+/);
        expect(postCounts.some(element => element.textContent === '3')).toBeTruthy();
        expect(postCounts.some(element => element.textContent === '42')).toBeTruthy();
        expect(postCounts.some(element => element.textContent === '0')).toBeTruthy();
    });
});