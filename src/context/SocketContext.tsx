import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useUserContext } from './AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/react-query/queryKeys';
import { useLocation } from 'react-router-dom';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

interface SocketContextType {
  socket: Socket | null;
  onlineUsers: string[];
  isConnected: boolean;
  notificationCount: { [key: string]: number };
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
  const location = useLocation();

  // Only enable sockets on the Messages page
  const isMessagesRoute = location.pathname === '/messages';

  const typingTimeoutRef = React.useRef<{ [key: string]: NodeJS.Timeout }>({});
  const reconnectTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const connectionAttemptsRef = React.useRef<number>(0);

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

  const trackSentMessage = useCallback((senderId: string, receiverId: string, content: string) => {
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

  // Connect to socket when the Messages page is open
  useEffect(() => {
    // Only attempt connection if on the messages route
    if (!isMessagesRoute || !isAuthenticated || !user.id) {
      // Cleanup existing socket if navigating away from messages
      if (socket) {
        console.log('Disconnecting socket - not on messages page');
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    console.log('Setting up socket connection - on messages page');
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnectionAttempts: 3,
      reconnectionDelay: 2000,
      timeout: 10000
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connected successfully');
      setIsConnected(true);
      connectionAttemptsRef.current = 0;
      newSocket.emit('identify', user.id);

      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    });

    newSocket.on('connect_error', (err) => {
      console.log('Socket connection error:', err.message);
      setIsConnected(false);
      connectionAttemptsRef.current += 1;

      // After 3 failed attempts, stop trying to reconnect
      if (connectionAttemptsRef.current >= 3) {
        console.log('Max connection attempts reached, stopping reconnection');
        newSocket.io.reconnection(false);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
      setOnlineUsers([]);

      // Only try to reconnect if we haven't exceeded the maximum attempts
      if (!reconnectTimerRef.current && connectionAttemptsRef.current < 3) {
        reconnectTimerRef.current = setTimeout(() => {
          console.log('Attempting to reconnect...');
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
      console.log('Cleaning up socket connection');
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
  }, [isMessagesRoute, isAuthenticated, user.id, updateConversationOrder]);

  return (
    <SocketContext.Provider value={{
      socket,
      onlineUsers,
      isConnected,
      notificationCount,
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