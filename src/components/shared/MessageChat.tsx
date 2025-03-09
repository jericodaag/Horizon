import { useState, useEffect, useRef, useMemo, memo } from 'react';
import {
  useGetConversation,
  useSendMessage,
  useMarkMessagesAsRead,
} from '@/lib/react-query/queries';
import { useMessagingRealtime } from '@/hooks/useMessagingRealtime';
import { useSocket } from '@/context/SocketContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader, ArrowLeft, Send, Image, X } from 'lucide-react';
import { uploadFile, getFilePreview } from '@/lib/appwrite/api';
import { formatDistanceToNow } from 'date-fns';
import { IMessage, IUser, INewMessage } from '@/types';
import OnlineStatusIndicator from './OnlineStatusIndicator';

interface MessageChatProps {
  conversation: IUser;
  currentUserId: string;
  onBack: () => void;
}

interface MessageBubbleProps {
  message: IMessage;
  isOwnMessage: boolean;
}

const MessageChat = ({
  conversation,
  currentUserId,
  onBack,
}: MessageChatProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [socketMessages, setSocketMessages] = useState<IMessage[]>([]);
  const [processingMessageIds] = useState(new Set<string>()); // Track messages being processed
  const conversationId = conversation.id;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Get socket context
  const { socket, isConnected, onlineUsers, clearNotifications } = useSocket();
  const isOnline = onlineUsers.includes(conversationId);

  // Enable real-time updates via Appwrite
  useMessagingRealtime(currentUserId, conversationId);

  // Fetch conversation messages from Appwrite
  const { data: messages, isLoading: isLoadingMessages } = useGetConversation(
    currentUserId,
    conversationId
  );

  // Send message mutation for Appwrite
  const { mutate: sendAppwriteMessage, isPending: isSending } =
    useSendMessage();

  // Mark messages as read mutation
  const { mutate: markAsRead } = useMarkMessagesAsRead();

  // Clear notifications when viewing this conversation
  useEffect(() => {
    clearNotifications(conversationId);
  }, [conversationId, clearNotifications]);

  // Listen for Socket.io messages
  useEffect(() => {
    if (!socket) return;

    // Listen for real-time messages
    const handleNewMessage = (receivedMessage: any) => {
      console.log('Received message via socket:', receivedMessage);

      // Check if this is a message we're currently processing
      if (processingMessageIds.has(receivedMessage.id)) {
        console.log('Ignoring already processed message:', receivedMessage.id);
        return;
      }

      // Create a properly formatted message object
      const formattedMessage: IMessage = {
        $id: receivedMessage.id || `temp-${Date.now()}`,
        sender: { $id: receivedMessage.senderId },
        receiver: { $id: receivedMessage.receiverId },
        content: receivedMessage.content,
        createdAt: receivedMessage.timestamp || new Date().toISOString(),
        isRead: false,
      };

      // Only add the message if it's relevant to this conversation
      if (
        (formattedMessage.sender.$id === currentUserId &&
          formattedMessage.receiver.$id === conversationId) ||
        (formattedMessage.sender.$id === conversationId &&
          formattedMessage.receiver.$id === currentUserId)
      ) {
        // Add to socket messages
        setSocketMessages((prev) => {
          // Check if this message already exists
          const exists = prev.some(
            (msg) =>
              msg.$id === formattedMessage.$id ||
              (msg.content === formattedMessage.content &&
                msg.sender.$id === formattedMessage.sender.$id &&
                Math.abs(
                  new Date(msg.createdAt).getTime() -
                    new Date(formattedMessage.createdAt).getTime()
                ) < 5000)
          );

          if (exists) return prev;
          return [...prev, formattedMessage];
        });
      }
    };

    socket.on('receive_message', handleNewMessage);

    return () => {
      socket.off('receive_message', handleNewMessage);
    };
  }, [socket, currentUserId, conversationId, processingMessageIds]);

  // Combine Appwrite messages with Socket.io messages
  const combinedMessages = useMemo(() => {
    if (!messages?.documents) return [...socketMessages];

    // Create a Map to store messages by content+timestamp to catch duplicates
    const messageMap = new Map();

    // Process Appwrite messages first (they have priority)
    messages.documents.forEach((doc) => {
      const key = `${doc.sender.$id}-${doc.content}-${doc.createdAt.substring(0, 16)}`;
      messageMap.set(key, {
        $id: doc.$id,
        sender: doc.sender,
        receiver: doc.receiver,
        content: doc.content,
        createdAt: doc.createdAt,
        isRead: doc.isRead,
        attachmentUrl: doc.attachmentUrl,
        attachmentType: doc.attachmentType,
        _isOptimistic: doc._isOptimistic,
        _isError: doc._isError,
      });
    });

    // Add socket messages only if they don't exist in Appwrite messages
    socketMessages.forEach((msg) => {
      if (!msg.createdAt) return;

      // Create a matching key - truncate timestamp to reduce precision for comparison
      const key = `${msg.sender.$id}-${msg.content}-${msg.createdAt.substring(0, 16)}`;

      // Only add if not already in the map
      if (!messageMap.has(key)) {
        messageMap.set(key, msg);
      }
    });

    // Convert map values to array and sort
    return Array.from(messageMap.values()).sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [messages?.documents, socketMessages]);

  // Mark messages as read when conversation is opened
  useEffect(() => {
    if (conversationId && !isLoadingMessages) {
      markAsRead({
        conversationPartnerId: conversationId,
        userId: currentUserId,
      });
    }
  }, [conversationId, currentUserId, markAsRead, isLoadingMessages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (combinedMessages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [combinedMessages.length]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment(file);
    }
  };

  // Remove selected attachment
  const removeAttachment = () => {
    setAttachment(null);
  };

  // Send a message with fix for duplicate messages
  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !attachment) || isSending || isUploading) return;

    // Clear input immediately for better UX
    const messageContent =
      newMessage.trim() || (attachment ? 'Sent an attachment' : '');
    setNewMessage('');

    // Create a unique ID for this message
    const tempId = `temp-${Date.now()}`;

    // Add to processing set to prevent duplicates
    processingMessageIds.add(tempId);

    // Option 1: Socket.io-first approach
    // With this approach, we use Socket.io for immediate display,
    // and Appwrite only for persistence
    const socketMessageData = {
      id: tempId,
      senderId: currentUserId,
      receiverId: conversationId,
      content: messageContent,
      timestamp: new Date().toISOString(),
    };

    // Send via Socket.io for immediate delivery
    if (socket && isConnected) {
      socket.emit('send_message', socketMessageData);

      // We'll handle file attachments only in Appwrite for simplicity
      if (!attachment) {
        // If no attachment and socket is working, we don't need to send
        // the message through Appwrite immediately - just return
        requestAnimationFrame(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        });

        // But we do need to persist it to Appwrite eventually
        setTimeout(() => {
          // Send to Appwrite after a delay to ensure Socket.io has processed it
          sendAppwriteMessage({
            senderId: currentUserId,
            receiverId: conversationId,
            content: messageContent,
            attachmentUrl: null,
            attachmentType: null,
          });
        }, 500);

        return;
      }
    }

    // If we reach here, either:
    // 1. Socket.io failed to send
    // 2. There's an attachment to upload
    // So we send through Appwrite

    // Prepare message data for Appwrite
    const messageData: INewMessage = {
      senderId: currentUserId,
      receiverId: conversationId,
      content: messageContent,
      attachmentUrl: null,
      attachmentType: null,
    };

    // Handle attachment upload
    if (attachment) {
      setIsUploading(true);
      try {
        // Upload file to Appwrite
        const uploadedFile = await uploadFile(attachment);
        if (uploadedFile) {
          const fileUrl = getFilePreview(uploadedFile.$id);
          if (fileUrl) {
            messageData.attachmentUrl = fileUrl.toString();
            messageData.attachmentType = attachment.type.split('/')[0];
          }
        }
      } catch (error) {
        console.error('Error uploading attachment:', error);
      } finally {
        setAttachment(null);
        setIsUploading(false);
      }
    }

    // Send message to Appwrite
    sendAppwriteMessage(messageData);

    // Scroll to bottom
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  };

  // Handle Enter key press to send message
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className='flex flex-col h-full'>
      {/* Header with online status */}
      <div className='flex items-center p-4 border-b border-dark-4 bg-dark-2'>
        <button
          className='md:hidden mr-3 p-1 hover:bg-dark-3 rounded-full transition-colors'
          onClick={onBack}
          aria-label='Back'
        >
          <ArrowLeft size={20} className='text-light-2' />
        </button>

        <div className='relative'>
          <img
            src={
              conversation.imageUrl || '/assets/icons/profile-placeholder.svg'
            }
            alt={conversation.name}
            className='w-10 h-10 rounded-full object-cover border border-dark-4'
            onError={(e) => {
              e.currentTarget.src = '/assets/icons/profile-placeholder.svg';
            }}
          />

          {/* Online status indicator */}
          <div className='absolute bottom-0 right-0 border-2 border-dark-2 rounded-full'>
            <OnlineStatusIndicator userId={conversationId} />
          </div>
        </div>

        <div className='ml-3 overflow-hidden'>
          <h4 className='body-bold text-light-1 truncate'>
            {conversation.name}
          </h4>
          <div className='flex items-center'>
            <p className='text-xs text-light-3 mr-2'>
              @{conversation.username}
            </p>

            {/* Online/Offline text status */}
            <span
              className={`text-xs ${isOnline ? 'text-green-500' : 'text-light-3'}`}
            >
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div
        ref={messagesContainerRef}
        className='flex-1 p-4 overflow-y-auto bg-dark-2 custom-scrollbar'
        style={{ height: 'calc(100vh - 340px)', minHeight: '250px' }}
      >
        {isLoadingMessages ? (
          <div className='flex-center w-full h-full'>
            <Loader className='text-primary-500' />
          </div>
        ) : combinedMessages.length === 0 ? (
          <div className='flex-center w-full h-full text-light-3 flex-col gap-2'>
            <p>No messages yet. Say hello!</p>
            <div className='w-16 h-1 bg-dark-4 rounded-full mt-2'></div>
          </div>
        ) : (
          <div className='flex flex-col gap-3'>
            {combinedMessages.map((message) => {
              if (!message || !message.sender || !message.receiver) return null;

              const isOwnMessage = message.sender.$id === currentUserId;

              return (
                <MessageBubble
                  key={message.$id}
                  message={message}
                  isOwnMessage={isOwnMessage}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message input */}
      <div className='p-4 border-t border-dark-4 bg-dark-2'>
        {/* Attachment preview */}
        {attachment && (
          <div className='mb-3 relative inline-block'>
            <div className='relative rounded-lg overflow-hidden border border-dark-4'>
              {attachment.type.startsWith('image/') ? (
                <img
                  src={URL.createObjectURL(attachment)}
                  alt='Attachment'
                  className='h-24 object-cover rounded-lg'
                />
              ) : (
                <div className='bg-dark-3 h-20 w-40 flex items-center justify-center rounded-lg'>
                  <p className='text-xs text-light-3 text-center p-2 truncate max-w-full'>
                    {attachment.name}
                  </p>
                </div>
              )}
            </div>
            <button
              className='absolute -top-2 -right-2 bg-dark-4 rounded-full p-1 hover:bg-dark-3 transition-colors'
              onClick={removeAttachment}
              aria-label='Remove attachment'
            >
              <X size={14} className='text-light-2' />
            </button>
          </div>
        )}

        <div className='flex items-center gap-3'>
          {/* Attachment button */}
          <label className='cursor-pointer p-2 hover:bg-dark-3 rounded-full transition-colors'>
            <input
              type='file'
              className='hidden'
              onChange={handleFileChange}
              accept='image/*,video/*,audio/*'
              disabled={isSending || isUploading}
            />
            <Image size={20} className='text-light-3 hover:text-light-1' />
          </label>

          {/* Message input */}
          <Input
            type='text'
            placeholder='Type a message...'
            className='bg-dark-3 border-none focus-visible:ring-1 focus-visible:ring-primary-500 py-6 text-light-1'
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isSending || isUploading}
          />

          {/* Send button */}
          <Button
            variant='ghost'
            size='icon'
            className={`p-2 rounded-full ${
              isSending || isUploading || (!newMessage.trim() && !attachment)
                ? 'text-light-3'
                : 'text-primary-500 hover:text-primary-600 hover:bg-dark-3'
            }`}
            onClick={handleSendMessage}
            disabled={
              isSending || isUploading || (!newMessage.trim() && !attachment)
            }
          >
            {isSending || isUploading ? (
              <Loader size={20} className='animate-spin' />
            ) : (
              <Send size={20} />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Memoized MessageBubble component
const MessageBubble = memo(
  ({ message, isOwnMessage }: MessageBubbleProps) => {
    // Format time once to prevent recalculations
    const timeAgo = useMemo(() => {
      try {
        return formatDistanceToNow(new Date(message.createdAt), {
          addSuffix: true,
        });
      } catch (error) {
        return 'just now';
      }
    }, [message.createdAt]);

    // Handle optimistic and error states
    const isOptimistic = message._isOptimistic;
    const hasError = message._isError;

    return (
      <div
        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-1 message-bubble`}
      >
        <div
          className={`max-w-[75%] rounded-2xl px-4 py-3 ${
            isOwnMessage
              ? hasError
                ? 'bg-red-800 text-light-1 rounded-tr-none'
                : 'bg-primary-500 text-light-1 rounded-tr-none'
              : 'bg-dark-3 text-light-1 rounded-tl-none'
          }`}
        >
          {/* Attachment if present */}
          {message.attachmentUrl && message.attachmentType === 'image' && (
            <div className='mb-2 rounded-lg overflow-hidden'>
              <img
                src={message.attachmentUrl}
                alt='Attachment'
                className='max-h-60 w-full object-contain rounded-lg'
                loading='lazy'
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          {/* Message text */}
          {message.content && (
            <p className='text-sm whitespace-pre-wrap break-words'>
              {message.content}
              {isOptimistic && !hasError && (
                <span className='inline-block ml-1 opacity-70 text-xs'>
                  {' '}
                  (sending...)
                </span>
              )}
            </p>
          )}

          {/* Timestamp */}
          <p
            className={`text-xs mt-1 ${isOwnMessage ? 'text-light-2 opacity-80' : 'text-light-3'}`}
          >
            {timeAgo}
          </p>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Prevent unnecessary rerenders
    return (
      prevProps.message.$id === nextProps.message.$id &&
      prevProps.isOwnMessage === nextProps.isOwnMessage &&
      prevProps.message.isRead === nextProps.message.isRead &&
      prevProps.message._isOptimistic === nextProps.message._isOptimistic &&
      prevProps.message._isError === nextProps.message._isError
    );
  }
);

MessageBubble.displayName = 'MessageBubble';

export default memo(MessageChat);
