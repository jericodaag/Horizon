// Export mock functions for auth
export const mockCreateUserAccount = jest.fn();
export const mockSignInAccount = jest.fn();
export const mockCheckAuthUser = jest.fn();
export const mockGetCurrentUser = jest.fn();
export const mockSignOutAccount = jest.fn();

// Export mock functions for posts
export const mockGetPosts = jest.fn().mockReturnValue({ data: null, isLoading: false });
export const mockGetPostById = jest.fn().mockReturnValue({ data: null, isLoading: false });
export const mockGetRecentPosts = jest.fn().mockReturnValue({ data: null, isPending: false });
export const mockCreatePost = jest.fn();
export const mockUpdatePost = jest.fn();
export const mockDeletePost = jest.fn().mockReturnValue({ mutate: jest.fn() });
export const mockLikePost = jest.fn();
export const mockSearchPosts = jest.fn().mockReturnValue({ data: null, isFetching: false });
export const mockGetUserPosts = jest.fn();
export const mockGetSavedPosts = jest.fn();
export const mockSavePost = jest.fn();
export const mockDeleteSavedPost = jest.fn();
export const mockGetLikedPosts = jest.fn();

// Export mock functions for users
export const mockGetUsers = jest.fn().mockReturnValue({ data: null, isLoading: false });
export const mockGetUserById = jest.fn();
export const mockUpdateUser = jest.fn().mockReturnValue({
    mutateAsync: jest.fn(),
    isPending: false
});

// Export mock functions for follows
export const mockFollowUser = jest.fn();
export const mockUnfollowUser = jest.fn();
export const mockGetFollowers = jest.fn().mockReturnValue([]);
export const mockGetFollowing = jest.fn().mockReturnValue([]);
export const mockIsFollowing = jest.fn().mockReturnValue({ data: false });
export const mockGetTopCreators = jest.fn().mockReturnValue([
    {
        $id: 'user1',
        name: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com',
        imageUrl: '/path/to/image1.jpg',
        bio: 'Developer',
        followerCount: 120,
    },
    {
        $id: 'user2',
        name: 'Jane Smith',
        username: 'janesmith',
        email: 'jane@example.com',
        imageUrl: '/path/to/image2.jpg',
        bio: 'Designer',
        followerCount: 85,
    },
    {
        $id: 'user3',
        name: 'Alex Johnson',
        username: 'alexj',
        email: 'alex@example.com',
        imageUrl: null,
        bio: 'Photographer',
        followerCount: 210,
    },
]);

// Export mock functions for comments
export const mockCreateComment = jest.fn();
export const mockGetPostComments = jest.fn();
export const mockDeleteComment = jest.fn();
export const mockLikeComment = jest.fn();

// Export mock functions for messages
export const mockSendMessage = jest.fn();
export const mockGetConversation = jest.fn();
export const mockGetUserConversations = jest.fn().mockReturnValue({ data: [] });
export const mockMarkMessagesAsRead = jest.fn();

// Export mock functions for notifications
export const mockCreateNotification = jest.fn();
export const mockGetUserNotifications = jest.fn();
export const mockMarkNotificationsAsRead = jest.fn();
export const mockDeleteNotification = jest.fn();

