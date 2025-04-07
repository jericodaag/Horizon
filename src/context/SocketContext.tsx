import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useUserContext } from './AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/react-query/queryKeys';
import { toast } from '@/components/ui/use-toast'; // Import toast functionality
import { useNavigate } from 'react-router-dom';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

interface SocketContextType {
  socket: Socket | null;
  onlineUsers: string[];
  isConnected: boolean;
  notificationCount: { [key: string]: number };
  totalUnreadMessages: number; // New: total count for badge
  clearNotifications: (conversationId: string) => void;
  latestMessages: { [userId: string]: any };
  trackSentMessage: (senderId: string, receiverId: string, content: string) => void;
  typingUsers: { [key: string]: boolean };
  setTyping: (senderId: string, receiverId: string, isTyping: boolean) => void;
  readReceipts: { [messageId: string]: boolean };
  markMessageAsRead: (messageId: string, senderId: string, receiverId: string) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  onlineUsers: [],
  isConnected: false,
  notificationCount: {},
  totalUnreadMessages: 0, // New: total count for badge
  clearNotifications: () => { },
  latestMessages: {},
  trackSentMessage: () => { },
  typingUsers: {},
  setTyping: () => { },
  readReceipts: {},
  markMessageAsRead: () => { }
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [notificationCount, setNotificationCount] = useState<{ [key: string]: number }>({});
  const [latestMessages, setLatestMessages] = useState<{ [userId: string]: any }>({});
  const [typingUsers, setTypingUsers] = useState<{ [key: string]: boolean }>({});
  const [readReceipts, setReadReceipts] = useState<{ [messageId: string]: boolean }>({});
  const { user, isAuthenticated } = useUserContext();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Calculate total unread messages for the badge
  const totalUnreadMessages = Object.values(notificationCount).reduce(
    (sum, count) => sum + count,
    0
  );

  const typingTimeoutRef = React.useRef<{ [key: string]: NodeJS.Timeout }>({});
  const reconnectTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const clearNotifications = useCallback((conversationId: string) => {
    setNotificationCount(prev => ({
      ...prev,
      [conversationId]: 0
    }));
  }, []);

  const updateConversationOrder = useCallback((partnerId: string, content: string, timestamp: string) => {
    if (!user.id) return;

    queryClient.setQueryData(
      [QUERY_KEYS.GET_USER_CONVERSATIONS, user.id],
      (oldData: any) => {
        if (!oldData) return oldData;

        const conversationIndex = oldData.findIndex((conv: any) =>
          (conv.user.$id === partnerId || conv.user.id === partnerId)
        );

        if (conversationIndex === -1) return oldData;

        const updatedConversations = [...oldData];
        const conversation = { ...updatedConversations[conversationIndex] };

        if (conversation.lastMessage) {
          conversation.lastMessage = {
            ...conversation.lastMessage,
            content,
            createdAt: timestamp
          };
        }

        updatedConversations.splice(conversationIndex, 1);
        updatedConversations.unshift(conversation);

        return updatedConversations;
      }
    );
  }, [queryClient, user.id]);

  const trackSentMessage = useCallback((receiverId: string, content: string) => {
    const timestamp = new Date().toISOString();

    setLatestMessages(prev => ({
      ...prev,
      [receiverId]: {
        content,
        timestamp
      }
    }));

    updateConversationOrder(receiverId, content, timestamp);
  }, [updateConversationOrder]);

  const setTyping = useCallback((senderId: string, receiverId: string, isTyping: boolean) => {
    if (!socket || !isConnected) return;

    const typingKey = `${senderId}-${receiverId}`;

    if (typingTimeoutRef.current[typingKey]) {
      clearTimeout(typingTimeoutRef.current[typingKey]);
    }

    socket.emit('typing', {
      senderId,
      receiverId,
      isTyping
    });

    if (isTyping) {
      typingTimeoutRef.current[typingKey] = setTimeout(() => {
        socket.emit('typing', {
          senderId,
          receiverId,
          isTyping: false
        });

        setTypingUsers(prev => ({
          ...prev,
          [typingKey]: false
        }));
      }, 3000);
    }
  }, [socket, isConnected]);

