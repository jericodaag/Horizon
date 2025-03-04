import { useState, useEffect, useCallback } from 'react';
import { useUserContext } from '@/context/AuthContext';
import { useGetUserConversations, useGetUsers } from '@/lib/react-query/queries';
import { useMessagingRealtime } from '@/hooks/useMessagingRealtime';
import { Loader, PlusCircle, Search } from 'lucide-react';
import ConversationList from '@/components/shared/ConversationList';
import MessageChat from '@/components/shared/MessageChat';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/react-query/queryKeys';
import { useLocation } from 'react-router-dom';
import { IUser, IConversation } from '@/types';
// Dialog components
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const Messages = () => {
    const { user } = useUserContext();
    const [selectedConversation, setSelectedConversation] = useState<IUser | null>(null);
    const queryClient = useQueryClient();
    const location = useLocation();
    const initialConversation = location.state?.initialConversation as any;

    // Dialog state
    const [isNewChatOpen, setIsNewChatOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch user's conversations
    const {
        data: conversations,
        isLoading: isLoadingConversations,
    } = useGetUserConversations(user.id);

    // Fetch all users for new conversation dialog
    const { data: allUsers, isLoading: isLoadingUsers } = useGetUsers();

    // Enable real-time updates for the conversation list
    // This replaces the manual subscription setup in your current code
    useMessagingRealtime(user.id);

    // Initialize with conversation from location state (if coming from profile)
    useEffect(() => {
        if (initialConversation && !selectedConversation) {
            const userForChat = convertToIUser(initialConversation);
            setSelectedConversation(userForChat);
            setShowChat(true);
        }
    }, [initialConversation, selectedConversation]);

    // Handle mobile view toggle
    const [showChat, setShowChat] = useState(false);

    const convertToIUser = (conversationUser: any): IUser => {
        return {
            id: conversationUser.$id || conversationUser.id || "",
            name: conversationUser.name || "",
            username: conversationUser.username || "",
            email: conversationUser.email || "",
            imageUrl: conversationUser.imageUrl || "",
            bio: conversationUser.bio || ""
        };
    };

    const handleSelectConversation = (conversationUser: any) => {
        const userForChat = convertToIUser(conversationUser);
        setSelectedConversation(userForChat);
        setShowChat(true);
    };

    const handleBackToList = () => {
        setShowChat(false);
    };

    const handleNewChat = () => {
        setIsNewChatOpen(true);
        setSearchQuery('');
    };

    const filteredUsers = searchQuery.trim() !== ''
        ? allUsers?.documents.filter(userDoc =>
            userDoc.$id !== user.id &&
            (userDoc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                userDoc.username.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        : allUsers?.documents.filter(userDoc => userDoc.$id !== user.id);

    return (
        <div className="flex flex-1 items-center justify-center px-3 py-6 md:p-8 lg:p-10">
            <div className="messages-container w-full max-w-5xl">
                <h2 className="h3-bold md:h2-bold w-full mb-5">Messages</h2>
                <div className="w-full flex h-[calc(100vh-220px)] rounded-2xl overflow-hidden bg-dark-2 border border-dark-4">
                    {/* Conversation list - hidden on mobile when viewing a chat */}
                    <div className={`conversation-list flex-shrink-0 w-full md:w-80 border-r border-dark-4 ${showChat ? 'hidden md:block' : 'block'}`}>
                        {/* New conversation button */}
                        <div className="p-4 border-b border-dark-4 flex justify-between items-center">
                            <h3 className="body-bold">Conversations</h3>
                            <button
                                onClick={handleNewChat}
                                className="p-2 rounded-full hover:bg-dark-3 transition-colors"
                                aria-label="New message"
                            >
                                <PlusCircle size={20} className="text-light-2" />
                            </button>
                        </div>
                        {isLoadingConversations ? (
                            <div className="flex-center w-full h-full">
                                <Loader />
                            </div>
                        ) : (
                            <div className="h-[calc(100vh-280px)] custom-scrollbar overflow-y-auto">
                                <ConversationList
                                    conversations={conversations || []}
                                    selectedId={selectedConversation?.id}
                                    onSelectConversation={handleSelectConversation}
                                    currentUserId={user.id}
                                />
                            </div>
                        )}
                    </div>

                    {/* Message chat area - shown when a conversation is selected */}
                    <div className={`message-chat flex-grow ${!showChat ? 'hidden md:block' : 'block'}`}>
                        {selectedConversation ? (
                            <MessageChat
                                conversation={selectedConversation}
                                currentUserId={user.id}
                                onBack={handleBackToList}
                            />
                        ) : (
                            <div className="flex-center w-full h-full text-light-3 flex-col gap-4">
                                <p>Select a conversation or start a new one</p>
                                <button
                                    onClick={handleNewChat}
                                    className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-light-1 py-2 px-4 rounded-lg"
                                >
                                    <PlusCircle size={18} />
                                    <span>New Message</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* New Chat Dialog */}
            <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
                <DialogContent className="bg-dark-2 text-light-1 border-dark-4 sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>New Message</DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center gap-2 bg-dark-3 rounded-lg px-3 py-2 mb-4">
                        <Search size={18} className="text-light-3" />
                        <Input
                            type="text"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-light-1 placeholder:text-light-3"
                        />
                    </div>
                    <div className="max-h-72 overflow-y-auto custom-scrollbar pr-1">
                        {isLoadingUsers ? (
                            <div className="flex-center py-8">
                                <Loader size={24} className="text-light-3" />
                            </div>
                        ) : filteredUsers?.length === 0 ? (
                            <p className="text-light-3 text-center py-8">No users found</p>
                        ) : (
                            <div className="flex flex-col gap-1">
                                {filteredUsers?.map((userDoc) => (
                                    <button
                                        key={userDoc.$id}
                                        className="flex items-center gap-3 p-3 hover:bg-dark-3 rounded-lg transition-colors text-left"
                                        onClick={() => {
                                            handleSelectConversation(userDoc);
                                            setIsNewChatOpen(false);
                                        }}
                                    >
                                        <img
                                            src={userDoc.imageUrl || '/assets/icons/profile-placeholder.svg'}
                                            alt={userDoc.name}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                        <div>
                                            <p className="body-bold text-light-1">{userDoc.name}</p>
                                            <p className="small-regular text-light-3">@{userDoc.username}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Messages;