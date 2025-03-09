import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useUserContext } from './AuthContext';

// Socket.io server URL
const SOCKET_URL = 'http://localhost:3001';

interface SocketContextType {
  socket: Socket | null;
  onlineUsers: string[];
  isConnected: boolean;
  notificationCount: { [key: string]: number };
  clearNotifications: (conversationId: string) => void;
  latestMessages: { [userId: string]: any };
  trackSentMessage: (
    senderId: string,
    receiverId: string,
    content: string
  ) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  onlineUsers: [],
  isConnected: false,
  notificationCount: {},
  clearNotifications: () => {},
  latestMessages: {},
  trackSentMessage: () => {},
});

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [notificationCount, setNotificationCount] = useState<{
    [key: string]: number;
  }>({});
  const [latestMessages, setLatestMessages] = useState<{
    [userId: string]: any;
  }>({});
  const { user, isAuthenticated } = useUserContext();

  // Reset notification counter for a specific conversation
  const clearNotifications = (conversationId: string) => {
    setNotificationCount((prev) => ({
      ...prev,
      [conversationId]: 0,
    }));
  };

  // Track outgoing messages to update conversation list
  const trackSentMessage = (
    senderId: string,
    receiverId: string,
    content: string
  ) => {
    setLatestMessages((prev) => ({
      ...prev,
      [receiverId]: {
        content,
        timestamp: new Date().toISOString(),
      },
    }));
  };

  useEffect(() => {
    // Only initialize socket when user is authenticated
    if (isAuthenticated && user.id) {
      console.log('Connecting to Socket.io...');

      // Create socket with reliable settings for reconnection
      const newSocket = io(SOCKET_URL, {
        transports: ['websocket'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      setSocket(newSocket);

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('Socket connected with ID:', newSocket.id);
        setIsConnected(true);

        // Identify this user to the server
        newSocket.emit('identify', user.id);
      });

      newSocket.on('connect_error', (err) => {
        console.error('Socket connection error:', err);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
        setOnlineUsers([]);
      });

      // Handle real-time user status updates
      newSocket.on('online_users', (data) => {
        console.log('Received online users:', data);
        setOnlineUsers(data.users);
      });

      newSocket.on('user_status', (data) => {
        console.log('User status update:', data);
        if (data.status === 'online') {
          setOnlineUsers((prev) => {
            if (!prev.includes(data.userId)) {
              return [...prev, data.userId];
            }
            return prev;
          });
        } else {
          setOnlineUsers((prev) => prev.filter((id) => id !== data.userId));
        }
      });

      // Handle incoming messages for notifications and conversation updates
      newSocket.on('receive_message', (data) => {
        // Track incoming messages for notification
        if (data.receiverId === user.id && data.senderId !== user.id) {
          setNotificationCount((prev) => ({
            ...prev,
            [data.senderId]: (prev[data.senderId] || 0) + 1,
          }));
        }

        // Track latest message for conversation list updates
        setLatestMessages((prev) => ({
          ...prev,
          [data.senderId === user.id ? data.receiverId : data.senderId]: {
            content: data.content,
            timestamp: data.timestamp,
          },
        }));
      });

      // Clean up on unmount
      return () => {
        console.log('Cleaning up socket connection...');
        newSocket.disconnect();
        setSocket(null);
        setIsConnected(false);
      };
    }
  }, [isAuthenticated, user.id]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        isConnected,
        notificationCount,
        clearNotifications,
        latestMessages,
        trackSentMessage,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
