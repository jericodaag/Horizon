import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FollowButton from '@/components/shared/FollowButton';
import { useUserContext } from '@/context/AuthContext';
import { useFollowUser, useUnfollowUser, useIsFollowing } from '@/lib/react-query/queries';
import { useToast } from '@/components/ui/use-toast';

jest.unmock('@/components/shared/FollowButton');

jest.mock('@/context/AuthContext', () => ({
    useUserContext: jest.fn()
}));

jest.mock('@/lib/react-query/queries', () => ({
    useFollowUser: jest.fn(),
    useUnfollowUser: jest.fn(),
    useIsFollowing: jest.fn()
}));

jest.mock('@/components/ui/use-toast', () => ({
    useToast: jest.fn()
}));

jest.mock('@/components/ui/button', () => ({
    Button: ({ children, onClick, disabled, variant, size, className, onMouseEnter, onMouseLeave }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            data-variant={variant}
            data-size={size}
            className={className}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            data-testid="follow-button"
        >
            {children}
        </button>
    )
}));

jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>
    },
    AnimatePresence: ({ children }) => <>{children}</>
}));

jest.mock('lucide-react', () => ({
    UserPlus: () => <div data-testid="user-plus-icon">UserPlus</div>,
    UserCheck: ({ className, size }) => (
        <div data-testid="user-check-icon" className={className} style={{ width: size, height: size }}>
            UserCheck
        </div>
    )
}));

describe('FollowButton Component', () => {
    const mockUser = {
        id: 'current-user-123',
        name: 'Current User',
        username: 'currentuser',
        imageUrl: '/current-user.jpg'
    };

    const otherUserId = 'other-user-456';

    const mockToast = jest.fn();
    const mockFollowMutate = jest.fn();
    const mockUnfollowMutate = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        (useUserContext as jest.Mock).mockReturnValue({ user: mockUser });
        (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
        (useFollowUser as jest.Mock).mockReturnValue({ mutate: mockFollowMutate });
        (useUnfollowUser as jest.Mock).mockReturnValue({ mutate: mockUnfollowMutate });
        (useIsFollowing as jest.Mock).mockReturnValue({ data: false });
    });

    it('renders nothing when userId matches current user id', () => {
        render(<FollowButton userId={mockUser.id} />);
        expect(screen.queryByTestId('follow-button')).not.toBeInTheDocument();
    });

    it('renders Follow button when not following user', () => {
        render(<FollowButton userId={otherUserId} />);

        const button = screen.getByTestId('follow-button');
        expect(button).toBeInTheDocument();
        expect(button).toHaveTextContent('Follow');
        expect(button).toHaveAttribute('data-variant', 'default');
        expect(button.className).toContain('bg-primary-500');
    });

    it('renders Following button when already following user', () => {
        (useIsFollowing as jest.Mock).mockReturnValue({ data: true });

        render(<FollowButton userId={otherUserId} />);

        const button = screen.getByTestId('follow-button');
        expect(button).toBeInTheDocument();
        expect(button).toHaveTextContent('Following');
        expect(button).toHaveAttribute('data-variant', 'outline');
    });

    it('changes text to Unfollow on hover when following', () => {
        (useIsFollowing as jest.Mock).mockReturnValue({ data: true });

        render(<FollowButton userId={otherUserId} />);

        const button = screen.getByTestId('follow-button');
        expect(button).toHaveTextContent('Following');

        fireEvent.mouseEnter(button);

        expect(button).toHaveTextContent('Unfollow');

        fireEvent.mouseLeave(button);

        expect(button).toHaveTextContent('Following');
    });

    it('calls followUser when clicking Follow button', async () => {
        render(<FollowButton userId={otherUserId} />);

        const button = screen.getByTestId('follow-button');
        fireEvent.click(button);

        expect(mockFollowMutate).toHaveBeenCalledWith({
            followerId: mockUser.id,
            followingId: otherUserId
        });
        expect(mockUnfollowMutate).not.toHaveBeenCalled();
    });

    it('calls unfollowUser when clicking Following/Unfollow button', async () => {
        (useIsFollowing as jest.Mock).mockReturnValue({ data: true });

        render(<FollowButton userId={otherUserId} />);

        const button = screen.getByTestId('follow-button');
        fireEvent.click(button);

        expect(mockUnfollowMutate).toHaveBeenCalledWith({
            followerId: mockUser.id,
            followingId: otherUserId
        });
        expect(mockFollowMutate).not.toHaveBeenCalled();
    });

    it('renders in compact mode when compact prop is true', () => {
        render(<FollowButton userId={otherUserId} compact />);

        const button = screen.getByTestId('follow-button');
        expect(button).toHaveAttribute('data-size', 'icon');
        expect(button.className).toContain('w-8 h-8 rounded-full');
        expect(screen.getByTestId('user-plus-icon')).toBeInTheDocument();
        expect(button).not.toHaveTextContent('Follow');
    });

    it('shows UserCheck icon in compact mode when following', () => {
        (useIsFollowing as jest.Mock).mockReturnValue({ data: true });

        render(<FollowButton userId={otherUserId} compact />);

        expect(screen.getByTestId('user-check-icon')).toBeInTheDocument();
        expect(screen.queryByTestId('user-plus-icon')).not.toBeInTheDocument();
    });

    it('applies custom className when provided', () => {
        const customClass = 'my-custom-class';

        render(<FollowButton userId={otherUserId} className={customClass} />);

        const button = screen.getByTestId('follow-button');
        expect(button.className).toContain(customClass);
    });

    it('shows loading spinner when in loading state', async () => {
        jest.spyOn(React, 'useState')
            .mockImplementationOnce(() => [true, jest.fn()])
            .mockImplementationOnce(() => [false, jest.fn()]);

        render(<FollowButton userId={otherUserId} />);

        const button = screen.getByTestId('follow-button');
        expect(button).toBeInTheDocument();
        expect(button).toBeDisabled();

        const spinnerDiv = button.querySelector('div');
        expect(spinnerDiv).toBeTruthy();

        jest.spyOn(React, 'useState').mockRestore();
    });
});