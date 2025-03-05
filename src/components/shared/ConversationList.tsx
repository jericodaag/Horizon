import { memo, useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { IConversation } from '@/types';

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

const ConversationList = memo(({
    conversations = [],
    selectedId,
    onSelectConversation,
    currentUserId
}: ConversationListProps) => {
    // Handle empty state
    if (conversations.length === 0) {
        return (
            <div className="flex items-center justify-center w-full h-40 text-light-3">
                <p>No conversations yet</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col">
            {conversations.map((conversation, index) => {
                // Skip invalid conversation objects
                if (!conversation || !conversation.user) {
                    return null;
                }

                // Get a stable key for the item
                const key = conversation.user.$id || conversation.user.id || `conversation-${index}`;
                const userData = conversation.user;

                // Extra validation
                if (!userData || (!userData.$id && !userData.id)) {
                    return null;
                }

                return (
                    <ConversationItem
                        key={key}
                        conversation={conversation}
                        isSelected={selectedId === (userData.$id || userData.id)}
                        onClick={() => onSelectConversation(userData)}
                        currentUserId={currentUserId}
                    />
                );
            })}
        </div>
    );
});

// Memoized conversation item component
const ConversationItem = memo(({
    conversation,
    isSelected,
    onClick,
    currentUserId
}: ConversationItemProps) => {
    if (!conversation || !conversation.user || !conversation.lastMessage) {
        return null;
    }

    const { user, lastMessage, unreadCount = 0 } = conversation;

    // Fallback for required fields
    const userName = user.name || 'Unknown User';
    const userImage = user.imageUrl || '/assets/icons/profile-placeholder.svg';
    const messageContent = lastMessage?.content || 'No message';

    // Memoize formatted message preview
    const messagePreview = useMemo(() => {
        const preview = messageContent.length > 25
            ? `${messageContent.substring(0, 25)}...`
            : messageContent;

        // Determine if current user is sender
        const senderId = lastMessage?.sender?.$id || lastMessage?.sender;
        const prefix = senderId === currentUserId ? 'You: ' : '';

        return prefix + preview;
    }, [messageContent, lastMessage?.sender, currentUserId]);

    // Memoize formatted timestamp
    const timeAgo = useMemo(() => {
        try {
            if (lastMessage?.createdAt) {
                return formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true });
            }
            return 'recently';
        } catch (error) {
            return 'recently';
        }
    }, [lastMessage?.createdAt]);

    return (
        <div
            className={`flex items-center p-4 cursor-pointer hover:bg-dark-3 transition-colors ${isSelected ? 'bg-dark-3' : ''}`}
            onClick={onClick}
        >
            <div className="relative flex-shrink-0">
                {/* User avatar */}
                <img
                    src={userImage}
                    alt={userName}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => {
                        e.currentTarget.src = '/assets/icons/profile-placeholder.svg';
                    }}
                />

                {/* Unread indicator */}
                {unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                        <span className="text-xs text-white font-medium">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    </div>
                )}
            </div>

            <div className="ml-3 flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                    <h4 className="body-bold text-light-1 truncate mr-2">{userName}</h4>
                    <span className="text-xs text-light-3 whitespace-nowrap">{timeAgo}</span>
                </div>

                <p className={`text-sm truncate ${unreadCount > 0 ? 'text-light-1 font-medium' : 'text-light-3'}`}>
                    {messagePreview}
                </p>
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    // Custom comparison function to prevent unnecessary re-renders
    // Only re-render if these properties change
    return (
        prevProps.isSelected === nextProps.isSelected &&
        prevProps.conversation.unreadCount === nextProps.conversation.unreadCount &&
        prevProps.conversation.lastMessage?.$id === nextProps.conversation.lastMessage?.$id
    );
});

// Set display names for better debugging
ConversationList.displayName = 'ConversationList';
ConversationItem.displayName = 'ConversationItem';

export default ConversationList;