// Mock the react-query hooks
jest.mock('@/lib/react-query/queries', () => ({
    // Auth queries
    useCreateUserAccount: () => ({
        mutateAsync: mockCreateUserAccount,
        isPending: false
    }),
    useSignInAccount: () => ({
        mutateAsync: mockSignInAccount,
        isPending: false
    }),
    useSignOutAccount: () => ({
        mutate: mockSignOutAccount,
        isPending: false
    }),
    useGetCurrentUser: () => ({
        data: mockGetCurrentUser(),
        isLoading: false
    }),

    // Post queries
    useGetPosts: () => ({
        data: mockGetPosts().data,
        isLoading: mockGetPosts().isLoading,
        fetchNextPage: jest.fn(),
        hasNextPage: false
    }),
    useSearchPosts: () => ({
        data: mockSearchPosts().data,
        isFetching: mockSearchPosts().isFetching
    }),
    useGetRecentPosts: () => ({
        data: mockGetRecentPosts().data,
        isPending: mockGetRecentPosts().isPending,
        isLoading: mockGetRecentPosts().isPending
    }),
    useCreatePost: () => ({
        mutateAsync: mockCreatePost,
        isPending: false
    }),
    useGetPostById: () => ({
        data: mockGetPostById().data,
        isLoading: mockGetPostById().isLoading
    }),
    useUpdatePost: () => ({
        mutateAsync: mockUpdatePost,
        isPending: false
    }),
    useDeletePost: () => ({
        mutateAsync: mockDeletePost,
        isPending: false
    }),
    useLikePost: () => ({
        mutateAsync: mockLikePost,
        isPending: false
    }),
    useSavePost: () => ({
        mutateAsync: mockSavePost,
        isPending: false
    }),
    useDeleteSavedPost: () => ({
        mutateAsync: mockDeleteSavedPost,
        isPending: false
    }),
    useGetUserPosts: () => ({
        data: mockGetUserPosts(),
        isLoading: false
    }),
    useGetSavedPosts: () => ({
        data: mockGetSavedPosts(),
        isLoading: false
    }),
    useGetLikedPosts: () => ({
        data: mockGetLikedPosts(),
        isLoading: false
    }),

    // User queries
    useGetUsers: () => ({
        data: mockGetUsers().data,
        isLoading: mockGetUsers().isLoading
    }),
    useGetUserById: () => ({
        data: mockGetUserById(),
        isLoading: false
    }),
    useUpdateUser: () => ({
        mutateAsync: mockUpdateUser().mutateAsync,
        isPending: mockUpdateUser().isPending
    }),
    useFollowUser: () => ({
        mutate: mockFollowUser,
        isPending: false
    }),
    useUnfollowUser: () => ({
        mutate: mockUnfollowUser,
        isPending: false
    }),
    useGetFollowers: () => ({
        data: mockGetFollowers(),
        isLoading: false
    }),
    useGetFollowing: () => ({
        data: mockGetFollowing(),
        isLoading: false
    }),
    useIsFollowing: () => ({
        data: mockIsFollowing().data,
        isLoading: false
    }),
    useGetTopCreators: () => ({
        data: mockGetTopCreators(),
        isLoading: false
    }),

    // Comment queries
    useCreateComment: () => ({
        mutateAsync: mockCreateComment,
        isPending: false
    }),
    useGetPostComments: () => ({
        data: mockGetPostComments(),
        isLoading: false
    }),
    useDeleteComment: () => ({
        mutateAsync: mockDeleteComment,
        isPending: false
    }),
    useLikeComment: () => ({
        mutateAsync: mockLikeComment,
        isPending: false
    }),

    // Message queries
    useSendMessage: () => ({
        mutateAsync: mockSendMessage,
        isPending: false
    }),
    useGetConversation: () => ({
        data: mockGetConversation(),
        isLoading: false
    }),
    useGetUserConversations: () => ({
        data: mockGetUserConversations().data,
        isLoading: false
    }),
    useMarkMessagesAsRead: () => ({
        mutateAsync: mockMarkMessagesAsRead,
        isPending: false
    }),

    // Notification queries
    useCreateNotification: () => ({
        mutateAsync: mockCreateNotification,
        isPending: false
    }),
    useGetUserNotifications: () => ({
        data: mockGetUserNotifications(),
        isLoading: false
    }),
    useMarkNotificationsAsRead: () => ({
        mutate: mockMarkNotificationsAsRead,
        isPending: false
    }),
    useDeleteNotification: () => ({
        mutate: mockDeleteNotification,
        isPending: false
    })
}));

// Mock Appwrite API (to stop it from making actual API calls)
jest.mock('@/lib/appwrite/api', () => ({
    createUserAccount: mockCreateUserAccount,
    signInAccount: mockSignInAccount,
    getCurrentUser: mockGetCurrentUser,
    signOutAccount: mockSignOutAccount,
    createPost: mockCreatePost,
    getPostById: mockGetPostById,
    updatePost: mockUpdatePost,
    getUserPosts: mockGetUserPosts,
    deletePost: mockDeletePost,
    likePost: mockLikePost,
    getUserById: mockGetUserById,
    updateUser: mockUpdateUser,
    getRecentPosts: mockGetRecentPosts,
    getInfinitePosts: mockGetPosts,
    searchPosts: mockSearchPosts,
    savePost: mockSavePost,
    getSavedPosts: mockGetSavedPosts,
    deleteSavedPost: mockDeleteSavedPost,
    followUser: mockFollowUser,
    unfollowUser: mockUnfollowUser,
    getFollowers: mockGetFollowers,
    getFollowing: mockGetFollowing,
    isFollowing: mockIsFollowing,
    getTopCreators: mockGetTopCreators,
    createComment: mockCreateComment,
    deleteComment: mockDeleteComment,
    likeComment: mockLikeComment,
    sendMessage: mockSendMessage,
    getConversation: mockGetConversation,
    getUserConversations: mockGetUserConversations,
    markMessagesAsRead: mockMarkMessagesAsRead,
    getLikedPosts: mockGetLikedPosts,
    getUsers: mockGetUsers,
    createNotification: mockCreateNotification,
    deleteNotification: mockDeleteNotification,
    markNotificationsAsRead: mockMarkNotificationsAsRead,
    getUserNotifications: mockGetUserNotifications
}));

// Mock Appwrite config
jest.mock('@/lib/appwrite/config', () => ({
    appwriteConfig: {
        projectId: 'testProjectId',
        databaseId: 'testDatabaseId',
        storageId: 'testStorageId',
        userCollectionId: 'testUserCollectionId',
        postCollectionId: 'testPostCollectionId',
        savesCollectionId: 'testSavesCollectionId',
        followsCollectionId: 'testFollowsCollectionId',
        commentsCollectionId: 'testCommentsCollectionId',
        messagesCollectionId: 'testMessagesCollectionId',
        notificationsCollectionId: 'testNotificationsCollectionId'
    },
    client: {},
    account: {},
    databases: {
        listDocuments: jest.fn(),
        getDocument: jest.fn(),
        createDocument: jest.fn(),
        updateDocument: jest.fn(),
        deleteDocument: jest.fn()
    },
    storage: {
        createFile: jest.fn(),
        getFilePreview: jest.fn(),
        deleteFile: jest.fn()
    },
    avatars: {
        getInitials: jest.fn()
    }
}));