// src/hooks/useMessagingRealtime.ts
import { useEffect, useRef } from 'react';
import { client } from '@/lib/appwrite/config';
import { appwriteConfig } from '@/lib/appwrite/config';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/react-query/queryKeys';

/**
 * Custom hook for Appwrite real-time subscriptions with reliable reconnection
 * @param userId Current user's ID
 * @param activeConversationId ID of the current conversation partner (if any)
 * @returns Object containing subscription status
 */
export const useMessagingRealtime = (
  userId: string,
  activeConversationId?: string
) => {
  const queryClient = useQueryClient();
  const subscriptionRef = useRef<any>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelayMs = 2000;

  useEffect(() => {
    let isActive = true;
    const reconnectTimeoutId = useRef<NodeJS.Timeout | null>(null);

    const clearSubscription = () => {
      if (subscriptionRef.current) {
        try {
          subscriptionRef.current();
          subscriptionRef.current = null;
        } catch (error) {
          console.log('Error clearing subscription');
        }
      }

      if (reconnectTimeoutId.current) {
        clearTimeout(reconnectTimeoutId.current);
        reconnectTimeoutId.current = null;
      }
    };

    const setupSubscription = () => {
      try {
        // Clear existing subscription first
        clearSubscription();

        // Create new subscription
        subscriptionRef.current = client.subscribe(
          [
            `databases.${appwriteConfig.databaseId}.collections.${appwriteConfig.messagesCollectionId}.documents`,
          ],
          (response) => {
            if (!isActive) return;

            // Reset reconnect counter on successful message
            reconnectAttemptsRef.current = 0;

            // Handle new message events
            if (
              response.events.includes(
                'databases.*.collections.*.documents.create'
              )
            ) {
              const newMessage = response.payload as any;

              // Check if the message is relevant to the current user
              const isSender = newMessage.sender?.$id === userId;
              const isReceiver = newMessage.receiver?.$id === userId;

              if (isSender || isReceiver) {
                // Refresh user conversations list
                queryClient.invalidateQueries({
                  queryKey: [QUERY_KEYS.GET_USER_CONVERSATIONS, userId],
                });

                // If we're in an active conversation that this message belongs to,
                // also refresh the conversation messages
                if (activeConversationId) {
                  const conversationPartnerId = isSender
                    ? newMessage.receiver?.$id
                    : newMessage.sender?.$id;

                  if (conversationPartnerId === activeConversationId) {
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

            // Handle message updates (read status changes)
            if (
              response.events.includes(
                'databases.*.collections.*.documents.update'
              )
            ) {
              const updatedMessage = response.payload as any;

              // If the current user is involved in this message
              if (
                updatedMessage.sender?.$id === userId ||
                updatedMessage.receiver?.$id === userId
              ) {
                // Refresh conversations to update unread counts
                queryClient.invalidateQueries({
                  queryKey: [QUERY_KEYS.GET_USER_CONVERSATIONS, userId],
                });
              }
            }
          }
        );
      } catch (error) {
        // If subscription fails and we haven't exceeded max attempts, try again
        if (reconnectAttemptsRef.current < maxReconnectAttempts && isActive) {
          reconnectAttemptsRef.current += 1;

          reconnectTimeoutId.current = setTimeout(() => {
            if (isActive) {
              setupSubscription();
            }
          }, reconnectDelayMs * reconnectAttemptsRef.current);
        }
      }
    };

    // Initial setup
    if (userId) {
      setupSubscription();
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      isActive = false;
      clearSubscription();
    };
  }, [userId, activeConversationId, queryClient]);

  return {
    isSubscribed: !!subscriptionRef.current,
    reconnectAttempts: reconnectAttemptsRef.current,
  };
};
