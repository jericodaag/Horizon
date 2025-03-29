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
import { Loader, ArrowLeft, Send, Image, X, Phone, Video } from 'lucide-react';
import { uploadFile, getFilePreview } from '@/lib/appwrite/api';
import { IMessage, IUser, INewMessage } from '@/types';
import OnlineStatusIndicator from './OnlineStatusIndicator';
import { motion, AnimatePresence } from 'framer-motion';

interface MessageChatProps {
  conversation: IUser;
  currentUserId: string;
  onBack: () => void;
}

const MessageChat = ({
  conversation,
  currentUserId,
  onBack,
}: MessageChatProps) => {
  // State management code remains the same...
  const [newMessage, setNewMessage] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [socketMessages, setSocketMessages] = useState<IMessage[]>([]);
  const [processingMessageIds, setProcessingMessageIds] = useState(
    new Set<string>()
  );
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const conversationId = conversation.id;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastMessageLengthRef = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !attachment) || isSending || isUploading) return;

    const messageContent =
      newMessage.trim() || (attachment ? 'Sent an attachment' : '');
    setNewMessage('');

    const tempId = `temp-${Date.now()}`;
    setProcessingMessageIds((prev) => {
      const newSet = new Set(prev);
      newSet.add(tempId);
      return newSet;
    });

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
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
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

  // Determine if we should group messages by same sender
  const getMessageGroups = () => {
    // Don't group messages, treat each as individual for proper display
    return combinedMessages.map((message) => [message]);
  };

  const messageGroups = useMemo(() => getMessageGroups(), [combinedMessages]);

  // Find date separators for the chat
  const dateSeparators = useMemo(() => {
    const separators: Record<string, string> = {};

    if (combinedMessages.length === 0) return separators;

    combinedMessages.forEach((message) => {
      const date = new Date(message.createdAt);
      const dateString = date.toDateString();

      // Add a friendly date format (Today, Yesterday, or date)
      const today = new Date().toDateString();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toDateString();

      if (dateString === today) {
        separators[dateString] = 'Today';
      } else if (dateString === yesterdayString) {
        separators[dateString] = 'Yesterday';
      } else {
        separators[dateString] = new Intl.DateTimeFormat('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }).format(date);
      }
    });

    return separators;
  }, [combinedMessages]);

  return (
    <div className='flex flex-col h-full'>
      {/* Chat Header with Glassmorphism Effect */}
      <div className='sticky top-0 z-10 flex items-center p-4 border-b border-dark-4 bg-dark-2 bg-opacity-80 backdrop-blur-sm'>
        <button
          className='md:hidden mr-3 p-2 hover:bg-dark-3 rounded-full transition-all duration-200'
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
            className='w-10 h-10 rounded-full object-cover border-2 border-dark-4 ring-2 ring-offset-2 ring-offset-dark-2 ring-primary-500'
            onError={(e) => {
              e.currentTarget.src = '/assets/icons/profile-placeholder.svg';
            }}
          />

          <div className='absolute -bottom-1 -right-1 border-2 border-dark-2 rounded-full'>
            <OnlineStatusIndicator
              userId={conversationId}
              size='md'
              showAnimation={true}
            />
          </div>
        </div>

        <div className='ml-3 overflow-hidden'>
          <h4 className='font-semibold text-light-1 truncate'>
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

        {/* Action buttons */}
        <div className='ml-auto flex items-center gap-1'>
          <Button
            variant='ghost'
            size='icon'
            className='text-light-3 hover:text-light-1 hover:bg-dark-3 rounded-full'
          >
            <Phone size={18} />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className='text-light-3 hover:text-light-1 hover:bg-dark-3 rounded-full'
          >
            <Video size={18} />
          </Button>
        </div>
      </div>

      {/* Messages Area with subtle pattern background */}
      <div
        ref={messagesContainerRef}
        className='flex-1 p-4 overflow-y-auto bg-dark-2 custom-scrollbar relative'
        style={{ height: 'calc(100vh - 340px)', minHeight: '250px' }}
        onLoad={() => scrollToBottom()}
      >
        {/* Subtle pattern background */}
        <div className='absolute inset-0 opacity-5 pointer-events-none'>
          <svg width='100%' height='100%' className='absolute inset-0'>
            <pattern
              id='pattern-circles'
              x='0'
              y='0'
              width='40'
              height='40'
              patternUnits='userSpaceOnUse'
            >
              <circle
                id='pattern-circle'
                cx='20'
                cy='20'
                r='1'
                fill='#888'
              ></circle>
            </pattern>
            <rect
              id='rect'
              x='0'
              y='0'
              width='100%'
              height='100%'
              fill='url(#pattern-circles)'
            ></rect>
          </svg>
        </div>

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
          <div className='flex flex-col gap-1 relative z-1'>
            {/* Group messages by date */}
            {Object.entries(dateSeparators).map(([dateString, label], idx) => {
              // Only show date separator if it's the first message or date changes
              const shouldRenderDate =
                idx === 0 ||
                new Date(
                  combinedMessages[idx - 1]?.createdAt
                ).toDateString() !== dateString;

              return (
                shouldRenderDate && (
                  <div key={dateString} className='flex items-center my-4'>
                    <div className='flex-1 h-px bg-dark-4'></div>
                    <span className='px-3 text-xs font-medium text-light-3'>
                      {label}
                    </span>
                    <div className='flex-1 h-px bg-dark-4'></div>
                  </div>
                )
              );
            })}

            {/* Render messages in groups */}
            {messageGroups.map((group, groupIndex) => {
              const isOwnMessage = group[0].sender.$id === currentUserId;

              return (
                <div key={`group-${groupIndex}`} className='mb-1'>
                  <div
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    {/* Avatar - only show for received messages */}
                    {!isOwnMessage && (
                      <img
                        src={
                          conversation.imageUrl ||
                          '/assets/icons/profile-placeholder.svg'
                        }
                        alt={conversation.name}
                        className='w-8 h-8 rounded-full object-cover mt-1 mr-2 border border-dark-4'
                        onError={(e) => {
                          e.currentTarget.src =
                            '/assets/icons/profile-placeholder.svg';
                        }}
                      />
                    )}

                    <div className='flex flex-col space-y-1 max-w-[75%]'>
                      {group.map((message) => {
                        const isRead =
                          message.isRead || readReceipts[message.$id];
                        const isOptimistic = message._isOptimistic;
                        const hasError = message._isError;

                        const bubbleColor = isOwnMessage
                          ? hasError
                            ? 'bg-red-800 text-light-1'
                            : 'bg-primary-500 text-light-1'
                          : 'bg-dark-3 text-light-1';

                        const bubbleStyle = isOwnMessage
                          ? 'rounded-2xl rounded-tr-md'
                          : 'rounded-2xl rounded-tl-md';

                        return (
                          <motion.div
                            key={message.$id}
                            className={`px-4 py-2 ${bubbleStyle} ${bubbleColor} shadow-sm`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            {/* Attachment content if available */}
                            {message.attachmentUrl &&
                              message.attachmentType === 'image' && (
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

                            {/* Message text content */}
                            {message.content && (
                              <div className='text-sm whitespace-normal break-words'>
                                {message.content}
                                {isOptimistic && !hasError && (
                                  <span className='inline-block ml-1 opacity-70 text-xs'>
                                    {' '}
                                    (sending...)
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Footer with timestamp and read status */}
                            <div className='flex items-center justify-end gap-1 mt-1'>
                              <span
                                className={`text-xs ${isOwnMessage ? 'text-light-2 opacity-80' : 'text-light-3'}`}
                              >
                                {new Date(message.createdAt).toLocaleTimeString(
                                  [],
                                  {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  }
                                )}
                              </span>

                              {/* Read indicators (only for sent messages) */}
                              {isOwnMessage && (
                                <span className='ml-1'>
                                  {isOptimistic ? (
                                    <span className='inline-block w-3 h-3 rounded-full bg-gray-400 animate-pulse'></span>
                                  ) : hasError ? (
                                    <span className='text-red-500 text-xs'>
                                      !
                                    </span>
                                  ) : isRead ? (
                                    <svg
                                      className='w-3 h-3 text-blue-400'
                                      fill='none'
                                      strokeLinecap='round'
                                      strokeLinejoin='round'
                                      strokeWidth='2'
                                      viewBox='0 0 24 24'
                                      stroke='currentColor'
                                    >
                                      <path d='M5 13l4 4L19 7'></path>
                                    </svg>
                                  ) : (
                                    <svg
                                      className='w-3 h-3 text-light-3'
                                      fill='none'
                                      strokeLinecap='round'
                                      strokeLinejoin='round'
                                      strokeWidth='2'
                                      viewBox='0 0 24 24'
                                      stroke='currentColor'
                                    >
                                      <path d='M5 13l4 4L19 7'></path>
                                    </svg>
                                  )}
                                </span>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}

            <div className='h-2'></div>
            <div ref={messagesEndRef} />

            {/* Typing indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  className='flex justify-start mb-1'
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <div className='bg-dark-3 text-light-1 rounded-2xl rounded-tl-none px-4 py-2 shadow-md flex items-center'>
                    <div className='flex space-x-1 items-center'>
                      <motion.div
                        className='w-2 h-2 rounded-full bg-light-3'
                        animate={{ y: [0, -4, 0] }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          delay: 0,
                        }}
                      />
                      <motion.div
                        className='w-2 h-2 rounded-full bg-light-3'
                        animate={{ y: [0, -4, 0] }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          delay: 0.2,
                        }}
                      />
                      <motion.div
                        className='w-2 h-2 rounded-full bg-light-3'
                        animate={{ y: [0, -4, 0] }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          delay: 0.4,
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Input Area with Glassmorphism effect */}
      <div className='p-4 border-t border-dark-4 bg-dark-2 bg-opacity-90 backdrop-blur-sm'>
        {attachment && (
          <div className='mb-3 relative inline-block'>
            <div className='relative rounded-lg overflow-hidden border border-dark-4 shadow-md'>
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
              className='absolute -top-2 -right-2 bg-dark-4 rounded-full p-1 hover:bg-dark-3 transition-colors shadow-md'
              onClick={removeAttachment}
              aria-label='Remove attachment'
            >
              <X size={14} className='text-light-2' />
            </button>
          </div>
        )}

        <div className='flex items-center gap-2'>
          <label className='cursor-pointer p-2 hover:bg-dark-3 rounded-full transition-colors'>
            <input
              ref={fileInputRef}
              type='file'
              className='hidden'
              onChange={handleFileChange}
              accept='image/*,video/*,audio/*'
              disabled={isSending || isUploading}
            />
            <Image size={20} className='text-light-3 hover:text-light-1' />
          </label>

          <div className='relative flex-1'>
            <Input
              ref={inputRef}
              type='text'
              placeholder='Type a message...'
              className='bg-dark-3 border-none focus-visible:ring-1 focus-visible:ring-primary-500 rounded-xl py-6 text-light-1 shadow-inner pl-4 pr-4'
              value={newMessage}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={isSending || isUploading}
            />
          </div>

          <Button
            variant='ghost'
            className={`p-3 rounded-full ${
              newMessage.trim() || attachment
                ? 'bg-primary-500 text-white hover:bg-primary-600'
                : 'bg-dark-3 text-light-3'
            } transition-colors`}
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

export default memo(MessageChat);
