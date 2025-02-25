import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUserContext } from '@/context/AuthContext';
import { multiFormatDateString } from '@/lib/utils';
import { Models } from 'appwrite';
import { appwriteConfig, databases } from '@/lib/appwrite/config';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/react-query/queryKeys';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';
import { IComment } from '@/types';
import { ID, Query } from 'appwrite';

type CommentSectionProps = {
  postId: string;
};

// Interface for user data
interface UserData {
  $id: string;
  name: string;
  username: string;
  imageUrl: string;
}

// Interface for the user map
interface UserMap {
  [key: string]: UserData;
}

// We don't need a separate RawComment interface anymore

const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const { user } = useUserContext();
  const [commentText, setCommentText] = useState<string>('');
  const [comments, setComments] = useState<IComment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const queryClient = useQueryClient();

  // Extract user ID safely from potentially object or string
  const getUserId = (userIdData: any): string => {
    if (!userIdData) return '';

    // Handle if it's an object with $id
    if (typeof userIdData === 'object' && userIdData !== null) {
      if (userIdData.$id) return String(userIdData.$id);
      if (userIdData.id) return String(userIdData.id);
      // Try to stringify it if nothing else works
      return String(userIdData);
    }

    // If it's already a string, return it
    return String(userIdData);
  };

  // Fetch comments and user data
  const fetchComments = async (): Promise<void> => {
    try {
      setIsLoading(true);

      // Get comments for this post
      const commentsData = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.commentsCollectionId,
        [
          Query.equal('postId', [postId]),
          Query.orderDesc('$createdAt')
        ]
      );

      if (!commentsData || commentsData.documents.length === 0) {
        setComments([]);
        setIsLoading(false);
        return;
      }

      // Process comments - handle both object and string user IDs
      const processedComments = await Promise.all(
        commentsData.documents.map(async (document: Models.Document) => {
          try {
            // Extract the proper user ID from the userId field - handle it as any type
            const actualUserId = getUserId(document.userId);
            console.log(`Processing comment ${document.$id}, userId:`, document.userId, "extracted:", actualUserId);

            // Only try to fetch user if we have a valid ID
            if (actualUserId && actualUserId.length > 0) {
              try {
                const userData = await databases.getDocument(
                  appwriteConfig.databaseId,
                  appwriteConfig.userCollectionId,
                  actualUserId
                );

                return {
                  $id: document.$id,
                  userId: actualUserId,
                  postId: document.postId as string,
                  content: document.content as string,
                  createdAt: document.createdAt as string || document.$createdAt,
                  likes: document.likes as string[] || [],
                  user: {
                    $id: userData.$id,
                    name: userData.name as string,
                    username: userData.username as string,
                    imageUrl: userData.imageUrl as string,
                  }
                } as IComment;
              } catch (err) {
                console.error(`Failed to get user for ID ${actualUserId}:`, err);
                // Fallback to placeholder if user fetch fails
                return {
                  $id: document.$id,
                  userId: actualUserId,
                  postId: document.postId as string,
                  content: document.content as string,
                  createdAt: document.createdAt as string || document.$createdAt,
                  likes: document.likes as string[] || [],
                  user: {
                    $id: actualUserId,
                    name: 'User',
                    username: '',
                    imageUrl: '/assets/icons/profile-placeholder.svg',
                  }
                } as IComment;
              }
            } else {
              // Invalid user ID, use placeholder
              return {
                $id: document.$id,
                userId: 'unknown',
                postId: document.postId as string,
                content: document.content as string,
                createdAt: document.createdAt as string || document.$createdAt,
                likes: document.likes as string[] || [],
                user: {
                  $id: 'unknown',
                  name: 'Unknown User',
                  username: '',
                  imageUrl: '/assets/icons/profile-placeholder.svg',
                }
              } as IComment;
            }
          } catch (error) {
            console.error(`Error processing comment ${document.$id}:`, error);
            return null;
          }
        })
      );

      // Filter out any null comments (processing errors)
      const validComments = processedComments.filter((comment): comment is IComment => comment !== null);
      setComments(validComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId]);

  // Submit a new comment
  const handleSubmitComment = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setIsSubmitting(true);

      // Ensure user.id is a string
      const userId = String(user.id);
      console.log("Creating comment with userId:", userId, "Type:", typeof userId);

      // Create the comment
      await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.commentsCollectionId,
        ID.unique(),
        {
          postId,
          content: commentText.trim(),
          userId, // Using the string version
          createdAt: new Date().toISOString(),
          likes: [],
        }
      );

      // Clear input and refresh comments
      setCommentText('');
      fetchComments();

      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POST_COMMENTS, postId],
      });
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete a comment
  const handleDeleteComment = async (commentId: string): Promise<void> => {
    try {
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        appwriteConfig.commentsCollectionId,
        commentId
      );

      // Refresh the comments list
      fetchComments();

      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_POST_COMMENTS, postId],
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  return (
    <div className="w-full space-y-4 mt-6">
      {/* Comment Form */}
      <form onSubmit={handleSubmitComment} className="flex gap-3">
        <Link to={`/profile/${user.id}`}>
          <img
            src={user.imageUrl || '/assets/icons/profile-placeholder.svg'}
            alt="user profile"
            className="w-8 h-8 rounded-full object-cover"
          />
        </Link>
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            placeholder="Write a comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="flex-1 bg-dark-3 text-light-1 rounded-lg px-4 py-2.5 
                      focus:outline-none text-sm"
          />
          <Button
            type="submit"
            disabled={isSubmitting || !commentText.trim()}
            className="bg-primary-500 px-5 py-1.5 rounded-lg text-light-1 
                      hover:bg-primary-600 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              'Post'
            )}
          </Button>
        </div>
      </form>

      {/* Comments List */}
      <div className="mt-6 space-y-4">
        {isLoading ? (
          <div className="flex-center w-full">
            <Loader className="h-5 w-5 animate-spin" />
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.$id} className="flex gap-3 items-start">
              <Link to={`/profile/${comment.userId}`}>
                <img
                  src={comment.user?.imageUrl || '/assets/icons/profile-placeholder.svg'}
                  alt="user avatar"
                  className="w-8 h-8 rounded-full object-cover"
                />
              </Link>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <Link
                      to={`/profile/${comment.userId}`}
                      className="font-semibold text-light-1 hover:underline"
                    >
                      {comment.user?.name || 'User'}
                    </Link>
                    {comment.user?.username && (
                      <span className="text-light-3 text-sm ml-2">
                        @{comment.user.username}
                      </span>
                    )}
                  </div>
                  <span className="text-light-3 text-sm">
                    {multiFormatDateString(comment.createdAt)}
                  </span>
                </div>
                <p className="text-light-2 mt-1">{comment.content}</p>
                <div className="flex gap-4 mt-2">
                  <button type="button" className="text-light-3 hover:text-light-1 text-sm">
                    Like
                  </button>
                  <button type="button" className="text-light-3 hover:text-light-1 text-sm">
                    Reply
                  </button>
                  {user.id === comment.userId && (
                    <button
                      type="button"
                      onClick={() => handleDeleteComment(comment.$id)}
                      className="text-light-3 hover:text-red-500 text-sm"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-light-3 text-center py-6">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>
    </div>
  );
};

export default CommentSection;