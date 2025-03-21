import { useUserContext } from '@/context/AuthContext';
import { formatDateString } from '@/lib/utils';
import { Models } from 'appwrite';
import { Link } from 'react-router-dom';
import PostStats from './PostStats';
import { useEffect, useState } from 'react';
import { IComment } from '@/types';
import { appwriteConfig, databases } from '@/lib/appwrite/config';
import { Query } from 'appwrite';
import TranslateButton from './TranslateButton';

type PostCardProps = {
  post: Models.Document;
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

const PostCard = ({ post }: PostCardProps) => {
  const { user } = useUserContext();
  const [comments, setComments] = useState<IComment[]>([]);
  const [commentCount, setCommentCount] = useState(0);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  // Extract user ID safely from potentially object or string
  const getUserId = (userIdData: any): string => {
    if (!userIdData) return '';

    // Handle if it's an object with $id
    if (typeof userIdData === 'object' && userIdData !== null) {
      if (userIdData.$id) return String(userIdData.$id);
      if (userIdData.id) return String(userIdData.id);
      return String(userIdData);
    }

    return String(userIdData);
  };

  // Fetch the latest comments for this post
  useEffect(() => {
    const fetchCommentsWithUserDetails = async () => {
      try {
        setIsLoadingComments(true);

        // Get only the latest 1 comment for this post
        const commentsData = await databases.listDocuments(
          appwriteConfig.databaseId,
          appwriteConfig.commentsCollectionId,
          [
            Query.equal('postId', [post.$id]),
            Query.orderDesc('$createdAt'),
            Query.limit(1), // Changed from 3 to 1
          ]
        );

        setCommentCount(commentsData.total);

        if (commentsData.documents.length === 0) {
          setIsLoadingComments(false);
          return;
        }

        // Get unique userIds - handle object/string IDs
        const userIds = [
          ...new Set(
            commentsData.documents.map((comment) => {
              return getUserId(comment.userId);
            })
          ),
        ].filter((id) => id !== ''); // Filter out any empty IDs

        // Fetch user data in bulk
        const usersData = await Promise.all(
          userIds.map((userId) =>
            databases
              .getDocument(
                appwriteConfig.databaseId,
                appwriteConfig.userCollectionId,
                userId
              )
              .catch((err) => {
                console.error(`Error fetching user ${userId}:`, err);
                return null;
              })
          )
        );

        // Create a map of userId to user data for quick lookup
        const userMap: UserMap = {};
        usersData.forEach((userData) => {
          if (userData) {
            userMap[userData.$id] = {
              $id: userData.$id,
              name: userData.name as string,
              username: userData.username as string,
              imageUrl: userData.imageUrl as string,
            };
          }
        });

        // Combine comment data with user data
        const enhancedComments = commentsData.documents.map((comment) => {
          const actualUserId = getUserId(comment.userId);
          const userData = userMap[actualUserId] || {
            $id: actualUserId || 'unknown',
            name: 'User',
            username: '',
            imageUrl: '/assets/icons/profile-placeholder.svg',
          };

          return {
            $id: comment.$id,
            userId: actualUserId,
            postId: comment.postId as string,
            content: comment.content as string,
            createdAt: (comment.createdAt as string) || comment.$createdAt,
            likes: (comment.likes as string[]) || [],
            gifUrl: (comment.gifUrl as string) || null,
            gifId: (comment.gifId as string) || null,
            user: userData,
          } as IComment;
        });

        setComments(enhancedComments);
      } catch (error) {
        console.error('Error fetching comments for post card:', error);
      } finally {
        setIsLoadingComments(false);
      }
    };

    if (post.$id) {
      fetchCommentsWithUserDetails();
    }
  }, [post.$id]);

  if (!post.creator) return null;

  return (
    <div className='post-card'>
      {/* Header: User Info */}
      <div className='flex items-center justify-between py-2.5'>
        <div className='flex items-center gap-3'>
          <Link to={`/profile/${post.creator.$id}`}>
            <img
              src={
                post?.creator?.imageUrl ||
                '/assets/icons/profile-placeholder.svg'
              }
              alt='creator'
              className='w-8 h-8 rounded-full object-cover'
            />
          </Link>

          <div className='flex flex-col'>
            <p className='base-medium text-light-1'>{post.creator.name}</p>
            <div className='flex items-center gap-2 text-light-3 text-sm'>
              <p className='subtle-semibold'>
                {formatDateString(post.$createdAt)}
              </p>
              {post.location && (
                <>
                  <span>-</span>
                  <p className='subtle-semibold'>{post.location}</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Edit Post Button - Only shown to post creator */}
        {user.id === post.creator.$id && (
          <Link
            to={`/update-post/${post.$id}`}
            className='hover:bg-dark-4 p-2 rounded-full transition-colors'
          >
            <img
              src='/assets/icons/edit.svg'
              alt='edit'
              width={20}
              height={20}
            />
          </Link>
        )}
      </div>

      {/* Post Content */}
      <Link to={`/posts/${post.$id}`}>
        {/* Post Image (if exists) */}
        {post.imageUrl && (
          <div className='relative aspect-square rounded-xl overflow-hidden my-3'>
            <img
              src={post.imageUrl}
              alt='post image'
              className='w-full h-full object-cover'
            />
          </div>
        )}
      </Link>

      {/* Post Stats */}
      <PostStats post={post} userId={user.id} />

      {/* Caption & Tags */}
      <div className='mt-3 space-y-2'>
        <div className='flex gap-2'>
          <p className='text-light-1 font-medium'>{post.creator.name}</p>
          <TranslateButton text={post.caption} />
        </div>

        {/* Comment Preview - Show only 1 comment */}
        {commentCount > 0 && (
          <div className='mt-2'>
            <Link
              to={`/posts/${post.$id}`}
              className='text-light-3 text-sm hover:text-light-2'
            >
              {commentCount > 1
                ? `View all ${commentCount} comments`
                : 'View 1 comment'}
            </Link>
            {!isLoadingComments && comments.length > 0 && (
              <div className='mt-1 space-y-1'>
                {comments.map((comment) => (
                  <div key={comment.$id} className='flex flex-col'>
                    <div className='flex gap-2'>
                      <p className='text-light-1 text-sm font-medium'>
                        {comment.user?.name || 'User'}
                      </p>

                      {/* Only show text content if it exists */}
                      {comment.content && (
                        <p className='text-light-2 text-sm line-clamp-1'>
                          {comment.content}
                        </p>
                      )}
                    </div>

                    {/* Show GIF preview if comment has a GIF */}
                    {comment.gifUrl && (
                      <div className='mt-1 ml-8'>
                        <div className='flex items-center gap-2'>
                          <span className='text-primary-500 text-xs'>
                            [GIF]
                          </span>
                          <div className='h-8 w-8 rounded overflow-hidden bg-dark-3'>
                            <img
                              src={comment.gifUrl}
                              alt='GIF comment'
                              className='h-full w-full object-cover'
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className='flex flex-wrap gap-1'>
            {post.tags.map((tag: string) => (
              <span
                key={tag}
                className='text-primary-500 text-sm hover:underline cursor-pointer'
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;
