import { useSocket } from '@/context/SocketContext';
import { memo } from 'react';

interface OnlineStatusIndicatorProps {
  userId: string;
  size?: 'sm' | 'md' | 'lg';
  showAnimation?: boolean;
  className?: string;
}

/**
 * Enhanced Online Status Indicator with visual effects
 */
const OnlineStatusIndicator = memo(
  ({
    userId,
    size = 'md',
    showAnimation = true,
    className = '',
  }: OnlineStatusIndicatorProps) => {
    const { onlineUsers } = useSocket();
    const isOnline = onlineUsers.includes(userId);

    // Size classes
    const sizeClasses = {
      sm: 'w-2 h-2',
      md: 'w-3 h-3',
      lg: 'w-4 h-4',
    };

    // Status-dependent classes
    const statusClasses = isOnline ? 'bg-green-500' : 'bg-gray-400';

    return (
      <div className={`relative ${className}`}>
        {/* Main indicator */}
        <div
          className={`${sizeClasses[size]} rounded-full ${statusClasses} ring-2 ring-offset-1 ring-offset-dark-2 ring-dark-4 transition-colors duration-300`}
          title={isOnline ? 'Online' : 'Offline'}
        />

        {/* Pulse animation for online status */}
        {isOnline && showAnimation && (
          <span
            className={`absolute inset-0 ${sizeClasses[size]} rounded-full bg-green-500 animate-ping opacity-75`}
          />
        )}
      </div>
    );
  }
);

OnlineStatusIndicator.displayName = 'OnlineStatusIndicator';

export default OnlineStatusIndicator;
