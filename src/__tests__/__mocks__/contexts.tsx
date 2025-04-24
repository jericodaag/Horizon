import { mockCheckAuthUser } from './api';

// ============================================================
// AUTH CONTEXT MOCKS
// ============================================================

// Define the default authenticated user
const authenticatedUser = {
    id: 'user123',
    $id: 'user123',
    name: 'Test User',
    username: 'testuser',
    email: 'test@example.com',
    imageUrl: '/test-image.jpg',
    bio: 'This is a test bio'
};

// Define the empty user (not authenticated)
const emptyUser = {
    id: '',
    name: '',
    username: '',
    email: '',
    imageUrl: '',
    bio: '',
};

// Mock for authenticated state (default)
export const mockAuthContextAuthenticated = {
    user: authenticatedUser,
    isLoading: false,
    isAuthenticated: true,
    checkAuthUser: mockCheckAuthUser,
    setUser: jest.fn(),
    setIsAuthenticated: jest.fn()
};

// Mock for loading state
export const mockAuthContextLoading = {
    user: emptyUser,
    isLoading: true,
    isAuthenticated: false,
    checkAuthUser: mockCheckAuthUser,
    setUser: jest.fn(),
    setIsAuthenticated: jest.fn()
};

// Mock for not authenticated state
export const mockAuthContextNotAuthenticated = {
    user: emptyUser,
    isLoading: false,
    isAuthenticated: false,
    checkAuthUser: mockCheckAuthUser,
    setUser: jest.fn(),
    setIsAuthenticated: jest.fn()
};

// Default mock of the AuthContext
jest.mock('@/context/AuthContext', () => ({
    useUserContext: () => mockAuthContextAuthenticated,
    INITIAL_USER: emptyUser,
    AuthProvider: ({ children }) => children
}));

// ============================================================
// SOCKET CONTEXT MOCKS
// ============================================================

// Default online users
const defaultOnlineUsers = ['user2', 'user3'];

// Default notification counts
const defaultNotificationCount = { user2: 1, user3: 0 };

// Basic socket mock
const mockSocket = {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    disconnect: jest.fn(),
    connect: jest.fn()
};

// Default socket context state
export const mockSocketContextDefault = {
    socket: mockSocket,
    isConnected: true,
    onlineUsers: defaultOnlineUsers,
    notificationCount: defaultNotificationCount,
    totalUnreadMessages: 1,
    totalUnreadNotifications: 2,
    clearNotifications: jest.fn(),
    clearAllNotifications: jest.fn(),
    latestMessages: {},
    trackSentMessage: jest.fn(),
    typingUsers: {},
    setTyping: jest.fn(),
    readReceipts: {},
    markMessageAsRead: jest.fn()
};

// Socket context with disconnected state
export const mockSocketContextDisconnected = {
    ...mockSocketContextDefault,
    socket: null,
    isConnected: false,
    onlineUsers: [],
    totalUnreadMessages: 0,
    totalUnreadNotifications: 0
};

// Socket context with active typing
export const mockSocketContextTyping = {
    ...mockSocketContextDefault,
    typingUsers: { 'user123-user2': true }
};

// Default mock of the SocketContext
jest.mock('@/context/SocketContext', () => ({
    useSocket: () => mockSocketContextDefault,
    SocketProvider: ({ children }) => children
}));

// ============================================================
// HELPER FUNCTIONS
// ============================================================

// Helper to change the auth context state for testing
export const setMockAuthContext = (state = 'authenticated') => {
    let contextValue;

    switch (state) {
        case 'loading':
            contextValue = mockAuthContextLoading;
            break;
        case 'not-authenticated':
            contextValue = mockAuthContextNotAuthenticated;
            break;
        case 'authenticated':
        default:
            contextValue = mockAuthContextAuthenticated;
            break;
    }

    jest.spyOn(require('@/context/AuthContext'), 'useUserContext')
        .mockReturnValue(contextValue);

    return contextValue;
};

// Helper to change the socket context state for testing
export const setMockSocketContext = (state = 'connected') => {
    let contextValue;

    switch (state) {
        case 'disconnected':
            contextValue = mockSocketContextDisconnected;
            break;
        case 'typing':
            contextValue = mockSocketContextTyping;
            break;
        case 'connected':
        default:
            contextValue = mockSocketContextDefault;
            break;
    }

    jest.spyOn(require('@/context/SocketContext'), 'useSocket')
        .mockReturnValue(contextValue);

    return contextValue;
};

// Helper to create a custom socket context state for testing
export const createCustomMockSocketContext = (overrides = {}) => {
    const customContext = {
        ...mockSocketContextDefault,
        ...overrides
    };

    jest.spyOn(require('@/context/SocketContext'), 'useSocket')
        .mockReturnValue(customContext);

    return customContext;
};
