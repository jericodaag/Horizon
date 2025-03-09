import { memo, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { IConversation } from '@/types';
import OnlineStatusIndicator from './OnlineStatusIndicator';
import { useSocket } from '@/context/SocketContext';

interface ConversationListProps {
  conversations: IConversation[];
  selectedId?: string;
  onSelectConversation: (user: any) => void;
  currentUserId: string;
}

interface ConversationItemProps {
  conversation: IConversation;
  isSelected: boolean;
  onClick: () => void;
  currentUserId: string;
}

const ConversationList = memo(
  ({
    conversations = [],
    selectedId,
    onSelectConversation,
    currentUserId,
  }: ConversationListProps) => {
    if (conversations.length === 0) {
      return (
        <div className='flex items-center justify-center w-full h-40 text-light-3'>
          <p>No conversations yet</p>
        </div>
      );
    }

    return (
      <div className='flex flex-col'>
        {conversations.map((conversation, index) => {
          // Skip invalid conversation objects
          if (!conversation || !conversation.user) {
            return null;
          }

          // Ensure stable keys and valid user data
          const key =
            conversation.user.$id ||
            conversation.user.id ||
            `conversation-${index}`;
          const userData = conversation.user;

          if (!userData || (!userData.$id && !userData.id)) {
            return null;
          }

          const userId = userData.$id || userData.id;

          return (
            <ConversationItem
              key={key}
              conversation={conversation}
              isSelected={selectedId === userId}
              onClick={() => onSelectConversation(userData)}
              currentUserId={currentUserId}
            />
          );
        })}
      </div>
    );
  }
);

// Individual conversation item with real-time status indicators
const ConversationItem = memo(
  ({
    conversation,
    isSelected,
    onClick,
    currentUserId,
  }: ConversationItemProps) => {
    // Get socket context for notifications and online status
    const {
      onlineUsers,
      notificationCount,
      clearNotifications,
      latestMessages,
    } = useSocket();

    if (!conversation || !conversation.user || !conversation.lastMessage) {
      return null;
    }

    const { user, lastMessage, unreadCount = 0 } = conversation;

    // Use fallbacks for required fields
    const userName = user.name || 'Unknown User';
    const userImage = user.imageUrl || '/assets/icons/profile-placeholder.svg';
    const messageContent = lastMessage?.content || 'No message';
    const userId = user.$id || user.id || '';

    // Get notification count and check online status
    const newMessageCount = notificationCount[userId] || 0;
    const totalUnreadCount = unreadCount + newMessageCount;
    const isOnline = onlineUsers.includes(userId);

    // Check for more recent messages from socket
    const latestSocketMessage = latestMessages[userId];
    const actualMessageContent =
      latestSocketMessage &&
      new Date(latestSocketMessage.timestamp) > new Date(lastMessage.createdAt)
        ? latestSocketMessage.content
        : messageContent;

    // Clear notifications when selecting this conversation
    const handleClick = () => {
      if (newMessageCount > 0) {
        clearNotifications(userId);
      }
      onClick();
    };

    // Format message preview text
    const messagePreview = useMemo(() => {
      const preview =
        actualMessageContent.length > 25
          ? `${actualMessageContent.substring(0, 25)}...`
          : actualMessageContent;

      // Add prefix for messages sent by current user
      const senderId = lastMessage?.sender?.$id || lastMessage?.sender;
      const prefix = senderId === currentUserId ? 'You: ' : '';

      return prefix + preview;
    }, [
      actualMessageContent,
      lastMessage?.sender,
      currentUserId,
      latestSocketMessage,
    ]);

    // Format relative time
    const timeAgo = useMemo(() => {
      try {
        if (latestSocketMessage?.timestamp) {
          return formatDistanceToNow(new Date(latestSocketMessage.timestamp), {
            addSuffix: true,
          });
        } else if (lastMessage?.createdAt) {
          return formatDistanceToNow(new Date(lastMessage.createdAt), {
            addSuffix: true,
          });
        }
        return 'recently';
      } catch (error) {
        return 'recently';
      }
    }, [lastMessage?.createdAt, latestSocketMessage?.timestamp]);

    return (
      <div
        className={`flex items-center p-4 cursor-pointer hover:bg-dark-3 transition-colors ${isSelected ? 'bg-dark-3' : ''} ${
          totalUnreadCount > 0 ? 'bg-opacity-70 bg-primary-900' : ''
        }`}
        onClick={handleClick}
      >
        <div className='relative flex-shrink-0'>
          {/* User avatar */}
          <img
            src={userImage}
            alt={userName}
            className='w-12 h-12 rounded-full object-cover'
            onError={(e) => {
              e.currentTarget.src = '/assets/icons/profile-placeholder.svg';
            }}
          />

          {/* Online status indicator */}
          <div className='absolute bottom-0 right-0 border-2 border-dark-2 rounded-full'>
            <OnlineStatusIndicator userId={userId} />
          </div>

          {/* Unread indicator */}
          {totalUnreadCount > 0 && (
            <div className='absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center'>
              <span className='text-xs text-white font-medium'>
                {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
              </span>
            </div>
          )}
        </div>

        <div className='ml-3 flex-1 min-w-0'>
          <div className='flex justify-between items-start mb-1'>
            <h4 className='body-bold text-light-1 truncate mr-2'>{userName}</h4>
            <span className='text-xs text-light-3 whitespace-nowrap'>
              {timeAgo}
            </span>
          </div>

          <p
            className={`text-sm truncate ${totalUnreadCount > 0 ? 'text-light-1 font-medium' : 'text-light-3'}`}
          >
            {messagePreview}
          </p>
        </div>
      </div>
    );
  },
  // Custom equality function prevents unnecessary re-renders
  (prevProps, nextProps) => {
    return (
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.conversation.unreadCount ===
        nextProps.conversation.unreadCount &&
      prevProps.conversation.lastMessage?.$id ===
        nextProps.conversation.lastMessage?.$id
    );
  }
);

// Set display names for debugging
ConversationList.displayName = 'ConversationList';
ConversationItem.displayName = 'ConversationItem';

export default ConversationList;
