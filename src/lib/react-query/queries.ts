import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { Query } from 'appwrite';
import { QUERY_KEYS } from '@/lib/react-query/queryKeys';
import {
  createUserAccount,
  signInAccount,
  getCurrentUser,
  signOutAccount,
  getUsers,
  createPost,
  getPostById,
  updatePost,
  getUserPosts,
  deletePost,
  likePost,
  getUserById,
  updateUser,
  getRecentPosts,
  getInfinitePosts,
  searchPosts,
  savePost,
  getSavedPosts,
  deleteSavedPost,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  isFollowing,
  getTopCreators,
  createComment,
  deleteComment,
  likeComment,
  sendMessage,
  getConversation,
  getUserConversations,
  markMessagesAsRead,
  getLikedPosts,
  createNotification,
  deleteNotification,
  markNotificationsAsRead,
  getUserNotifications,
} from '@/lib/appwrite/api';
import {
  INewPost,
  INewUser,
  IUpdatePost,
  IUpdateUser,
  INewComment,
  INewMessage,
  IConversation,
} from '@/types';
import { Models } from 'appwrite';
import { appwriteConfig, databases } from '../appwrite/config';
import { useSocket } from '@/context/SocketContext';
import { useUserContext } from '@/context/AuthContext';

// ============================================================
// AUTH QUERIES
// ============================================================

export const useCreateUserAccount = () => {
  return useMutation({
    mutationFn: (user: INewUser) => createUserAccount(user),
  });
};

export const useSignInAccount = () => {
  return useMutation({
    mutationFn: (user: { email: string; password: string }) =>
      signInAccount(user),
  });
};

export const useSignOutAccount = () => {
  return useMutation({
    mutationFn: signOutAccount,
  });
};

// ============================================================
// POST QUERIES
// ============================================================
export const useGetPosts = () => {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
    queryFn: ({ pageParam }) => getInfinitePosts({ pageParam }) as any,
    initialPageParam: null, // Add this line
    getNextPageParam: (lastPage: any) => {
      // If there's no data, there are no more pages.
      if (lastPage && lastPage.documents.length === 0) {
        return null;
      }

      // Use the $id of the last document as the cursor.
      const lastId = lastPage.documents[lastPage.documents.length - 1].$id;
      return lastId;
    },
  });
};

export const useSearchPosts = (searchTerm: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.SEARCH_POSTS, searchTerm],
    queryFn: () => searchPosts(searchTerm),
    enabled: !!searchTerm,
  });
};

export const useGetRecentPosts = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
    queryFn: getRecentPosts,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (post: INewPost) => createPost(post),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
    },
  });
};

export const useGetPostById = (postId?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_POST_BY_ID, postId],
    queryFn: () => getPostById(postId),
    enabled: !!postId,
  });
};

export const useGetUserPosts = (userId?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USER_POSTS, userId],
    queryFn: () => getUserPosts(userId),
    enabled: !!userId,
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (post: IUpdatePost) => updatePost(post),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id],
      });
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, imageId }: { postId?: string; imageId: string }) =>
      deletePost(postId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
    },
  });
};

export const useLikePost = () => {
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const { user } = useUserContext();

  return useMutation({
    mutationFn: ({
      postId,
      likesArray,
    }: {
      postId: string;
      likesArray: string[];
    }) => likePost(postId, likesArray),
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_LIKED_POSTS],
      });

      const isLiking = variables.likesArray.includes(user.id);

      if (isLiking && data?.creator && data.creator.$id !== user.id) {
        try {
          const newNotification = await createNotification({
            userId: data.creator.$id,
            actorId: user.id,
            type: 'like',
            postId: data.$id,
          });

          if (socket && newNotification) {
            socket.emit('send_notification', {
              type: 'like',
              userId: data.creator.$id,
              actorId: user.id,
              actorName: user.name,
              postId: data.$id,
              timestamp: new Date().toISOString(),
            });
          }
        } catch (error) {
          console.error('Failed to create like notification:', error);
        }
      }
    },
  });
};

export const useGetLikedPosts = (userId?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_LIKED_POSTS, userId],
    queryFn: () => getLikedPosts(userId),
    enabled: !!userId,
  });
};

export const useSavePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, postId }: { userId: string; postId: string }) =>
      savePost(userId, postId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
    },
  });
};

export const useDeleteSavedPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (savedRecordId: string) => deleteSavedPost(savedRecordId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POSTS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
    },
  });
};

export const useGetSavedPosts = (userId?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_SAVED_POSTS, userId],
    queryFn: () => getSavedPosts(userId),
    enabled: !!userId,
  });
};

// ============================================================
// USER QUERIES
// ============================================================

