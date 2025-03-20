import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FollowButton from '@/components/shared/FollowButton';

// Import specific mocks we need
import {
    mockFollowUser,
    mockUnfollowUser,
    mockIsFollowing
} from '@/__tests__/__mocks__/api';
import { mockToast } from '@/__tests__/__mocks__/ui';

// Mock the auth context
jest.mock('@/context/AuthContext', () => ({
    useUserContext: () => ({
        user: {
            id: 'currentUser123',
            $id: 'currentUser123',
            name: 'Current User',
            username: 'currentuser'
        }
    })
}));

describe('FollowButton Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('does not render if userId is the same as current user', () => {
        // Mock useUserContext to return a user with the same ID as the target userId
        jest.spyOn(require('@/context/AuthContext'), 'useUserContext').mockReturnValue({
            user: {
                id: 'user123',
                $id: 'user123',
                name: 'Test User',
                username: 'testuser'
            }
        });

        const { container } = render(<FollowButton userId="user123" />);

        // Component should not render anything
        expect(container.firstChild).toBeNull();
    });

    it('renders a Follow button when not following', () => {
        // Mock isFollowing to return false
        mockIsFollowing.mockReturnValue({ data: false });

        // Mock the useIsFollowing hook
        jest.spyOn(require('@/lib/react-query/queries'), 'useIsFollowing').mockReturnValue({
            data: false,
            isLoading: false
        });

        render(<FollowButton userId="user123" />);

        // Check for Follow text
        expect(screen.getByRole('button')).toHaveTextContent('Follow');

        // Should have default variant (primary background)
        expect(screen.getByRole('button')).not.toHaveClass('text-light-1');
        expect(screen.getByRole('button')).toHaveClass('bg-primary-500');
    });

    it('renders a Following button when already following', () => {
        // Mock isFollowing to return true
        mockIsFollowing.mockReturnValue({ data: true });

        // Mock the useIsFollowing hook
        jest.spyOn(require('@/lib/react-query/queries'), 'useIsFollowing').mockReturnValue({
            data: true,
            isLoading: false
        });

        render(<FollowButton userId="user123" />);

        // Check for Following text
        expect(screen.getByRole('button')).toHaveTextContent('Following');

        // Should have outline variant
        expect(screen.getByRole('button')).toHaveClass('text-light-1');
    });

    it('changes text to Unfollow on hover when already following', () => {
        // Mock isFollowing to return true
        mockIsFollowing.mockReturnValue({ data: true });

        // Mock the useIsFollowing hook
        jest.spyOn(require('@/lib/react-query/queries'), 'useIsFollowing').mockReturnValue({
            data: true,
            isLoading: false
        });

        render(<FollowButton userId="user123" />);

        // Initial state should show "Following"
        expect(screen.getByRole('button')).toHaveTextContent('Following');

        // Simulate hover
        fireEvent.mouseEnter(screen.getByRole('button'));

        // Text should change to "Unfollow"
        expect(screen.getByRole('button')).toHaveTextContent('Unfollow');

        // Simulate mouse leave
        fireEvent.mouseLeave(screen.getByRole('button'));

        // Text should change back to "Following"
        expect(screen.getByRole('button')).toHaveTextContent('Following');
    });

    it('calls followUser when button is clicked and not following', async () => {
        // Mock isFollowing to return false
        mockIsFollowing.mockReturnValue({ data: false });

        // Mock the useIsFollowing hook
        jest.spyOn(require('@/lib/react-query/queries'), 'useIsFollowing').mockReturnValue({
            data: false,
            isLoading: false
        });

        // Mock the followUser mutation
        const followUserMutate = jest.fn();
        jest.spyOn(require('@/lib/react-query/queries'), 'useFollowUser').mockReturnValue({
            mutate: followUserMutate,
            isPending: false
        });

        render(<FollowButton userId="user123" />);

        // Click the follow button
        fireEvent.click(screen.getByRole('button'));

        // Check if followUser was called with correct parameters
        await waitFor(() => {
            expect(followUserMutate).toHaveBeenCalledWith({
                followerId: 'currentUser123',
                followingId: 'user123'
            });
        });
    });

    it('calls unfollowUser when button is clicked and already following', async () => {
        // Mock isFollowing to return true
        mockIsFollowing.mockReturnValue({ data: true });

        // Mock the useIsFollowing hook
        jest.spyOn(require('@/lib/react-query/queries'), 'useIsFollowing').mockReturnValue({
            data: true,
            isLoading: false
        });

        // Mock the unfollowUser mutation
        const unfollowUserMutate = jest.fn();
        jest.spyOn(require('@/lib/react-query/queries'), 'useUnfollowUser').mockReturnValue({
            mutate: unfollowUserMutate,
            isPending: false
        });

        render(<FollowButton userId="user123" />);

        // Click the follow button
        fireEvent.click(screen.getByRole('button'));

        // Check if unfollowUser was called with correct parameters
        await waitFor(() => {
            expect(unfollowUserMutate).toHaveBeenCalledWith({
                followerId: 'currentUser123',
                followingId: 'user123'
            });
        });
    });

    it('shows loading state when action is in progress', async () => {
        // Mock isFollowing to return false
        mockIsFollowing.mockReturnValue({ data: false });

        // Mock the useIsFollowing hook
        jest.spyOn(require('@/lib/react-query/queries'), 'useIsFollowing').mockReturnValue({
            data: false,
            isLoading: false
        });

        // Mock the followUser mutation
        const followUserMutate = jest.fn().mockImplementation(() => {
            // This simulates the loading state by not resolving immediately
        });

        jest.spyOn(require('@/lib/react-query/queries'), 'useFollowUser').mockReturnValue({
            mutate: followUserMutate,
            isPending: false
        });

        render(<FollowButton userId="user123" />);

        // Click the follow button
        fireEvent.click(screen.getByRole('button'));

        // Check for loading spinner
        expect(screen.getByRole('button').querySelector('.animate-spin')).toBeInTheDocument();

        // Button should be disabled
        expect(screen.getByRole('button')).toBeDisabled();
    });

    it('shows toast notification when an error occurs', async () => {
        // Mock isFollowing to return false
        mockIsFollowing.mockReturnValue({ data: false });

        // Mock the useIsFollowing hook
        jest.spyOn(require('@/lib/react-query/queries'), 'useIsFollowing').mockReturnValue({
            data: false,
            isLoading: false
        });

        // Mock the followUser mutation to throw an error
        const followUserMutate = jest.fn().mockImplementation(() => {
            throw new Error('Network error');
        });

        jest.spyOn(require('@/lib/react-query/queries'), 'useFollowUser').mockReturnValue({
            mutate: followUserMutate,
            isPending: false
        });

        render(<FollowButton userId="user123" />);

        // Click the follow button
        fireEvent.click(screen.getByRole('button'));

        // Check if toast was shown with error message
        await waitFor(() => {
            expect(mockToast).toHaveBeenCalledWith({
                title: 'Error',
                description: 'Something went wrong. Please try again.',
                duration: 3000
            });
        });
    });

    it('renders in compact mode correctly', () => {
        // Mock isFollowing to return false
        mockIsFollowing.mockReturnValue({ data: false });

        // Mock the useIsFollowing hook
        jest.spyOn(require('@/lib/react-query/queries'), 'useIsFollowing').mockReturnValue({
            data: false,
            isLoading: false
        });

        render(<FollowButton userId="user123" compact={true} />);

        // Button should be round and smaller
        expect(screen.getByRole('button')).toHaveClass('w-8');
        expect(screen.getByRole('button')).toHaveClass('h-8');
        expect(screen.getByRole('button')).toHaveClass('rounded-full');

        // Should show icon instead of text
        expect(screen.getByRole('button')).not.toHaveTextContent('Follow');
        expect(screen.getByRole('button').querySelector('svg')).toBeInTheDocument();
    });

    it('applies custom className when provided', () => {
        // Mock isFollowing to return false
        mockIsFollowing.mockReturnValue({ data: false });

        // Mock the useIsFollowing hook
        jest.spyOn(require('@/lib/react-query/queries'), 'useIsFollowing').mockReturnValue({
            data: false,
            isLoading: false
        });

        render(<FollowButton userId="user123" className="custom-class" />);

        // Button should have custom class
        expect(screen.getByRole('button')).toHaveClass('custom-class');
    });
});