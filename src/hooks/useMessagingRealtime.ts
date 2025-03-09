import { useEffect, useRef } from 'react';
import { client } from '@/lib/appwrite/config';
import { appwriteConfig } from '@/lib/appwrite/config';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/react-query/queryKeys';
import { markMessagesAsRead } from '@/lib/appwrite/api';

/**
 * Optimized hook for real-time messaging with Appwrite
 * Simplified subscription management and reconnection logic
 */
export const useMessagingRealtime = (
  userId: string,
  activeConversationId?: string
) => {
  const queryClient = useQueryClient();
  const subscriptionRef = useRef<(() => void) | null>(null);
  const isActive = useRef(true);

  useEffect(() => {
    if (!userId) return;

    isActive.current = true;

    // Clean up any existing subscription
    const cleanupSubscription = () => {
      if (subscriptionRef.current) {
        try {
          subscriptionRef.current();
          subscriptionRef.current = null;
        } catch (error) {
          console.log('Error clearing subscription');
        }
      }
    };

    // Set up subscription
    const setupSubscription = () => {
      cleanupSubscription();

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
                // Handle incoming message for the user
                if (
                  newMessage.receiver?.$id === userId &&
                  newMessage.sender?.$id !== userId
                ) {
                  // Update unread count in conversation list
                  queryClient.setQueryData(
                    [QUERY_KEYS.GET_USER_CONVERSATIONS, userId],
                    (old: any[] | undefined) => {
                      if (!old) return old;

                      return old.map((conversation) => {
                        if (
                          conversation.user?.$id === newMessage.sender?.$id ||
                          conversation.user?.id === newMessage.sender?.$id
                        ) {
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
                  // For messages the user sent, just update the conversations list
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
                    // Update conversation cache directly
                    queryClient.setQueryData(
                      [
                        QUERY_KEYS.GET_CONVERSATION,
                        userId,
                        activeConversationId,
                      ],
                      (old: any) => {
                        if (!old || !old.documents) return old;
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
                      markMessagesAsRead({
                        conversationPartnerId: activeConversationId,
                        userId: userId,
                      });
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
                    queryClient.setQueryData(
                      [
                        QUERY_KEYS.GET_CONVERSATION,
                        userId,
                        activeConversationId,
                      ],
                      (old: any) => {
                        if (!old || !old.documents) return old;
                        return {
                          ...old,
                          documents: old.documents.map((msg: any) =>
                            msg.$id === updatedMessage.$id
                              ? updatedMessage
                              : msg
                          ),
                        };
                      }
                    );
                  }
                }
              }
            }
          }
        );
      } catch (error) {
        console.error('Error setting up real-time subscription:', error);
        // Simple retry after 3 seconds
        setTimeout(() => {
          if (isActive.current) setupSubscription();
        }, 3000);
      }
    };

    setupSubscription();

    // Cleanup on unmount
    return () => {
      isActive.current = false;
      cleanupSubscription();
    };
  }, [userId, activeConversationId, queryClient]);

  return {
    isSubscribed: !!subscriptionRef.current,
  };
};
