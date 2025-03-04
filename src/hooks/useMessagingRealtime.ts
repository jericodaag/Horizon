import { useEffect, useRef } from 'react';
import { client } from '@/lib/appwrite/config';
import { appwriteConfig } from '@/lib/appwrite/config';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/react-query/queryKeys';

/**
 * Unified hook for managing Appwrite real-time subscriptions for messages
 *
 * @param userId Current user's ID
 * @param activeConversationId Optional ID of the current conversation partner
 * @returns Object containing subscription status and metadata
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
      // Clear any existing subscription first
      if (subscriptionRef.current) {
        try {
          subscriptionRef.current();
          subscriptionRef.current = null;
        } catch (error) {
          console.log('Error clearing subscription');
        }
      }

      try {
        subscriptionRef.current = client.subscribe(
          [
            `databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.messagesCollectionId}.documents`,
          ],
          (response) => {
            if (!isActive.current) return;

            if (
              response.events.includes(
                'databases.*.collections.*.documents.create'
              )
            ) {
              const newMessage = response.payload as any;

              // Check if message is relevant to current user
              if (
                newMessage.sender?.$id === userId ||
                newMessage.receiver?.$id === userId
              ) {
                // More targeted query invalidation based on event type
                queryClient.invalidateQueries({
                  queryKey: [QUERY_KEYS.GET_USER_CONVERSATIONS, userId],
                  exact: false,
                });

                // Only refresh the active conversation if the message belongs to it
                if (activeConversationId) {
                  const conversationPartnerId =
                    newMessage.sender?.$id === userId
                      ? newMessage.receiver?.$id
                      : newMessage.sender?.$id;

                  if (conversationPartnerId === activeConversationId) {
                    queryClient.invalidateQueries({
                      queryKey: [
                        QUERY_KEYS.GET_CONVERSATION,
                        userId,
                        activeConversationId,
                      ],
                      exact: true,
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
};
