import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUserContext } from '@/context/AuthContext';
import { multiFormatDateString } from '@/lib/utils';
import { Models } from 'appwrite';
import { appwriteConfig, databases } from '@/lib/appwrite/config';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/react-query/queryKeys';
import { Button } from '@/components/ui/button';
import { Loader, X, SmilePlus } from 'lucide-react';
import { IComment } from '@/types';
import { ID, Query } from 'appwrite';
import GiphyPicker from './GiphyPicker';
import TranslateComment from './TranslateComment';

type CommentSectionProps = {
  postId: string;
};

const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const { user } = useUserContext();
  const [commentText, setCommentText] = useState<string>('');
  const [comments, setComments] = useState<IComment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const queryClient = useQueryClient();

  // GIF states
  const [showGiphyPicker, setShowGiphyPicker] = useState(false);
  const [selectedGif, setSelectedGif] = useState({ url: '', id: '' });

  // Extract user ID safely
  const getUserId = (userIdData: any): string => {
    if (!userIdData) return '';

    if (typeof userIdData === 'object' && userIdData !== null) {
      if (userIdData.$id) return String(userIdData.$id);
      if (userIdData.id) return String(userIdData.id);
      return String(userIdData);
    }

    return String(userIdData);
  };

  // Handler for GIF selection
  const handleGifSelect = (gifUrl: string, gifId: string) => {
    setSelectedGif({ url: gifUrl, id: gifId });
    setShowGiphyPicker(false);
  };

  // Fetch comments and user data
  const fetchComments = async (): Promise<void> => {
    try {
      setIsLoading(true);

      // Get comments for this post
      const commentsData = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.commentsCollectionId,
        [Query.equal('postId', [postId]), Query.orderDesc('$createdAt')]
      );

      if (!commentsData || commentsData.documents.length === 0) {
        setComments([]);
        setIsLoading(false);
        return;
      }

      // Process comments
      const processedComments = await Promise.all(
        commentsData.documents.map(async (document: Models.Document) => {
          try {
            const actualUserId = getUserId(document.userId);

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
                  createdAt:
                    (document.createdAt as string) || document.$createdAt,
                  likes: (document.likes as string[]) || [],
                  gifUrl: (document.gifUrl as string) || null,
                  gifId: (document.gifId as string) || null,
                  user: {
                    $id: userData.$id,
                    name: userData.name as string,
                    username: userData.username as string,
                    imageUrl: userData.imageUrl as string,
                  },
                } as IComment;
              } catch (err) {
                // Fallback to placeholder if user fetch fails
                return {
                  $id: document.$id,
                  userId: actualUserId,
                  postId: document.postId as string,
                  content: document.content as string,
                  createdAt:
                    (document.createdAt as string) || document.$createdAt,
                  likes: (document.likes as string[]) || [],
                  gifUrl: (document.gifUrl as string) || null,
                  gifId: (document.gifId as string) || null,
                  user: {
                    $id: actualUserId,
                    name: 'User',
                    username: '',
                    imageUrl: '/assets/icons/profile-placeholder.svg',
                  },
                } as IComment;
              }
            } else {
              // Invalid user ID, use placeholder
              return {
                $id: document.$id,
                userId: 'unknown',
                postId: document.postId as string,
                content: document.content as string,
                createdAt:
                  (document.createdAt as string) || document.$createdAt,
                likes: (document.likes as string[]) || [],
                gifUrl: (document.gifUrl as string) || null,
                gifId: (document.gifId as string) || null,
                user: {
                  $id: 'unknown',
                  name: 'Unknown User',
                  username: '',
                  imageUrl: '/assets/icons/profile-placeholder.svg',
                },
              } as IComment;
            }
          } catch (error) {
            return null;
          }
        })
      );

      // Filter out any null comments (processing errors)
      const validComments = processedComments.filter(
        (comment): comment is IComment => comment !== null
      );
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
    e.stopPropagation();

    // Need either text or GIF to submit a comment
    if (!commentText.trim() && !selectedGif.url) return;

    try {
      setIsSubmitting(true);

      // Ensure user.id is a string
      const userId = String(user.id);

      // Create the comment
      await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.commentsCollectionId,
        ID.unique(),
        {
          postId,
          content: commentText.trim(),
          userId,
          createdAt: new Date().toISOString(),
          likes: [],
          gifUrl: selectedGif.url || null,
          gifId: selectedGif.id || null,
        }
      );

      // Clear input and refresh comments
      setCommentText('');
      setSelectedGif({ url: '', id: '' });
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
    <div className='comment-section-wrapper w-full mt-2'>
      {/* Comment Form */}
      <form onSubmit={handleSubmitComment} className='flex flex-col gap-2 mb-3'>
        <div className='flex gap-1'>
          <div className='flex-1 flex gap-1'>
            <input
              type='text'
              placeholder='Write a comment...'
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className='flex-1 bg-dark-3 text-light-1 rounded-lg px-3 py-2 
                      focus:outline-none text-sm h-9'
            />
            <Button
              type='button'
              onClick={() => setShowGiphyPicker(!showGiphyPicker)}
              className='bg-dark-3 rounded-lg hover:bg-dark-4 px-2 h-9'
              title='Add a GIF'
            >
              <SmilePlus className='h-4 w-4 text-primary-500' />
            </Button>
            <Button
              type='submit'
              disabled={
                isSubmitting || (!commentText.trim() && !selectedGif.url)
              }
              className='bg-primary-500 rounded-lg text-light-1 
                      hover:bg-primary-600 disabled:opacity-50 px-3 h-9'
            >
              {isSubmitting ? (
                <Loader className='w-3 h-3 animate-spin' />
              ) : (
                'Post'
              )}
            </Button>
          </div>
        </div>

        {/* GIF preview if selected */}
        {selectedGif.url && (
          <div className='relative'>
            <div className='bg-dark-3 p-1.5 rounded-lg'>
              <img
                src={selectedGif.url}
                alt='Selected GIF'
                className='max-h-32 rounded-lg object-contain'
              />
              <Button
                type='button'
                variant='destructive'
                size='icon'
                className='absolute top-1 right-1 h-5 w-5 rounded-full bg-dark-4'
                onClick={() => setSelectedGif({ url: '', id: '' })}
              >
                <X className='h-3 w-3' />
              </Button>
            </div>
          </div>
        )}

        {/* GIF Picker */}
        {showGiphyPicker && (
          <div className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center overflow-auto'>
            <div className='relative max-h-screen overflow-auto py-6'>
              <GiphyPicker
                onGifSelect={handleGifSelect}
                onClose={() => setShowGiphyPicker(false)}
              />
            </div>
          </div>
        )}
      </form>

      {/* Comments List */}
      <div className='comment-list space-y-2'>
        {isLoading ? (
          <div className='flex-center w-full py-2'>
            <Loader className='h-4 w-4 animate-spin' />
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div
              key={comment.$id}
              className='comment-item flex gap-1.5 items-start mb-3'
            >
              <Link to={`/profile/${comment.userId}`} className='flex-shrink-0'>
                <img
                  src={
                    comment.user?.imageUrl ||
                    '/assets/icons/profile-placeholder.svg'
                  }
                  alt='user avatar'
                  className='w-6 h-6 rounded-full object-cover'
                />
              </Link>
              <div className='flex-1 overflow-hidden'>
                <div className='flex items-start justify-between flex-wrap'>
                  <div className='flex items-center gap-1 mb-0.5 pr-1'>
                    <Link
                      to={`/profile/${comment.userId}`}
                      className='font-semibold text-white hover:underline text-sm truncate max-w-[120px]'
                    >
                      {comment.user?.name || 'User'}
                    </Link>
                    {comment.user?.username && (
                      <span className='text-light-3 text-xs truncate'>
                        @{comment.user.username}
                      </span>
                    )}
                  </div>
                  <span className='text-light-3 text-xs'>
                    {multiFormatDateString(comment.createdAt)}
                  </span>
                </div>

                {/* Comment text content */}
                {comment.content && <TranslateComment comment={comment} />}

                {/* Display GIF if present */}
                {comment.gifUrl && (
                  <div className='mt-1 overflow-hidden rounded-md'>
                    <img
                      src={comment.gifUrl}
                      alt='Comment GIF'
                      className='w-full h-auto object-contain rounded-md'
                      style={{ maxHeight: '120px' }}
                    />
                  </div>
                )}

                <div className='flex gap-3 mt-1'>
                  <button
                    type='button'
                    className='text-light-3 hover:text-light-1 text-xs'
                  >
                    Like
                  </button>
                  <button
                    type='button'
                    className='text-light-3 hover:text-light-1 text-xs'
                  >
                    Reply
                  </button>
                  {user.id === comment.userId && (
                    <button
                      type='button'
                      onClick={() => handleDeleteComment(comment.$id)}
                      className='text-light-3 hover:text-red-500 text-xs'
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className='text-light-3 text-center py-3 text-sm'>
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
