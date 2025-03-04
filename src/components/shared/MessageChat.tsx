import { useState, useEffect, useRef, memo } from 'react';
import {
    useGetConversation,
    useSendMessage,
    useMarkMessagesAsRead,
} from '@/lib/react-query/queries';
import { useMessagingRealtime } from '@/hooks/useMessagingRealtime';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader, ArrowLeft, Send, Image, X } from 'lucide-react';
import { uploadFile, getFilePreview } from '@/lib/appwrite/api';
import { formatDistanceToNow } from 'date-fns';
import { IMessage, IUser, INewMessage } from '@/types';

interface MessageChatProps {
    conversation: IUser;
    currentUserId: string;
    onBack: () => void;
}

interface MessageBubbleProps {
    message: IMessage;
    isOwnMessage: boolean;
}

const MessageChat = ({ conversation, currentUserId, onBack }: MessageChatProps) => {
    const [newMessage, setNewMessage] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);
    const [localMessages, setLocalMessages] = useState<IMessage[]>([]);
    const conversationId = conversation.id;
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    // Enable real-time updates specifically for this conversation
    useMessagingRealtime(currentUserId, conversationId);

    // Fetch conversation messages
    const {
        data: messages,
        isLoading: isLoadingMessages,
    } = useGetConversation(currentUserId, conversationId);

    // Send message mutation
    const { mutate: sendMessage, isPending: isSending } = useSendMessage();

    // Mark messages as read mutation
    const { mutate: markAsRead } = useMarkMessagesAsRead();

    // Update local messages when server data changes
    useEffect(() => {
        if (messages?.documents) {
            setLocalMessages(messages.documents as unknown as IMessage[]);
        }
    }, [messages?.documents]);

    // Mark messages as read when conversation is opened
    useEffect(() => {
        if (conversationId) {
            markAsRead({ conversationPartnerId: conversationId, userId: currentUserId });
        }
    }, [conversationId, currentUserId, markAsRead]);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [localMessages.length]);

    // Handle file attachment
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAttachment(file);
        }
    };

    const removeAttachment = () => {
        setAttachment(null);
    };

    // Optimized send message handler with instant UI updates
    const handleSendMessage = async () => {
        if ((!newMessage.trim() && !attachment) || isSending) return;

        // Create temporary message ID for optimistic updates
        const tempId = 'temp-' + Date.now();

        // Start with local message data
        const messageContent = newMessage.trim() || (attachment ? 'Sent an attachment' : '');

        // Clear input immediately for better UX
        setNewMessage('');

        // Create optimistic message object
        const optimisticMessage: IMessage = {
            $id: tempId,
            sender: { $id: currentUserId },
            receiver: { $id: conversationId },
            content: messageContent,
            createdAt: new Date().toISOString(),
            isRead: false,
            _isOptimistic: true
        } as IMessage;

        // Handle attachment upload and preview
        if (attachment) {
            try {
                // Show optimistic message with "uploading" state first
                setLocalMessages(prev => [...prev, optimisticMessage]);

                // Upload file to Appwrite
                const uploadedFile = await uploadFile(attachment);
                if (uploadedFile) {
                    const fileUrl = getFilePreview(uploadedFile.$id);
                    if (fileUrl) {
                        // Update optimistic message with attachment info
                        optimisticMessage.attachmentUrl = fileUrl.toString();
                        optimisticMessage.attachmentType = attachment.type.split('/')[0];

                        // Update local messages with attachment info
                        setLocalMessages(prev =>
                            prev.map(msg =>
                                msg.$id === tempId ? optimisticMessage : msg
                            )
                        );
                    }
                }

                // Clear attachment
                setAttachment(null);

                // Prepare final message data for sending to Appwrite
                const messageData: INewMessage = {
                    senderId: currentUserId,
                    receiverId: conversationId,
                    content: messageContent,
                    attachmentUrl: optimisticMessage.attachmentUrl || null,
                    attachmentType: optimisticMessage.attachmentType || null,
                };

                // Send message to Appwrite (optimistic UI is already showing)
                sendMessage(messageData);

            } catch (error) {
                console.error('Error uploading attachment:', error);
                // Show error state in UI
                setLocalMessages(prev =>
                    prev.map(msg =>
                        msg.$id === tempId ? { ...msg, content: 'Error sending message', _isError: true } : msg
                    )
                );
                setAttachment(null);
            }
        } else {
            // For text-only messages, update UI immediately
            setLocalMessages(prev => [...prev, optimisticMessage]);

            // Prepare message data
            const messageData: INewMessage = {
                senderId: currentUserId,
                receiverId: conversationId,
                content: messageContent,
                attachmentUrl: null,
                attachmentType: null,
            };

            // Send to Appwrite (optimistic UI is already showing)
            sendMessage(messageData);
        }

        // Scroll to bottom
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center p-4 border-b border-dark-4 shadow-sm bg-dark-2">
                <button
                    className="md:hidden mr-3 p-1 hover:bg-dark-3 rounded-full transition-colors"
                    onClick={onBack}
                    aria-label="Back to conversation list"
                >
                    <ArrowLeft size={20} className="text-light-2" />
                </button>

                <img
                    src={conversation.imageUrl || '/assets/icons/profile-placeholder.svg'}
                    alt={conversation.name}
                    className="w-10 h-10 rounded-full object-cover border border-dark-4"
                    onError={(e) => {
                        e.currentTarget.src = '/assets/icons/profile-placeholder.svg';
                    }}
                />

                <div className="ml-3 overflow-hidden">
                    <h4 className="body-bold text-light-1 truncate">{conversation.name}</h4>
                    <p className="text-xs text-light-3">@{conversation.username}</p>
                </div>
            </div>

            {/* Messages area */}
            <div
                ref={messagesContainerRef}
                className="flex-1 p-4 overflow-y-auto bg-dark-2 custom-scrollbar"
                style={{
                    height: 'calc(100vh - 340px)',
                    minHeight: '250px'
                }}
            >
                {isLoadingMessages && localMessages.length === 0 ? (
                    <div className="flex-center w-full h-full">
                        <Loader className="text-primary-500" />
                    </div>
                ) : localMessages.length === 0 ? (
                    <div className="flex-center w-full h-full text-light-3 flex-col gap-2">
                        <p>No messages yet. Say hello!</p>
                        <div className="w-16 h-1 bg-dark-4 rounded-full mt-2"></div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {localMessages
                            .slice() // Create a copy
                            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) // Sort chronologically
                            .map((message, index) => {
                                // Skip invalid messages
                                if (!message || !message.sender || !message.receiver) {
                                    return null;
                                }

                                const messageId = message.$id || `msg-${index}`;
                                const isOwnMessage = message.sender.$id === currentUserId;

                                return (
                                    <MessageBubble
                                        key={messageId}
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
            <div className="p-4 border-t border-dark-4 bg-dark-2">
                {/* Attachment preview */}
                {attachment && (
                    <div className="mb-3 relative inline-block">
                        <div className="relative rounded-lg overflow-hidden border border-dark-4">
                            {attachment.type.startsWith('image/') ? (
                                <img
                                    src={URL.createObjectURL(attachment)}
                                    alt="Attachment"
                                    className="h-24 object-cover rounded-lg"
                                />
                            ) : (
                                <div className="bg-dark-3 h-20 w-40 flex items-center justify-center rounded-lg">
                                    <p className="text-xs text-light-3 text-center p-2 truncate max-w-full">
                                        {attachment.name}
                                    </p>
                                </div>
                            )}
                        </div>
                        <button
                            className="absolute -top-2 -right-2 bg-dark-4 rounded-full p-1 hover:bg-dark-3 transition-colors"
                            onClick={removeAttachment}
                            aria-label="Remove attachment"
                        >
                            <X size={14} className="text-light-2" />
                        </button>
                    </div>
                )}

                <div className="flex items-center gap-3">
                    {/* Attachment button */}
                    <label className="cursor-pointer p-2 hover:bg-dark-3 rounded-full transition-colors">
                        <input
                            type="file"
                            className="hidden"
                            onChange={handleFileChange}
                            accept="image/*,video/*,audio/*"
                        />
                        <Image size={20} className="text-light-3 hover:text-light-1" />
                    </label>

                    {/* Message input */}
                    <Input
                        type="text"
                        placeholder="Type a message..."
                        className="bg-dark-3 border-none focus-visible:ring-1 focus-visible:ring-primary-500 py-6 text-light-1"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                            }
                        }}
                    />

                    {/* Send button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`p-2 rounded-full ${isSending || (!newMessage.trim() && !attachment)
                            ? 'text-light-3'
                            : 'text-primary-500 hover:text-primary-600 hover:bg-dark-3'
                            }`}
                        onClick={handleSendMessage}
                        disabled={isSending || (!newMessage.trim() && !attachment)}
                    >
                        <Send size={20} />
                    </Button>
                </div>
            </div>
        </div>
    );
};

// Memoize MessageBubble to prevent unnecessary re-renders
const MessageBubble = memo(({ message, isOwnMessage }: MessageBubbleProps) => {
    // Format the timestamp with error handling
    let timeAgo = 'just now';
    try {
        timeAgo = formatDistanceToNow(new Date(message.createdAt), { addSuffix: true });
    } catch (error) {
        // Use default if formatting fails
    }

    // Handle optimistic messages specially
    const isOptimistic = message._isOptimistic;
    const hasError = message._isError;

    return (
        <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-1 message-bubble`}>
            <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${isOwnMessage
                    ? hasError
                        ? 'bg-red-800 text-light-1 rounded-tr-none'
                        : 'bg-primary-500 text-light-1 rounded-tr-none'
                    : 'bg-dark-3 text-light-1 rounded-tl-none'
                    }`}
            >
                {/* Attachment if present */}
                {message.attachmentUrl && message.attachmentType === 'image' && (
                    <div className="mb-2 rounded-lg overflow-hidden">
                        <img
                            src={message.attachmentUrl}
                            alt="Attachment"
                            className="max-h-60 w-full object-contain rounded-lg"
                            loading="lazy"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                            }}
                        />
                    </div>
                )}

                {/* Message text */}
                {message.content && (
                    <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                        {isOptimistic && !hasError && (
                            <span className="inline-block ml-1 opacity-70 text-xs"> (sending...)</span>
                        )}
                    </p>
                )}

                {/* Timestamp */}
                <p className={`text-xs mt-1 ${isOwnMessage ? 'text-light-2 opacity-80' : 'text-light-3'}`}>
                    {timeAgo}
                </p>
            </div>
        </div>
    );
});

export default MessageChat;