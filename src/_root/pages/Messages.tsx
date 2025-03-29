import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUserContext } from '@/context/AuthContext';
import {
  useGetUserConversations,
  useGetUsers,
} from '@/lib/react-query/queries';
import { Loader, PlusCircle, X, Search, MessageSquare } from 'lucide-react';
import ConversationList from '@/components/shared/ConversationList';
import MessageChat from '@/components/shared/MessageChat';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/react-query/queryKeys';
import { useLocation } from 'react-router-dom';
import { IUser } from '@/types';
import { getConversation } from '@/lib/appwrite/api';
import { motion, AnimatePresence } from 'framer-motion';
import OnlineStatusIndicator from '@/components/shared/OnlineStatusIndicator';

// Dialog components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Messages() {
  const { user } = useUserContext();
  const [selectedConversation, setSelectedConversation] =
    useState<IUser | null>(null);
  const queryClient = useQueryClient();
  const location = useLocation();
  const initialConversation = location.state?.initialConversation as any;

  // Dialog state
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch user's conversations with optimized settings
  const { data: conversations, isLoading: isLoadingConversations } =
    useGetUserConversations(user.id);

  // Fetch all users for new conversation dialog
  const { data: allUsers, isLoading: isLoadingUsers } = useGetUsers();

  // Handle mobile view toggle
  const [showChat, setShowChat] = useState(false);

  // Initialize with conversation from location state (if coming from profile)
  useEffect(() => {
    if (initialConversation && !selectedConversation) {
      const userForChat = convertToIUser(initialConversation);
      setSelectedConversation(userForChat);
      setShowChat(true);

      // Prefetch the conversation data
      queryClient.prefetchQuery({
        queryKey: [QUERY_KEYS.GET_CONVERSATION, user.id, userForChat.id],
        queryFn: () => getConversation(user.id, userForChat.id),
      });
    }
  }, [initialConversation, selectedConversation, user.id, queryClient]);

  // Helper function to convert conversation user to IUser format
  const convertToIUser = useCallback((conversationUser: any): IUser => {
    return {
      id: conversationUser.$id || conversationUser.id || '',
      name: conversationUser.name || '',
      username: conversationUser.username || '',
      email: conversationUser.email || '',
      imageUrl: conversationUser.imageUrl || '',
      bio: conversationUser.bio || '',
    };
  }, []);

  // Handle selecting a conversation
  const handleSelectConversation = useCallback(
    (conversationUser: any) => {
      const userForChat = convertToIUser(conversationUser);
      setSelectedConversation(userForChat);
      setShowChat(true);
    },
    [convertToIUser]
  );

  // Handle back button in mobile view
  const handleBackToList = useCallback(() => {
    setShowChat(false);
  }, []);

  // Handle starting a new chat
  const handleNewChat = useCallback(() => {
    setIsNewChatOpen(true);
    setSearchQuery('');
  }, []);

  // Filter users for new chat dialog
  const filteredUsers = useMemo(() => {
    if (!allUsers?.documents) return [];

    if (searchQuery.trim() === '') {
      return allUsers.documents.filter((userDoc) => userDoc.$id !== user.id);
    }

    const query = searchQuery.toLowerCase();
    return allUsers.documents.filter(
      (userDoc) =>
        userDoc.$id !== user.id &&
        (userDoc.name.toLowerCase().includes(query) ||
          userDoc.username.toLowerCase().includes(query))
    );
  }, [allUsers?.documents, searchQuery, user.id]);

  return (
    <div className='flex flex-1 items-center justify-center px-3 py-6 md:p-8 lg:p-10'>
      <div className='messages-container w-full max-w-6xl'>
        <div className='flex items-center justify-between w-full mb-5'>
          <h2 className='h3-bold md:h2-bold text-light-1'>Messages</h2>

          <Button
            variant='ghost'
            onClick={handleNewChat}
            className='flex items-center gap-2 bg-dark-3 hover:bg-dark-4 text-light-1 transition-all ml-auto'
          >
            <PlusCircle size={18} />
            <span className='hidden sm:inline'>New Chat</span>
          </Button>
        </div>

        <div className='w-full flex h-[calc(100vh-220px)] rounded-2xl overflow-hidden bg-dark-2 border border-dark-4 shadow-xl'>
          {/* Conversation List with modern styling */}
          <div
            className={`conversation-list flex-shrink-0 w-full md:w-96 border-r border-dark-4 ${showChat ? 'hidden md:block' : 'block'}`}
          >
            {/* Header */}
            <div className='p-4 border-b border-dark-4 bg-dark-3 bg-opacity-50 backdrop-blur-sm'>
              <h3 className='body-bold text-light-1 flex items-center'>
                <MessageSquare size={18} className='mr-2' />
                Your Conversations
              </h3>
            </div>

            {isLoadingConversations ? (
              <div className='flex-center w-full h-full'>
                <Loader className='text-primary-500 animate-spin' />
              </div>
            ) : (
              <div className='h-[calc(100vh-280px)] custom-scrollbar overflow-y-auto'>
                <ConversationList
                  conversations={conversations || []}
                  selectedId={selectedConversation?.id}
                  onSelectConversation={handleSelectConversation}
                  currentUserId={user.id}
                />
              </div>
            )}
          </div>

          {/* Chat Area with glassmorphism effects */}
          <div
            className={`message-chat flex-grow ${!showChat ? 'hidden md:block' : 'block'}`}
          >
            {selectedConversation ? (
              <MessageChat
                conversation={selectedConversation}
                currentUserId={user.id}
                onBack={handleBackToList}
              />
            ) : (
              <div className='flex-center w-full h-full text-light-3 flex-col gap-4'>
                <div className='w-20 h-20 bg-dark-3 rounded-full flex items-center justify-center mb-2'>
                  <MessageSquare
                    size={40}
                    className='text-light-3 opacity-70'
                  />
                </div>
                <p className='text-xl font-medium mb-1'>Your messages</p>
                <p className='text-light-4 mb-3 text-center max-w-sm'>
                  Select a conversation or start a new one to begin messaging
                </p>
                <Button
                  onClick={handleNewChat}
                  className='flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-light-1 py-2 px-6 rounded-lg transition-all shadow-md'
                >
                  <PlusCircle size={18} />
                  <span>New Message</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Chat Dialog with improved styling */}
      <Dialog open={isNewChatOpen} onOpenChange={setIsNewChatOpen}>
        <DialogContent className='bg-dark-2 text-light-1 border-dark-4 sm:max-w-md shadow-xl'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <PlusCircle size={18} className='text-primary-500' />
              New Message
            </DialogTitle>
          </DialogHeader>

          <div className='flex items-center gap-2 bg-dark-3 rounded-lg px-3 py-2 mb-4 border border-dark-4'>
            <Search size={18} className='text-light-3' />
            <Input
              type='text'
              placeholder='Search users...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-light-1 placeholder:text-light-3'
            />
            {searchQuery && (
              <Button
                variant='ghost'
                size='icon'
                className='h-7 w-7 p-1 text-light-3 hover:text-light-1 hover:bg-dark-4 rounded-full'
                onClick={() => setSearchQuery('')}
              >
                <X size={14} />
              </Button>
            )}
          </div>

          <div className='max-h-72 overflow-y-auto custom-scrollbar pr-1'>
            {isLoadingUsers ? (
              <div className='flex-center py-8'>
                <Loader size={24} className='text-light-3 animate-spin' />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className='flex flex-col items-center text-light-3 text-center py-8'>
                <Search size={32} className='mb-3 opacity-50' />
                <p>No users found</p>
                <p className='text-xs mt-1 text-light-4'>
                  Try a different search term
                </p>
              </div>
            ) : (
              <div className='flex flex-col gap-1'>
                <AnimatePresence>
                  {filteredUsers.map((userDoc, index) => (
                    <motion.button
                      key={userDoc.$id}
                      className='flex items-center gap-3 p-3 hover:bg-dark-3 rounded-lg transition-colors text-left'
                      onClick={() => {
                        handleSelectConversation(userDoc);
                        setIsNewChatOpen(false);
                      }}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <div className='relative'>
                        <img
                          src={
                            userDoc.imageUrl ||
                            '/assets/icons/profile-placeholder.svg'
                          }
                          alt={userDoc.name}
                          className='w-10 h-10 rounded-full object-cover border border-dark-4'
                          onError={(e) => {
                            e.currentTarget.src =
                              '/assets/icons/profile-placeholder.svg';
                          }}
                        />
                        <div className='absolute -bottom-1 -right-1'>
                          <OnlineStatusIndicator
                            userId={userDoc.$id}
                            size='sm'
                          />
                        </div>
                      </div>
                      <div>
                        <p className='body-bold text-light-1'>{userDoc.name}</p>
                        <p className='small-regular text-light-3'>
                          @{userDoc.username}
                        </p>
                      </div>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
