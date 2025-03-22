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
  isRead: boolean;
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
  const [processingMessageIds] = useState(new Set<string>());
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const conversationId = conversation.id;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastMessageLengthRef = useRef(0);

  const {
    socket,
    isConnected,
    onlineUsers,
    clearNotifications,
    trackSentMessage,
    typingUsers,
    setTyping,
    readReceipts,
    markMessageAsRead,
  } = useSocket();

  const isOnline = onlineUsers.includes(conversationId);
  const isTyping = typingUsers[`${conversationId}-${currentUserId}`] || false;

  useMessagingRealtime(currentUserId, conversationId);

  const { data: messages, isLoading: isLoadingMessages } = useGetConversation(
    currentUserId,
    conversationId
  );

  const { mutate: sendAppwriteMessage, isPending: isSending } =
    useSendMessage();

  const { mutate: markAsRead } = useMarkMessagesAsRead();

  useEffect(() => {
    clearNotifications(conversationId);
  }, [conversationId, clearNotifications]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (receivedMessage: any) => {
      if (processingMessageIds.has(receivedMessage.id)) {
        return;
      }

      const formattedMessage: IMessage = {
        $id: receivedMessage.id || `temp-${Date.now()}`,
        sender: { $id: receivedMessage.senderId },
        receiver: { $id: receivedMessage.receiverId },
        content: receivedMessage.content,
        createdAt: receivedMessage.timestamp || new Date().toISOString(),
        isRead: false,
      };

      if (
        (formattedMessage.sender.$id === currentUserId &&
          formattedMessage.receiver.$id === conversationId) ||
        (formattedMessage.sender.$id === conversationId &&
          formattedMessage.receiver.$id === currentUserId)
      ) {
        setSocketMessages((prev) => {
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

          setShouldScrollToBottom(true);

          if (
            formattedMessage.sender.$id === conversationId &&
            formattedMessage.receiver.$id === currentUserId
          ) {
            setTimeout(() => {
              markMessageAsRead(
                formattedMessage.$id,
                formattedMessage.sender.$id,
                currentUserId
              );
            }, 1000);
          }

          return [...prev, formattedMessage];
        });
      }
    };

    socket.on('receive_message', handleNewMessage);

    return () => {
      socket.off('receive_message', handleNewMessage);
    };
  }, [
    socket,
    currentUserId,
    conversationId,
    processingMessageIds,
    markMessageAsRead,
  ]);

  const combinedMessages = useMemo(() => {
    if (!messages?.documents) return [...socketMessages];

    const messageMap = new Map();

    messages.documents.forEach((doc) => {
      const key = `${doc.sender.$id}-${doc.content}-${doc.createdAt.substring(0, 16)}`;
      messageMap.set(key, {
        $id: doc.$id,
        sender: doc.sender,
        receiver: doc.receiver,
        content: doc.content,
        createdAt: doc.createdAt,
        isRead: doc.isRead || readReceipts[doc.$id],
        attachmentUrl: doc.attachmentUrl,
        attachmentType: doc.attachmentType,
        _isOptimistic: doc._isOptimistic,
        _isError: doc._isError,
      });
    });

    socketMessages.forEach((msg) => {
      if (!msg.createdAt) return;

      const key = `${msg.sender.$id}-${msg.content}-${msg.createdAt.substring(0, 16)}`;

      if (!messageMap.has(key)) {
        messageMap.set(key, {
          ...msg,
          isRead: readReceipts[msg.$id] || msg.isRead,
        });
      }
    });

    const sortedMessages = Array.from(messageMap.values()).sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    sortedMessages.forEach((msg) => {
      if (
        msg.sender.$id === conversationId &&
        msg.receiver.$id === currentUserId &&
        !msg.isRead
      ) {
        markMessageAsRead(msg.$id, msg.sender.$id, currentUserId);
      }
    });

    if (
      sortedMessages.length > lastMessageLengthRef.current ||
      lastMessageLengthRef.current === 0
    ) {
      setShouldScrollToBottom(true);
      lastMessageLengthRef.current = sortedMessages.length;
    }

    return sortedMessages;
  }, [
    messages?.documents,
    socketMessages,
    readReceipts,
    conversationId,
    currentUserId,
    markMessageAsRead,
  ]);

  useEffect(() => {
    if (conversationId && !isLoadingMessages) {
      markAsRead({
        conversationPartnerId: conversationId,
        userId: currentUserId,
      });
    }
  }, [conversationId, currentUserId, markAsRead, isLoadingMessages]);

  // Scroll to bottom when messages load or when new messages arrive
  useEffect(() => {
    if (shouldScrollToBottom || isTyping) {
      scrollToBottom();
      setShouldScrollToBottom(false);
    }
  }, [combinedMessages.length, shouldScrollToBottom, isTyping]);

  // Always scroll to bottom when conversation is first loaded
  useEffect(() => {
    if (!isLoadingMessages && combinedMessages.length > 0) {
      // Short delay to ensure the DOM has updated
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [isLoadingMessages, conversationId]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (messagesContainerRef.current) {
      // Fallback if the end ref is not yet available
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachment(file);
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !attachment) || isSending || isUploading) return;

    const messageContent =
      newMessage.trim() || (attachment ? 'Sent an attachment' : '');
    setNewMessage('');

    const tempId = `temp-${Date.now()}`;
    processingMessageIds.add(tempId);

    const socketMessageData = {
      id: tempId,
      senderId: currentUserId,
      receiverId: conversationId,
      content: messageContent,
      timestamp: new Date().toISOString(),
    };

    if (socket && isConnected) {
      socket.emit('send_message', socketMessageData);
      trackSentMessage(currentUserId, conversationId, messageContent);

      setShouldScrollToBottom(true);

      if (!attachment) {
        setTimeout(() => {
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

    const messageData: INewMessage = {
      senderId: currentUserId,
      receiverId: conversationId,
      content: messageContent,
      attachmentUrl: null,
      attachmentType: null,
    };

    if (attachment) {
      setIsUploading(true);
      try {
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

    sendAppwriteMessage(messageData);
    setShouldScrollToBottom(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewMessage(value);

    if (socket && isConnected) {
      setTyping(currentUserId, conversationId, value.length > 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className='flex flex-col h-full'>
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

            <span
              className={`text-xs ${isOnline ? 'text-green-500' : 'text-light-3'}`}
            >
              {isTyping ? 'Typing...' : isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      <div
        ref={messagesContainerRef}
        className='flex-1 p-4 overflow-y-auto bg-dark-2 custom-scrollbar'
        style={{ height: 'calc(100vh - 340px)', minHeight: '250px' }}
        onLoad={() => scrollToBottom()}
      >
        {isLoadingMessages ? (
          <div className='flex-center w-full h-full'>
            <Loader className='text-primary-500 animate-spin' />
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
              const isRead =
                isOwnMessage && (message.isRead || !!readReceipts[message.$id]);

              return (
                <MessageBubble
                  key={message.$id}
                  message={message}
                  isOwnMessage={isOwnMessage}
                  isRead={isRead}
                />
              );
            })}

            <div className='h-2'></div>
            <div ref={messagesEndRef} />

            {isTyping && (
              <div className='flex justify-start mb-1'>
                <div className='bg-dark-3 text-light-1 rounded-2xl rounded-tl-none px-4 py-2'>
                  <div className='typing-indicator'>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className='p-4 border-t border-dark-4 bg-dark-2'>
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

          <Input
            ref={inputRef}
            type='text'
            placeholder='Type a message...'
            className='bg-dark-3 border-none focus-visible:ring-1 focus-visible:ring-primary-500 py-6 text-light-1'
            value={newMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isSending || isUploading}
          />

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

const MessageBubble = memo(
  ({ message, isOwnMessage }: MessageBubbleProps) => {
    const timeAgo = useMemo(() => {
      try {
        return formatDistanceToNow(new Date(message.createdAt), {
          addSuffix: true,
        });
      } catch (error) {
        return 'just now';
      }
    }, [message.createdAt]);

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
