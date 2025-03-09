import { useSocket } from '@/context/SocketContext';
import { memo } from 'react';

interface OnlineStatusIndicatorProps {
  userId: string;
  className?: string;
}

// Visual indicator for user online status - memoized for performance
const OnlineStatusIndicator = memo(
  ({ userId, className = '' }: OnlineStatusIndicatorProps) => {
    const { onlineUsers } = useSocket();
    const isOnline = onlineUsers.includes(userId);

    return (
      <div
        className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'} ${className}`}
        title={isOnline ? 'Online' : 'Offline'}
      />
    );
  }
);

OnlineStatusIndicator.displayName = 'OnlineStatusIndicator';

export default OnlineStatusIndicator;
