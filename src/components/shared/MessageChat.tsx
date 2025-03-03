import { useState, useEffect, useRef } from 'react';
import {
    useGetConversation,
    useSendMessage,
    useMarkMessagesAsRead
} from '@/lib/react-query/queries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader, ArrowLeft, Send, Image, X } from 'lucide-react';
import { uploadFile, getFilePreview } from '@/lib/appwrite/api';
import { client } from '@/lib/appwrite/config';
import { formatDistanceToNow } from 'date-fns';
import { appwriteConfig } from '@/lib/appwrite/config';
import { useQueryClient } from '@tanstack/react-query';
import { IMessage, IUser, INewMessage } from '@/types';
import { Models } from 'appwrite';
import { useUserContext } from '@/context/AuthContext';

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
    const { user } = useUserContext();
    const [newMessage, setNewMessage] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);
    const conversationId = conversation.id;
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();

    // Fetch conversation messages
    const {
        data: messages,
        isLoading: isLoadingMessages,
        refetch: refetchMessages
    } = useGetConversation(currentUserId, conversationId);

    // Send message mutation
    const { mutate: sendMessage, isPending: isSending } = useSendMessage();

    // Mark messages as read mutation
    const { mutate: markAsRead } = useMarkMessagesAsRead();

    // Periodically refresh messages as a fallback for realtime
    useEffect(() => {
        const interval = setInterval(() => {
            refetchMessages();
        }, 10000); // Every 10 seconds

        return () => clearInterval(interval);
    }, [refetchMessages]);

    // Mark messages as read when conversation is opened
    useEffect(() => {
        if (conversationId) {
            markAsRead({ conversationPartnerId: conversationId, userId: currentUserId });
        }
    }, [conversationId, currentUserId, markAsRead]);

    // Improved scroll to bottom effect
    useEffect(() => {
        // Ensure we have messages and the ref exists
        if (messages?.documents?.length && messagesEndRef.current) {
            // Use a short timeout to ensure DOM has updated
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }, [messages?.documents?.length]);

    // Simple robust Appwrite realtime subscription
    useEffect(() => {
        let unsubscribe: any = null;

        const setupSubscription = () => {
            try {
                // Clear previous subscription if it exists
                if (unsubscribe) {
                    try {
                        unsubscribe();
                    } catch (e) {
                        // Ignore errors when cleaning up
                    }
                }

                // Set up new subscription
                unsubscribe = client.subscribe(
                    [`databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.messagesCollectionId}.documents`],
                    (response) => {
                        if (response.events.includes('databases.*.collections.*.documents.create')) {
                            const newMessage = response.payload as any;

                            // Check if message belongs to this conversation
                            const isRelevant =
                                (newMessage.sender?.$id === currentUserId && newMessage.receiver?.$id === conversationId) ||
                                (newMessage.sender?.$id === conversationId && newMessage.receiver?.$id === currentUserId);

                            if (isRelevant) {
                                // Force refresh messages
                                refetchMessages();

                                // Mark as read if needed
                                if (newMessage.sender?.$id === conversationId && newMessage.receiver?.$id === currentUserId) {
                                    markAsRead({
                                        conversationPartnerId: conversationId,
                                        userId: currentUserId
                                    });
                                }
                            }
                        }
                    }
                );
            } catch (error) {
                // If subscription fails, retry once after a short delay
                setTimeout(() => {
                    setupSubscription();
                }, 3000);
            }
        };

        // Initial setup
        setupSubscription();

        // Cleanup
        return () => {
            if (unsubscribe) {
                try {
                    unsubscribe();
                } catch (error) {
                    // Ignore cleanup errors
                }
            }
        };
    }, [conversationId, currentUserId, refetchMessages, markAsRead]);

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

    // Send message handler
    const handleSendMessage = async () => {
        if ((!newMessage.trim() && !attachment) || isSending) return;

        let attachmentUrl: string | undefined = undefined;
        let attachmentType: string | undefined = undefined;

        try {
            // Upload attachment if present
            if (attachment) {
                const uploadedFile = await uploadFile(attachment);
                if (uploadedFile) {
                    const fileUrl = getFilePreview(uploadedFile.$id);
                    if (fileUrl) {
                        attachmentUrl = fileUrl.toString();
                        attachmentType = attachment.type.split('/')[0];
                    }
                }
            }

            // Send message
            const messageData: INewMessage = {
                senderId: currentUserId,
                receiverId: conversationId,
                content: newMessage.trim() || (attachment ? 'Sent an attachment' : ''),
                attachmentUrl: attachmentUrl || null,
                attachmentType: attachmentType || null,
            };

            sendMessage(messageData, {
                onSuccess: () => {
                    // Clear form first
                    setNewMessage('');
                    setAttachment(null);

                    // Manually refresh after sending
                    setTimeout(() => {
                        refetchMessages();

                        // Make sure we scroll to the bottom
                        setTimeout(() => {
                            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                        }, 300);
                    }, 500);
                }
            });
        } catch (error) {
            // Handle errors silently
        }
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

            {/* Messages area with fixed layout */}
            <div
                ref={messagesContainerRef}
                className="flex-1 p-4 overflow-y-auto bg-dark-2 custom-scrollbar"
                style={{
                    height: 'calc(100vh - 340px)',
                    minHeight: '250px'
                }}
            >
                {isLoadingMessages ? (
                    <div className="flex items-center justify-center w-full h-full">
                        <Loader className="text-primary-500" />
                    </div>
                ) : !messages?.documents || messages.documents.length === 0 ? (
                    <div className="flex items-center justify-center w-full h-full text-light-3 flex-col gap-2">
                        <p>No messages yet. Say hello!</p>
                        <div className="w-16 h-1 bg-dark-4 rounded-full mt-2"></div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {messages.documents.map((document: Models.Document, index: number) => {
                            try {
                                // Convert Appwrite document to IMessage
                                const message = document as unknown as IMessage;

                                // Skip invalid messages
                                if (!message || !message.sender || !message.receiver) {
                                    return null;
                                }

                                return (
                                    <MessageBubble
                                        key={message.$id || `msg-${index}`}
                                        message={message}
                                        isOwnMessage={message.sender.$id === currentUserId}
                                    />
                                );
                            } catch (error) {
                                return null;
                            }
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

const MessageBubble = ({ message, isOwnMessage }: MessageBubbleProps) => {
    // Format the timestamp with error handling
    let timeAgo = 'recently';
    try {
        timeAgo = formatDistanceToNow(new Date(message.createdAt), { addSuffix: true });
    } catch (error) {
        // Use default if formatting fails
    }

    return (
        <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-1`}>
            <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${isOwnMessage
                    ? 'bg-primary-500 text-light-1 rounded-tr-none'
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
                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                )}

                {/* Timestamp */}
                <p className={`text-xs mt-1 ${isOwnMessage ? 'text-light-2 opacity-80' : 'text-light-3'}`}>
                    {timeAgo}
                </p>
            </div>
        </div>
    );
};

export default MessageChat;