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
  MarkMessagesAsReadParams,
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
import { ID, Models } from 'appwrite';
import { appwriteConfig, client, databases } from '../appwrite/config';
import { useEffect } from 'react';

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
  return useMutation({
    mutationFn: ({
      postId,
      likesArray,
    }: {
      postId: string;
      likesArray: string[];
    }) => likePost(postId, likesArray),
    onSuccess: (data) => {
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
    },
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

// following
// Add these new queries to your queries.ts file
export const useFollowUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      followerId,
      followingId,
    }: {
      followerId: string;
      followingId: string;
    }) => followUser(followerId, followingId),
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

// Get Top creators
export const useGetTopCreators = (limit: number = 6) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_TOP_CREATORS],
    queryFn: () => getTopCreators(limit),
    initialData: [],
  });
};

// Get Comments
export const useGetPostComments = (postId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_POST_COMMENTS, postId],
    queryFn: async () => {
      if (!postId) return { documents: [] };

      // Get comments
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

// Create a comment (with support for GIFs)
export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (comment: INewComment) => createComment(comment),
    onSuccess: (_, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POST_COMMENTS, variables.postId],
      });
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

    // Add optimistic updates
    onMutate: async (newMessage) => {
      // Cancel outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({
        queryKey: [
          QUERY_KEYS.GET_CONVERSATION,
          newMessage.senderId,
          newMessage.receiverId,
        ],
      });

      // Get current conversation for potential rollback
      const previousConversation = queryClient.getQueryData([
        QUERY_KEYS.GET_CONVERSATION,
        newMessage.senderId,
        newMessage.receiverId,
      ]);

      // Get current conversation list for potential rollback
      const previousConversationList = queryClient.getQueryData([
        QUERY_KEYS.GET_USER_CONVERSATIONS,
        newMessage.senderId,
      ]);

      // Create optimistic message
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

      // Update conversation messages
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
            documents: [optimisticMessage, ...old.documents],
          };
        }
      );

      // Also update conversations list
      queryClient.setQueryData(
        [QUERY_KEYS.GET_USER_CONVERSATIONS, newMessage.senderId],
        (old: IConversation[] | undefined) => {
          if (!old) return old;

          const updatedConversations = [...old];
          const conversationIndex = updatedConversations.findIndex(
            (conv) =>
              conv.user.$id === newMessage.receiverId ||
              conv.user.id === newMessage.receiverId
          );

          if (conversationIndex >= 0) {
            // Update existing conversation
            updatedConversations[conversationIndex] = {
              ...updatedConversations[conversationIndex],
              lastMessage: optimisticMessage as any,
              unreadCount: 0, // Reset unread for sender's view
            };
          } else {
            // This is a new conversation, we might need user details here
            // In a complete implementation, we'd need to get user info separately
          }

          // Sort by latest message
          return updatedConversations.sort(
            (a, b) =>
              new Date(b.lastMessage.createdAt).getTime() -
              new Date(a.lastMessage.createdAt).getTime()
          );
        }
      );

      return { previousConversation, previousConversationList };
    },

    // If the mutation fails, roll back to the previous state
    onError: (err, newMessage, context) => {
      if (context) {
        queryClient.setQueryData(
          [
            QUERY_KEYS.GET_CONVERSATION,
            newMessage.senderId,
            newMessage.receiverId,
          ],
          context.previousConversation
        );

        queryClient.setQueryData(
          [QUERY_KEYS.GET_USER_CONVERSATIONS, newMessage.senderId],
          context.previousConversationList
        );
      }
    },

    // When the mutation succeeds, update with the actual data and clean up any optimistic records
    onSuccess: (actualMessage, variables) => {
      // Update conversation with actual message and remove optimistic flags
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

      // Also invalidate to ensure consistency
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_CONVERSATIONS, variables.senderId],
      });

      // We still invalidate to ensure data consistency, but the UI will already be updated
      queryClient.invalidateQueries({
        queryKey: [
          QUERY_KEYS.GET_CONVERSATION,
          variables.senderId,
          variables.receiverId,
        ],
      });
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
    refetchInterval: 15000, // Reduced from 30s to 15s for better fallback performance
    staleTime: 5000, // Consider data stale after 5 seconds (reduced from 10s)
    refetchOnWindowFocus: true, // Refresh when window regains focus
    retry: 3, // Retry failed requests
  });
};

export const useGetConversation = (userOneId?: string, userTwoId?: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_CONVERSATION, userOneId, userTwoId],
    queryFn: () => getConversation(userOneId || '', userTwoId || ''),
    enabled: !!userOneId && !!userTwoId,
    refetchInterval: 3000, // Reduce from 10000 to 3000 for more responsive updates
    staleTime: 1000, // Reduce stale time
    refetchOnWindowFocus: true,
    retry: 2, // Reduce retries for faster error recovery
  });
};

export const useMarkMessagesAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: MarkMessagesAsReadParams) =>
      markMessagesAsRead(params),

    // Add optimistic update for read status
    onMutate: async (params) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: [
          QUERY_KEYS.GET_CONVERSATION,
          params.userId,
          params.conversationPartnerId,
        ],
      });

      await queryClient.cancelQueries({
        queryKey: [QUERY_KEYS.GET_USER_CONVERSATIONS, params.userId],
      });

      // Save current state
      const previousConversation = queryClient.getQueryData([
        QUERY_KEYS.GET_CONVERSATION,
        params.userId,
        params.conversationPartnerId,
      ]);

      const previousConversationList = queryClient.getQueryData([
        QUERY_KEYS.GET_USER_CONVERSATIONS,
        params.userId,
      ]);

      // Optimistically update conversation messages as read
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

      // Update unread count in conversations list
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

      return { previousConversation, previousConversationList };
    },

    // If marking as read fails, restore previous state
    onError: (err, params, context) => {
      if (context) {
        queryClient.setQueryData(
          [
            QUERY_KEYS.GET_CONVERSATION,
            params.userId,
            params.conversationPartnerId,
          ],
          context.previousConversation
        );

        queryClient.setQueryData(
          [QUERY_KEYS.GET_USER_CONVERSATIONS, params.userId],
          context.previousConversationList
        );
      }
    },

    // On success, invalidate to ensure consistency
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_CONVERSATIONS, variables.userId],
      });
      queryClient.invalidateQueries({
        queryKey: [
          QUERY_KEYS.GET_CONVERSATION,
          variables.userId,
          variables.conversationPartnerId,
        ],
      });
    },
  });
};