export const useGetCurrentUser = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_CURRENT_USER],
    queryFn: getCurrentUser,
  });
};

export const useGetUsers = (limit?: number) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USERS],
    queryFn: () => getUsers(limit),
  });
};

export const useGetUserById = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USER_BY_ID, userId],
    queryFn: () => getUserById(userId),
    enabled: !!userId,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user: IUpdateUser) => updateUser(user),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_BY_ID, data?.$id],
      });
    },
  });
};

export const useFollowUser = () => {
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const { user } = useUserContext();

  return useMutation({
    mutationFn: ({
      followerId,
      followingId,
    }: {
      followerId: string;
      followingId: string;
    }) => followUser(followerId, followingId),
    onSuccess: async (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_FOLLOWERS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_FOLLOWING],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });

      try {
        const newNotification = await createNotification({
          userId: variables.followingId,
          actorId: variables.followerId,
          type: 'follow',
        });

        if (socket && newNotification) {
          socket.emit('send_notification', {
            type: 'follow',
            userId: variables.followingId,
            actorId: user.id,
            actorName: user.name,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error('Failed to create follow notification:', error);
      }
    },
  });
};

export const useUnfollowUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      followerId,
      followingId,
    }: {
      followerId: string;
      followingId: string;
    }) => unfollowUser(followerId, followingId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_FOLLOWERS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_FOLLOWING],
      });
    },
  });
};

export const useGetFollowers = (userId: string) => {
  return useQuery<Models.Document[]>({
    queryKey: [QUERY_KEYS.GET_USER_FOLLOWERS, userId],
    queryFn: () => getFollowers(userId),
    enabled: !!userId,
    initialData: [],
  });
};

export const useGetFollowing = (userId: string) => {
  return useQuery<Models.Document[]>({
    queryKey: [QUERY_KEYS.GET_USER_FOLLOWING, userId],
    queryFn: () => getFollowing(userId),
    enabled: !!userId,
    initialData: [],
  });
};

export const useIsFollowing = (followerId: string, followingId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USER_FOLLOWERS, followerId, followingId],
    queryFn: () => isFollowing(followerId, followingId),
    enabled: !!followerId && !!followingId,
  });
};

export const useGetTopCreators = (limit: number = 6) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_TOP_CREATORS],
    queryFn: () => getTopCreators(limit),
    initialData: [],
  });
};

export const useGetPostComments = (postId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_POST_COMMENTS, postId],
    queryFn: async () => {
      if (!postId) return { documents: [] };

      const comments = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.commentsCollectionId,
        [Query.equal('postId', postId), Query.orderDesc('$createdAt')]
      );

      return comments;
    },
    enabled: !!postId,
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const { user } = useUserContext();

  return useMutation({
    mutationFn: (comment: INewComment) => createComment(comment),
    onSuccess: async (comment, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POST_COMMENTS, variables.postId],
      });

      try {
        // First, get the post data directly from Appwrite
        const post = await databases.getDocument(
          appwriteConfig.databaseId,
          appwriteConfig.postCollectionId,
          variables.postId
        );

        console.log('Post details for comment notification:', post);

        // Extract the creator ID correctly based on the database structure
        const creatorId =
          typeof post.creator === 'object' ? post.creator.$id : post.creator;

        // Skip notification if commenting on own post
        if (creatorId === user.id) {
          console.log(
            'User commenting on their own post - no notification needed'
          );
          return;
        }

        // Create notification
        const newNotification = await createNotification({
          userId: creatorId,
          actorId: user.id,
          type: 'comment',
          postId: variables.postId,
          commentId: comment.$id,
        });

        console.log('Notification created:', newNotification);

        // Emit socket event with all necessary fields including commentId
        if (socket && newNotification) {
          socket.emit('send_notification', {
            type: 'comment',
            userId: creatorId,
            actorId: user.id,
            actorName: user.name,
            postId: variables.postId,
            commentId: comment.$id,
            timestamp: new Date().toISOString(),
          });
          console.log('Socket notification emitted for comment');
        }
      } catch (error) {
        console.error('Failed to create comment notification:', error);
      }
    },
  });
};

// Delete a comment
export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commentId,
      postId,
    }: {
      commentId: string;
      postId: string;
    }) => {
      const status = await deleteComment(commentId);
      return { status, postId };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POST_COMMENTS, variables.postId],
      });
    },
  });
};

// Like/unlike a comment
export const useLikeComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commentId,
      likesArray,
      postId,
    }: {
      commentId: string;
      likesArray: string[];
      postId: string;
    }) => {
      const updatedComment = await likeComment(commentId, likesArray);
      return { updatedComment, postId };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POST_COMMENTS, variables.postId],
      });
    },
  });
};

