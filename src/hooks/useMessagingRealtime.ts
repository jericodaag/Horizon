import { useEffect, useRef } from 'react';
import { client } from '@/lib/appwrite/config';
import { appwriteConfig } from '@/lib/appwrite/config';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/react-query/queryKeys';
import { markMessagesAsRead } from '@/lib/appwrite/api';
import { IConversation } from '@/types';

/**
 * Unified hook for real-time messaging with Appwrite
 * Handles subscription, reconnection, and cache updates
 */
export const useMessagingRealtime = (
  userId: string,
  activeConversationId?: string
) => {
  const queryClient = useQueryClient();
  const subscriptionRef = useRef<(() => void) | null>(null);
  const isActive = useRef(true);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    isActive.current = true;

    const setupSubscription = () => {
      // Clear any existing subscription
      if (subscriptionRef.current) {
        try {
          subscriptionRef.current();
          subscriptionRef.current = null;
        } catch (error) {
          console.log('Error clearing subscription');
        }
      }

      try {
        // Subscribe to the messages collection
        subscriptionRef.current = client.subscribe(
          [
            `databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.messagesCollectionId}.documents`,
          ],
          (response) => {
            if (!isActive.current) return;

            // Handle new message creation
            if (
              response.events.includes(
                'databases.*.collections.*.documents.create'
              )
            ) {
              const newMessage = response.payload as any;

              // Process message if user is involved
              if (
                newMessage.sender?.$id === userId ||
                newMessage.receiver?.$id === userId
              ) {
                // If user received a message - update notification count
                if (
                  newMessage.receiver?.$id === userId &&
                  newMessage.sender?.$id !== userId
                ) {
                  // Update the conversation list with accurate unread count
                  queryClient.setQueryData(
                    [QUERY_KEYS.GET_USER_CONVERSATIONS, userId],
                    (old: IConversation[] | undefined) => {
                      if (!old) return old;

                      return old.map((conversation) => {
                        if (
                          conversation.user?.$id === newMessage.sender?.$id ||
                          conversation.user?.id === newMessage.sender?.$id
                        ) {
                          // Increment unread count by exactly 1 for each message
                          return {
                            ...conversation,
                            unreadCount: (conversation.unreadCount || 0) + 1,
                            lastMessage: newMessage,
                          };
                        }
                        return conversation;
                      });
                    }
                  );
                } else {
                  // Just update conversations list for messages the user sent
                  queryClient.invalidateQueries({
                    queryKey: [QUERY_KEYS.GET_USER_CONVERSATIONS, userId],
                  });
                }

                // Update active conversation if message belongs to it
                if (activeConversationId) {
                  const conversationPartnerId =
                    newMessage.sender?.$id === userId
                      ? newMessage.receiver?.$id
                      : newMessage.sender?.$id;

                  if (conversationPartnerId === activeConversationId) {
                    // Update the conversation cache directly for better performance
                    queryClient.setQueryData(
                      [
                        QUERY_KEYS.GET_CONVERSATION,
                        userId,
                        activeConversationId,
                      ],
                      (old: any) => {
                        if (!old || !old.documents) return old;

                        // Add the new message to the conversation
                        return {
                          ...old,
                          documents: [...old.documents, newMessage],
                        };
                      }
                    );

                    // Auto-mark received messages as read if conversation is open
                    if (
                      newMessage.receiver?.$id === userId &&
                      newMessage.sender?.$id === activeConversationId
                    ) {
                      setTimeout(() => {
                        if (isActive.current) {
                          markMessagesAsRead({
                            conversationPartnerId: activeConversationId,
                            userId: userId,
                          });
                        }
                      }, 500);
                    }
                  }
                }
              }
            }

            // Handle message updates (e.g., marking as read)
            if (
              response.events.includes(
                'databases.*.collections.*.documents.update'
              )
            ) {
              const updatedMessage = response.payload as any;

              if (
                updatedMessage.sender?.$id === userId ||
                updatedMessage.receiver?.$id === userId
              ) {
                // Update unread counts in conversation list
                queryClient.invalidateQueries({
                  queryKey: [QUERY_KEYS.GET_USER_CONVERSATIONS, userId],
                });

                // Update active conversation if relevant
                if (activeConversationId) {
                  const otherUserId =
                    updatedMessage.sender?.$id === userId
                      ? updatedMessage.receiver?.$id
                      : updatedMessage.sender?.$id;

                  if (otherUserId === activeConversationId) {
                    queryClient.invalidateQueries({
                      queryKey: [
                        QUERY_KEYS.GET_CONVERSATION,
                        userId,
                        activeConversationId,
                      ],
                    });
                  }
                }
              }
            }
          }
        );
      } catch (error) {
        console.error('Error setting up real-time subscription:', error);

        // Handle reconnection with backoff
        if (isActive.current && !reconnectTimerRef.current) {
          reconnectTimerRef.current = setTimeout(() => {
            reconnectTimerRef.current = null;
            if (isActive.current) setupSubscription();
          }, 2000);
        }
      }
    };

    if (userId) {
      setupSubscription();
    }

    // Cleanup on unmount
    return () => {
      isActive.current = false;

      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }

      if (subscriptionRef.current) {
        try {
          subscriptionRef.current();
          subscriptionRef.current = null;
        } catch (error) {
          console.log('Error clearing subscription on unmount');
        }
      }
    };
  }, [userId, activeConversationId, queryClient]);

  return {
    isSubscribed: !!subscriptionRef.current,
  };
};
