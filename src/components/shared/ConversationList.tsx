import { memo, useMemo, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { IConversation } from '@/types';
import OnlineStatusIndicator from './OnlineStatusIndicator';
import { useSocket } from '@/context/SocketContext';
import { Search, FilterX, Check, Users, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface ConversationListProps {
  conversations: IConversation[];
  selectedId?: string;
  onSelectConversation: (user: any) => void;
  currentUserId: string;
}

type FilterType = 'all' | 'online' | 'unread';

/**
 * Enhanced Conversation List with modern design, filtering and animations
 */
const ConversationList = memo(
  ({
    conversations = [],
    selectedId,
    onSelectConversation,
    currentUserId,
  }: ConversationListProps) => {
    const { latestMessages, notificationCount, onlineUsers } = useSocket();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');

    // Filter and sort conversations
    const filteredConversations = useMemo(() => {
      if (!conversations.length) return [];

      // First apply search filter
      let filtered = conversations;

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(
          (conversation) =>
            conversation.user.name.toLowerCase().includes(term) ||
            (conversation.user.username &&
              conversation.user.username.toLowerCase().includes(term))
        );
      }

      // Then apply type filter
      switch (activeFilter) {
        case 'online':
          filtered = filtered.filter((conv) =>
            onlineUsers.includes(conv.user.$id || conv.user.id || '')
          );
          break;
        case 'unread':
          filtered = filtered.filter((conv) => {
            const userId = conv.user.$id || conv.user.id || '';
            const newMsgCount = notificationCount[userId] || 0;
            const totalUnread = conv.unreadCount + newMsgCount;
            return totalUnread > 0;
          });
          break;
      }

      // Sort by most recent message
      return [...filtered].sort((a, b) => {
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
    }, [
      conversations,
      searchTerm,
      activeFilter,
      latestMessages,
      notificationCount,
      onlineUsers,
    ]);

    // Empty state message
    if (conversations.length === 0) {
      return (
        <div className='flex flex-col items-center justify-center h-60 text-light-3 p-4'>
          <MessageSquare size={40} className='mb-3 opacity-50' />
          <p className='text-center mb-2'>No conversations yet</p>
          <p className='text-xs text-center opacity-70'>
            Your messages will appear here
          </p>
        </div>
      );
    }

    // Empty search results
    if (filteredConversations.length === 0) {
      return (
        <div className='flex flex-col'>
          {/* Search and filter area */}
          <div className='p-3 border-b border-dark-4'>
            <div className='relative'>
              <Search
                className='absolute left-3 top-1/2 transform -translate-y-1/2 text-light-3'
                size={16}
              />
              <Input
                type='text'
                placeholder='Search conversations...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-9 pr-3 py-2 bg-dark-3 border-none text-light-1 w-full rounded-lg focus-visible:ring-1 focus-visible:ring-primary-500'
              />
            </div>

            <div className='flex mt-2 gap-1'>
              <FilterButton
                label='All'
                isActive={activeFilter === 'all'}
                onClick={() => setActiveFilter('all')}
                icon={<Check size={14} />}
              />
              <FilterButton
                label='Online'
                isActive={activeFilter === 'online'}
                onClick={() => setActiveFilter('online')}
                icon={<Users size={14} />}
              />
              <FilterButton
                label='Unread'
                isActive={activeFilter === 'unread'}
                onClick={() => setActiveFilter('unread')}
                icon={<MessageSquare size={14} />}
              />
            </div>
          </div>

          <div className='flex flex-col items-center justify-center h-40 text-light-3 p-4'>
            <FilterX size={32} className='mb-2 opacity-50' />
            <p className='text-center mb-1'>No results found</p>
            <Button
              variant='ghost'
              size='sm'
              className='text-primary-500 mt-2'
              onClick={() => {
                setSearchTerm('');
                setActiveFilter('all');
              }}
            >
              Clear filters
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className='flex flex-col'>
        {/* Search and filter area */}
        <div className='p-3 border-b border-dark-4 sticky top-0 bg-dark-2 bg-opacity-95 backdrop-blur-sm z-10'>
          <div className='relative'>
            <Search
              className='absolute left-3 top-1/2 transform -translate-y-1/2 text-light-3'
              size={16}
            />
            <Input
              type='text'
              placeholder='Search conversations...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='pl-9 pr-3 py-2 bg-dark-3 border-none text-light-1 w-full rounded-lg focus-visible:ring-1 focus-visible:ring-primary-500'
            />
            {searchTerm && (
              <Button
                variant='ghost'
                size='icon'
                className='absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-1 text-light-3 hover:text-light-1'
                onClick={() => setSearchTerm('')}
              >
                <FilterX size={14} />
              </Button>
            )}
          </div>

          <div className='flex mt-2 gap-1'>
            <FilterButton
              label='All'
              isActive={activeFilter === 'all'}
              onClick={() => setActiveFilter('all')}
              icon={<Check size={14} />}
            />
            <FilterButton
              label='Online'
              isActive={activeFilter === 'online'}
              onClick={() => setActiveFilter('online')}
              icon={<Users size={14} />}
            />
            <FilterButton
              label='Unread'
              isActive={activeFilter === 'unread'}
              onClick={() => setActiveFilter('unread')}
              icon={<MessageSquare size={14} />}
            />
          </div>
        </div>

        {/* Conversation items */}
        <div className='flex-1 overflow-y-auto custom-scrollbar'>
          {filteredConversations.map((conversation, index) => {
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
            const isSelected = selectedId === userId;

            return (
              <ConversationItem
                key={key}
                conversation={conversation}
                isSelected={isSelected}
                onClick={() => onSelectConversation(userData)}
                currentUserId={currentUserId}
              />
            );
          })}
        </div>
      </div>
    );
  }
);

interface FilterButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}

// Filter button component
const FilterButton = ({
  label,
  isActive,
  onClick,
  icon,
}: FilterButtonProps) => {
  return (
    <Button
      variant={isActive ? 'default' : 'ghost'}
      size='sm'
      className={`text-xs px-3 py-1 h-8 ${
        isActive
          ? 'bg-primary-500 text-white'
          : 'bg-dark-3 text-light-3 hover:text-light-1'
      }`}
      onClick={onClick}
    >
      <span className='mr-1'>{icon}</span>
      {label}
    </Button>
  );
};

interface ConversationItemProps {
  conversation: IConversation;
  isSelected: boolean;
  onClick: () => void;
  currentUserId: string;
}

// Single conversation item component
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
      <motion.div
        className={`flex items-center p-3 cursor-pointer transition-colors ${
          isSelected
            ? 'bg-primary-500 bg-opacity-10 border-l-4 border-primary-500'
            : 'hover:bg-dark-3 border-l-4 border-transparent'
        } ${totalUnreadCount > 0 ? 'bg-primary-600 bg-opacity-5' : ''}`}
        onClick={handleClick}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className='relative flex-shrink-0'>
          <img
            src={userImage}
            alt={userName}
            className='w-12 h-12 rounded-full object-cover border border-dark-4 shadow-sm'
            onError={(e) => {
              e.currentTarget.src = '/assets/icons/profile-placeholder.svg';
            }}
          />

          <div className='absolute -bottom-1 -right-1 border-2 border-dark-2 rounded-full'>
            <OnlineStatusIndicator userId={userId} showAnimation />
          </div>

          {totalUnreadCount > 0 && (
            <div className='absolute -top-1 -right-1 min-w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center px-1.5'>
              <span className='text-xs text-white font-medium'>
                {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
              </span>
            </div>
          )}
        </div>

        <div className='ml-3 flex-1 min-w-0'>
          <div className='flex justify-between items-start mb-1'>
            <h4
              className={`font-semibold truncate mr-2 ${
                isSelected ? 'text-primary-500' : 'text-light-1'
              }`}
            >
              {userName}
            </h4>
            <span className='text-xs text-light-3 whitespace-nowrap flex-shrink-0'>
              {timeAgo}
            </span>
          </div>

          <p
            className={`text-sm truncate ${
              totalUnreadCount > 0
                ? 'text-light-1 font-medium'
                : isSelected
                  ? 'text-light-2'
                  : 'text-light-3'
            }`}
          >
            {messagePreview}
          </p>
        </div>
      </motion.div>
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
