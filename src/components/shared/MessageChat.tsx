import { useState, useEffect, useRef, useMemo, memo } from 'react';
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
import { Models } from 'appwrite'; // Import Appwrite Models

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
    const conversationId = conversation.id;
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const wasEmptyRef = useRef<boolean>(true);

    // Enable real-time updates via the dedicated hook
    useMessagingRealtime(currentUserId, conversationId);

    // Fetch conversation messages with optimized settings
    const {
        data: messages,
        isLoading: isLoadingMessages,
    } = useGetConversation(currentUserId, conversationId);

    // Send message mutation
    const { mutate: sendMessage, isPending: isSending } = useSendMessage();

    // Mark messages as read mutation
    const { mutate: markAsRead } = useMarkMessagesAsRead();

    // Transform and memoize messages array to prevent unnecessary re-renders
    const sortedMessages = useMemo(() => {
        if (!messages?.documents) return [];

        // Create a shallow copy and properly cast documents to IMessage
        return [...messages.documents]
            .map((doc: Models.Document) => {
                // Cast the document to IMessage type
                return {
                    $id: doc.$id,
                    sender: doc.sender,
                    receiver: doc.receiver,
                    content: doc.content,
                    createdAt: doc.createdAt,
                    isRead: doc.isRead,
                    attachmentUrl: doc.attachmentUrl,
                    attachmentType: doc.attachmentType,
                    _isOptimistic: doc._isOptimistic,
                    _isError: doc._isError
                } as IMessage;
            })
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }, [messages?.documents]);

    // Mark messages as read when conversation is opened
    useEffect(() => {
        if (conversationId && !isLoadingMessages) {
            markAsRead({ conversationPartnerId: conversationId, userId: currentUserId });
        }
    }, [conversationId, currentUserId, markAsRead, isLoadingMessages]);

    // Improved scroll to bottom effect
    useEffect(() => {
        const hasMessages = sortedMessages.length > 0;

        // Only scroll if:
        // 1. We have messages AND
        // 2. Either we're just loading in (wasEmpty) OR a new message was added
        if (hasMessages && (wasEmptyRef.current || sortedMessages.length > (wasEmptyRef.current ? 0 : sortedMessages.length - 1))) {
            // Use requestAnimationFrame for smoother scrolling
            requestAnimationFrame(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: wasEmptyRef.current ? 'auto' : 'smooth' });
            });

            // Update our ref
            wasEmptyRef.current = false;
        }
    }, [sortedMessages.length]);

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

        // Clear input immediately for better UX
        const messageContent = newMessage.trim() || (attachment ? 'Sent an attachment' : '');
        setNewMessage('');

        // Prepare message data
        const messageData: INewMessage = {
            senderId: currentUserId,
            receiverId: conversationId,
            content: messageContent,
            attachmentUrl: null,
            attachmentType: null,
        };

        // Handle attachment upload
        if (attachment) {
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

                // Clear attachment
                setAttachment(null);
            } catch (error) {
                console.error('Error uploading attachment:', error);
                // Continue sending message without attachment if upload fails
            }
        }

        // Send message (optimistic UI updates handled in the query hook)
        sendMessage(messageData);

        // Scroll to bottom
        requestAnimationFrame(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        });
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
                {isLoadingMessages ? (
                    <div className="flex-center w-full h-full">
                        <Loader className="animate-spin text-primary-500" />
                    </div>
                ) : sortedMessages.length === 0 ? (
                    <div className="flex-center w-full h-full text-light-3 flex-col gap-2">
                        <p>No messages yet. Say hello!</p>
                        <div className="w-16 h-1 bg-dark-4 rounded-full mt-2"></div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {sortedMessages.map((message) => {
                            // Skip invalid messages
                            if (!message || !message.sender || !message.receiver) {
                                return null;
                            }

                            const messageId = message.$id;
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
    // Memoize time formatting to prevent recalculation on every render
    const timeAgo = useMemo(() => {
        try {
            return formatDistanceToNow(new Date(message.createdAt), { addSuffix: true });
        } catch (error) {
            return 'just now';
        }
    }, [message.createdAt]);

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
}, (prevProps, nextProps) => {
    // Custom comparison to prevent unnecessary rerenders
    return (
        prevProps.message.$id === nextProps.message.$id &&
        prevProps.isOwnMessage === nextProps.isOwnMessage &&
        prevProps.message.isRead === nextProps.message.isRead &&
        prevProps.message._isOptimistic === nextProps.message._isOptimistic &&
        prevProps.message._isError === nextProps.message._isError
    );
});

export default MessageChat;