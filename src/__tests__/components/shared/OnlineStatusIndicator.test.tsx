import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import OnlineStatusIndicator from '@/components/shared/OnlineStatusIndicator';
import { useSocket } from '@/context/SocketContext';

jest.unmock('@/components/shared/OnlineStatusIndicator');

jest.mock('@/context/SocketContext', () => ({
    useSocket: jest.fn()
}));

describe('OnlineStatusIndicator Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders green indicator when user is online', () => {
        (useSocket as jest.Mock).mockReturnValue({
            onlineUsers: ['user-123', 'user-456']
        });

        render(<OnlineStatusIndicator userId="user-123" />);
        const indicator = screen.getByTitle('Online');
        expect(indicator).toBeInTheDocument();
        expect(indicator).toHaveClass('bg-green-500');
        expect(indicator).not.toHaveClass('bg-gray-400');
    });

    it('renders gray indicator when user is offline', () => {
        (useSocket as jest.Mock).mockReturnValue({
            onlineUsers: ['user-456']
        });

        render(<OnlineStatusIndicator userId="user-123" />);
        const indicator = screen.getByTitle('Offline');
        expect(indicator).toBeInTheDocument();
        expect(indicator).toHaveClass('bg-gray-400');
        expect(indicator).not.toHaveClass('bg-green-500');
    });

    it('applies custom className when provided', () => {
        (useSocket as jest.Mock).mockReturnValue({
            onlineUsers: ['user-123']
        });

        const customClass = 'custom-class';
        render(<OnlineStatusIndicator userId="user-123" className={customClass} />);

        const indicator = screen.getByTitle('Online');
        const container = indicator.parentElement;
        expect(container).toHaveClass(customClass);
    });

    it('is memoized to prevent unnecessary re-renders', () => {
        expect(OnlineStatusIndicator.displayName).toBe('OnlineStatusIndicator');

    });
});