import { useUserContext } from '@/context/AuthContext';
import { formatDateString } from '@/lib/utils';
import { Models } from 'appwrite';
import { Link } from 'react-router-dom';
import PostStats from './PostStats';
import { useGetPostComments } from '@/lib/react-query/queries';
import { useEffect, useState } from 'react';
import { IComment } from '@/types';
import { appwriteConfig, databases } from '@/lib/appwrite/config';

type PostCardProps = {
  post: Models.Document;
};

const PostCard = ({ post }: PostCardProps) => {
  const { user } = useUserContext();
  const [comments, setComments] = useState<IComment[]>([]);
  const { data: commentsData } = useGetPostComments(post.$id);

  useEffect(() => {
    const fetchCommentsWithUserDetails = async () => {
      if (commentsData?.documents && commentsData.documents.length > 0) {
        // Get the latest 3 comments
        const latestComments = commentsData.documents.slice(0, 3);

        // For each comment, fetch the user details
        const enhancedComments = await Promise.all(
          latestComments.map(async (comment: Models.Document) => {
            try {
              // Fetch user data for this comment's userId
              const userData = await databases.getDocument(
                appwriteConfig.databaseId,
                appwriteConfig.userCollectionId,
                comment.userId
              );

              // Return the comment with user data
              return {
                $id: comment.$id,
                userId: comment.userId,
                postId: comment.postId,
                content: comment.content,
                createdAt: comment.createdAt,
                likes: comment.likes || [],
                user: {
                  $id: userData.$id,
                  name: userData.name,
                  username: userData.username,
                  imageUrl: userData.imageUrl,
                },
              } as IComment;
            } catch (error) {
              console.error('Error fetching user for comment:', error);
              // If fetching user fails, return comment with placeholder user data
              return {
                $id: comment.$id,
                userId: comment.userId,
                postId: comment.postId,
                content: comment.content,
                createdAt: comment.createdAt,
                likes: comment.likes || [],
                user: {
                  $id: comment.userId,
                  name: 'User',
                  username: '',
                  imageUrl: '/assets/icons/profile-placeholder.svg',
                },
              } as IComment;
            }
          })
        );

        setComments(enhancedComments);
      }
    };

    fetchCommentsWithUserDetails();
  }, [commentsData]);

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

        {/* Edit Post Button */}
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

      {/* Post Image */}
      <Link to={`/posts/${post.$id}`}>
        <div className='relative aspect-square rounded-xl overflow-hidden my-3'>
          <img
            src={post.imageUrl || '/assets/icons/profile-placeholder.svg'}
            alt='post image'
            className='w-full h-full object-cover'
          />
        </div>
      </Link>

      {/* Post Stats */}
      <PostStats post={post} userId={user.id} />

      {/* Caption & Tags */}
      <div className='mt-3 space-y-2'>
        <div className='flex gap-2'>
          <p className='text-light-1 font-medium'>{post.creator.name}</p>
          <p className='text-light-2'>{post.caption}</p>
        </div>

        {/* Comment Preview */}
        {comments.length > 0 && (
          <div className='mt-2'>
            <Link
              to={`/posts/${post.$id}`}
              className='text-light-3 text-sm hover:text-light-2'
            >
              {commentsData && commentsData.documents.length > 3
                ? `View all ${commentsData.documents.length} comments`
                : commentsData && commentsData.documents.length === 1
                  ? 'View 1 comment'
                  : commentsData
                    ? `View all ${commentsData.documents.length} comments`
                    : 'View comments'}
            </Link>
            <div className='mt-1 space-y-1'>
              {comments.map((comment) => (
                <div key={comment.$id} className='flex gap-2'>
                  <p className='text-light-1 text-sm font-medium'>
                    {comment.user?.name || 'User'}
                  </p>
                  <p className='text-light-2 text-sm line-clamp-1'>
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
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
