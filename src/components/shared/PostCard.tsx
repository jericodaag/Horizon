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
import { MapPin } from 'lucide-react';

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
            Query.limit(1),
          ]
        );

        setCommentCount(
          commentsData.documents.length > 0 ? commentsData.total || 0 : 0
        );

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
    <div className='bg-dark-2 rounded-xl overflow-hidden border border-dark-4 w-full max-w-[600px] mx-auto'>
      {/* Header: User Info */}
      <div className='flex items-center justify-between p-4 border-b border-dark-4'>
        <Link
          to={`/profile/${post.creator.$id}`}
          className='flex items-center gap-3'
        >
          <img
            src={
              post.creator.imageUrl || '/assets/icons/profile-placeholder.svg'
            }
            alt='creator'
            className='w-10 h-10 rounded-full object-cover'
          />

          <div className='flex flex-col'>
            <p className='font-semibold text-light-1'>{post.creator.name}</p>
            <div className='flex items-center gap-1'>
              <p className='text-light-3 text-xs'>
                {formatDateString(post.$createdAt)}
              </p>
              {post.location && (
                <>
                  <span className='text-light-3 text-xs'>•</span>
                  <div className='flex items-center gap-1 text-light-3 text-xs'>
                    <MapPin size={10} />
                    <span>{post.location}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </Link>

        {/* Edit Post Button - Only shown to post creator */}
        {user.id === post.creator.$id && (
          <Link
            to={`/update-post/${post.$id}`}
            className='p-2 rounded-full hover:bg-dark-3 transition-colors'
          >
            <img
              src='/assets/icons/edit.svg'
              alt='edit'
              width={18}
              height={18}
            />
          </Link>
        )}
      </div>

      {/* Caption & Tags */}
      {post.caption && (
        <div className='px-4 py-3'>
          <div className='flex items-start gap-2'>
            <TranslateButton text={post.caption} />
          </div>

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className='flex flex-wrap gap-1 mt-2'>
              {post.tags.map((tag: string) => (
                <Link
                  key={tag}
                  to={`/explore?tag=${tag}`}
                  className='text-primary-500 text-xs px-2 py-1 rounded-full bg-primary-500/10 hover:bg-primary-500/20 transition-colors'
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Post Image */}
      <Link to={`/posts/${post.$id}`}>
        {post.imageUrl && (
          <div className='aspect-square overflow-hidden border-y border-dark-4'>
            <img
              src={post.imageUrl}
              alt='post image'
              className='w-full h-full object-cover'
            />
          </div>
        )}
      </Link>

      {/* Post Stats */}
      <div className='p-4'>
        <PostStats post={post} userId={user.id} />

        {/* Comment Preview */}
        {commentCount > 0 && (
          <div className='mt-3 pt-3 border-t border-dark-4'>
            <Link
              to={`/posts/${post.$id}`}
              className='text-light-3 text-sm hover:text-light-2 inline-flex items-center gap-1'
            >
              <img
                src='/assets/icons/comment.svg'
                alt='comment'
                width={16}
                height={16}
              />
              {commentCount > 1
                ? `View all ${commentCount} comments`
                : 'View 1 comment'}
            </Link>

            {!isLoadingComments && comments.length > 0 && (
              <div className='mt-2 space-y-1'>
                {comments.map((comment) => (
                  <div key={comment.$id} className='flex items-start gap-2'>
                    <Link
                      to={`/profile/${comment.userId}`}
                      className='flex-shrink-0'
                    >
                      <img
                        src={
                          comment.user?.imageUrl ||
                          '/assets/icons/profile-placeholder.svg'
                        }
                        alt='user avatar'
                        className='w-6 h-6 rounded-full object-cover'
                      />
                    </Link>

                    <div className='flex-1'>
                      <div className='flex items-start gap-1'>
                        <Link
                          to={`/profile/${comment.userId}`}
                          className='font-medium text-light-1 text-xs'
                        >
                          {comment.user?.name || 'User'}
                        </Link>

                        {/* Comment text */}
                        {comment.content && (
                          <p className='text-light-2 text-xs'>
                            {comment.content}
                          </p>
                        )}
                      </div>

                      {/* GIF preview for comment */}
                      {comment.gifUrl && (
                        <div className='mt-1'>
                          <div className='h-12 w-16 rounded-md overflow-hidden bg-dark-4'>
                            <img
                              src={comment.gifUrl}
                              alt='GIF comment'
                              className='h-full w-full object-cover'
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;
