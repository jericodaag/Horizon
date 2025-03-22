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
    const { latestMessages } = useSocket();

    const sortedConversations = useMemo(() => {
      if (!conversations.length) return [];

      return [...conversations].sort((a, b) => {
        const aUserId = a.user.$id || a.user.id || '';
        const bUserId = b.user.$id || b.user.id || '';

        const aLatestSocketMsg = latestMessages[aUserId];
        const bLatestSocketMsg = latestMessages[bUserId];

        if (aLatestSocketMsg && bLatestSocketMsg) {
          return (
            new Date(bLatestSocketMsg.timestamp).getTime() -
            new Date(aLatestSocketMsg.timestamp).getTime()
          );
        }

        if (aLatestSocketMsg) {
          return new Date(aLatestSocketMsg.timestamp).getTime() >
            new Date(b.lastMessage.createdAt).getTime()
            ? -1
            : 1;
        }

        if (bLatestSocketMsg) {
          return new Date(a.lastMessage.createdAt).getTime() >
            new Date(bLatestSocketMsg.timestamp).getTime()
            ? -1
            : 1;
        }

        return (
          new Date(b.lastMessage.createdAt).getTime() -
          new Date(a.lastMessage.createdAt).getTime()
        );
      });
    }, [conversations, latestMessages]);

    if (sortedConversations.length === 0) {
      return (
        <div className='flex items-center justify-center w-full h-40 text-light-3'>
          <p>No conversations yet</p>
        </div>
      );
    }

    return (
      <div className='flex flex-col'>
        {sortedConversations.map((conversation, index) => {
          if (!conversation || !conversation.user) {
            return null;
          }

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

const ConversationItem = memo(
  ({
    conversation,
    isSelected,
    onClick,
    currentUserId,
  }: ConversationItemProps) => {
    const { notificationCount, clearNotifications, latestMessages } =
      useSocket();

    if (!conversation || !conversation.user || !conversation.lastMessage) {
      return null;
    }

    const { user, lastMessage, unreadCount = 0 } = conversation;

    const userName = user.name || 'Unknown User';
    const userImage = user.imageUrl || '/assets/icons/profile-placeholder.svg';
    const messageContent = lastMessage?.content || 'No message';
    const userId = user.$id || user.id || '';

    const newMessageCount = notificationCount[userId] || 0;
    const totalUnreadCount = unreadCount + newMessageCount;

    const latestSocketMessage = latestMessages[userId];
    const actualMessageContent =
      latestSocketMessage &&
      new Date(latestSocketMessage.timestamp) > new Date(lastMessage.createdAt)
        ? latestSocketMessage.content
        : messageContent;

    const handleClick = () => {
      if (newMessageCount > 0) {
        clearNotifications(userId);
      }
      onClick();
    };

    const messagePreview = useMemo(() => {
      const preview =
        actualMessageContent.length > 25
          ? `${actualMessageContent.substring(0, 25)}...`
          : actualMessageContent;

      const senderId = lastMessage?.sender?.$id || lastMessage?.sender;
      const prefix = senderId === currentUserId ? 'You: ' : '';

      return prefix + preview;
    }, [
      actualMessageContent,
      lastMessage?.sender,
      currentUserId,
      latestSocketMessage,
    ]);

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
          <img
            src={userImage}
            alt={userName}
            className='w-12 h-12 rounded-full object-cover'
            onError={(e) => {
              e.currentTarget.src = '/assets/icons/profile-placeholder.svg';
            }}
          />

          <div className='absolute bottom-0 right-0 border-2 border-dark-2 rounded-full'>
            <OnlineStatusIndicator userId={userId} />
          </div>

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

ConversationList.displayName = 'ConversationList';
ConversationItem.displayName = 'ConversationItem';

export default ConversationList;