  const markMessageAsRead = useCallback((messageId: string, senderId: string, receiverId: string) => {
    if (!socket || !isConnected) return;

    socket.emit('message_read', {
      messageId,
      senderId,
      receiverId,
      timestamp: new Date().toISOString()
    });

    setReadReceipts(prev => ({
      ...prev,
      [messageId]: true
    }));
  }, [socket, isConnected]);

  // Show toast notification for new messages
  const showMessageNotification = useCallback((senderId: string, _content: string) => {
    toast({
      title: "New message",
      description: "Someone sent you a message",
      action: (
        <button
          onClick={() => navigate(`/messages`, { state: { initialConversation: { id: senderId } } })}
          className="bg-violet-500 text-white px-3 py-1.5 rounded-md text-xs hover:bg-violet-600 transition"
        >
          View
        </button>
      ),
    });
  }, [navigate]);

  useEffect(() => {
    if (isAuthenticated && user.id) {
      const newSocket = io(SOCKET_URL, {
        transports: ['polling'],
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        timeout: 20000,
        forceNew: true
      });

      setSocket(newSocket);

      newSocket.on('connect', () => {
        setIsConnected(true);
        newSocket.emit('identify', user.id);

        if (reconnectTimerRef.current) {
          clearTimeout(reconnectTimerRef.current);
          reconnectTimerRef.current = null;
        }
      });

      newSocket.on('connect_error', (_err) => {
        setIsConnected(false);
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
        setOnlineUsers([]);

        if (!reconnectTimerRef.current) {
          reconnectTimerRef.current = setTimeout(() => {
            newSocket.connect();
            reconnectTimerRef.current = null;
          }, 5000);
        }
      });

      newSocket.on('online_users', (data) => {
        setOnlineUsers(data.users);
      });

      newSocket.on('user_status', (data) => {
        if (data.status === 'online') {
          setOnlineUsers(prev => {
            if (!prev.includes(data.userId)) {
              return [...prev, data.userId];
            }
            return prev;
          });
        } else {
          setOnlineUsers(prev => prev.filter(id => id !== data.userId));
        }
      });

      newSocket.on('typing_update', (data) => {
        const typingKey = `${data.senderId}-${data.receiverId}`;
        setTypingUsers(prev => ({
          ...prev,
          [typingKey]: data.isTyping
        }));
      });

      newSocket.on('read_receipt', (data) => {
        setReadReceipts(prev => ({
          ...prev,
          [data.messageId]: true
        }));
      });

      newSocket.on('receive_message', (data) => {
        if (data.receiverId === user.id && data.senderId !== user.id) {
          setNotificationCount(prev => ({
            ...prev,
            [data.senderId]: (prev[data.senderId] || 0) + 1
          }));

          // Show notification for new message if it's not from current user
          showMessageNotification(data.senderId, data.content);
        }

        const messageUserId = data.senderId === user.id ? data.receiverId : data.senderId;
        setLatestMessages(prev => ({
          ...prev,
          [messageUserId]: {
            content: data.content,
            timestamp: data.timestamp
          }
        }));

        updateConversationOrder(
          data.senderId === user.id ? data.receiverId : data.senderId,
          data.content,
          data.timestamp
        );
      });

      return () => {
        Object.values(typingTimeoutRef.current).forEach(timeout => clearTimeout(timeout));
        typingTimeoutRef.current = {};

        if (reconnectTimerRef.current) {
          clearTimeout(reconnectTimerRef.current);
          reconnectTimerRef.current = null;
        }

        newSocket.disconnect();
        setSocket(null);
        setIsConnected(false);
      };
    }
  }, [isAuthenticated, user.id, updateConversationOrder, showMessageNotification]);

  return (
    <SocketContext.Provider value={{
      socket,
      onlineUsers,
      isConnected,
      notificationCount,
      totalUnreadMessages, // Add the total count
      clearNotifications,
      latestMessages,
      trackSentMessage,
      typingUsers,
      setTyping,
      readReceipts,
      markMessageAsRead
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);