// ============================================================
// MESSAGE QUERIES
// ============================================================
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageData: INewMessage) => sendMessage(messageData),

    onMutate: async (newMessage) => {
      await queryClient.cancelQueries({
        queryKey: [
          QUERY_KEYS.GET_CONVERSATION,
          newMessage.senderId,
          newMessage.receiverId,
        ],
      });

      const previousConversation = queryClient.getQueryData([
        QUERY_KEYS.GET_CONVERSATION,
        newMessage.senderId,
        newMessage.receiverId,
      ]);

      const optimisticMessage = {
        $id: 'temp-' + Date.now(),
        sender: { $id: newMessage.senderId },
        receiver: { $id: newMessage.receiverId },
        content: newMessage.content,
        createdAt: new Date().toISOString(),
        isRead: false,
        attachmentUrl: newMessage.attachmentUrl,
        attachmentType: newMessage.attachmentType,
        _isOptimistic: true,
      };

      queryClient.setQueryData(
        [
          QUERY_KEYS.GET_CONVERSATION,
          newMessage.senderId,
          newMessage.receiverId,
        ],
        (old: any) => {
          if (!old || !old.documents) return old;
          return {
            ...old,
            documents: [...old.documents, optimisticMessage],
          };
        }
      );

      return { previousConversation };
    },

    onError: (_err, newMessage, context) => {
      if (context) {
        queryClient.setQueryData(
          [
            QUERY_KEYS.GET_CONVERSATION,
            newMessage.senderId,
            newMessage.receiverId,
          ],
          context.previousConversation
        );
      }
    },

    onSuccess: (actualMessage, variables) => {
      queryClient.setQueryData(
        [QUERY_KEYS.GET_CONVERSATION, variables.senderId, variables.receiverId],
        (old: any) => {
          if (!old || !old.documents) return old;

          return {
            ...old,
            documents: old.documents.map((msg: any) =>
              msg._isOptimistic
                ? { ...actualMessage, _isOptimistic: false }
                : msg
            ),
          };
        }
      );
    },
  });
};

export const useGetUserConversations = (userId?: string) => {
  return useQuery<IConversation[]>({
    queryKey: [QUERY_KEYS.GET_USER_CONVERSATIONS, userId],
    queryFn: async () => {
      const data = await getUserConversations(userId || '');
      return data || [];
    },
    enabled: !!userId,
    staleTime: 10000,
    refetchOnWindowFocus: false,
  });
};

export const useGetConversation = (userOneId?: string, userTwoId?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_CONVERSATION, userOneId, userTwoId],
    queryFn: () => getConversation(userOneId || '', userTwoId || ''),
    enabled: !!userOneId && !!userTwoId,
    staleTime: 10000,
    refetchOnWindowFocus: false,
  });
};

export const useMarkMessagesAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: any) => markMessagesAsRead(params),

    onMutate: async (params) => {
      await queryClient.cancelQueries({
        queryKey: [
          QUERY_KEYS.GET_CONVERSATION,
          params.userId,
          params.conversationPartnerId,
        ],
      });

      const previousConversation = queryClient.getQueryData([
        QUERY_KEYS.GET_CONVERSATION,
        params.userId,
        params.conversationPartnerId,
      ]);

      queryClient.setQueryData(
        [
          QUERY_KEYS.GET_CONVERSATION,
          params.userId,
          params.conversationPartnerId,
        ],
        (old: any) => {
          if (!old || !old.documents) return old;

          return {
            ...old,
            documents: old.documents.map((message: any) => {
              if (
                message.sender?.$id === params.conversationPartnerId &&
                message.receiver?.$id === params.userId &&
                !message.isRead
              ) {
                return { ...message, isRead: true };
              }
              return message;
            }),
          };
        }
      );

      queryClient.setQueryData(
        [QUERY_KEYS.GET_USER_CONVERSATIONS, params.userId],
        (old: IConversation[] | undefined) => {
          if (!old) return old;

          return old.map((conversation) => {
            if (
              conversation.user.$id === params.conversationPartnerId ||
              conversation.user.id === params.conversationPartnerId
            ) {
              return {
                ...conversation,
                unreadCount: 0,
              };
            }
            return conversation;
          });
        }
      );

      return { previousConversation };
    },
  });
};

// ============================================================
// NOTIFICATION QUERIES
// ============================================================

export const useGetUserNotifications = (userId?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USER_NOTIFICATIONS, userId],
    queryFn: () => getUserNotifications(userId || ''),
    enabled: !!userId,
    staleTime: 10000,
    refetchOnWindowFocus: true,
  });
};

export const useMarkNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => markNotificationsAsRead(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_NOTIFICATIONS, userId],
      });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_NOTIFICATIONS],
      });
    },
  });
};
