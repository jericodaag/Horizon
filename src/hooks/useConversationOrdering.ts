import { useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/react-query/queryKeys';
import { useSocket } from '@/context/SocketContext';
import { IConversation } from '@/types';

interface MessageData {
  id?: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
}

export const useConversationOrdering = (userId: string) => {
  const queryClient = useQueryClient();
  const { socket, trackSentMessage } = useSocket();

  const updateConversationOrder = useCallback(
    (partnerId: string, content: string, timestamp: string) => {
      if (!userId) return;

      queryClient.setQueryData<IConversation[]>(
        [QUERY_KEYS.GET_USER_CONVERSATIONS, userId],
        (oldData) => {
          if (!oldData || !Array.isArray(oldData)) return oldData || [];

          const conversationIndex = oldData.findIndex((conv) => {
            const convUserId = conv.user.$id || conv.user.id;
            return convUserId === partnerId;
          });

          if (conversationIndex === -1) return oldData;

          const updatedConversations = [...oldData];
          const conversation = { ...updatedConversations[conversationIndex] };

          if (conversation.lastMessage) {
            conversation.lastMessage = {
              ...conversation.lastMessage,
              content,
              createdAt: timestamp,
            };
          }

          updatedConversations.splice(conversationIndex, 1);
          updatedConversations.unshift(conversation);

          return updatedConversations;
        }
      );
    },
    [queryClient, userId]
  );

  useEffect(() => {
    if (!socket || !userId) return;

    const handleNewMessage = (data: MessageData) => {
      if (data.senderId === userId || data.receiverId === userId) {
        const partnerId =
          data.senderId === userId ? data.receiverId : data.senderId;
        updateConversationOrder(partnerId, data.content, data.timestamp);
      }
    };

    socket.on('receive_message', handleNewMessage);

    return () => {
      socket.off('receive_message', handleNewMessage);
    };
  }, [socket, userId, updateConversationOrder]);

  const trackMessageAndUpdateOrder = useCallback(
    (senderId: string, receiverId: string, content: string) => {
      if (senderId === userId) {
        const timestamp = new Date().toISOString();
        updateConversationOrder(receiverId, content, timestamp);
        trackSentMessage(senderId, receiverId, content);
      }
    },
    [userId, trackSentMessage, updateConversationOrder]
  );

  return {
    updateConversationOrder,
    trackMessageAndUpdateOrder,
  };
};

export default useConversationOrdering;
