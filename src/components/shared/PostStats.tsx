import { Models } from 'appwrite';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkIsLiked } from '@/lib/utils';
import {
  useLikePost,
  useSavePost,
  useDeleteSavedPost,
  useGetCurrentUser,
  useGetPostComments,
} from '@/lib/react-query/queries';
import { motion } from 'framer-motion';
import ShareModal from './ShareModal';

type PostStatsProps = {
  post: Models.Document;
  userId: string;
  isGridView?: boolean;
};

const PostStats = ({ post, userId, isGridView = false }: PostStatsProps) => {
  // Initialize states and navigation
  const navigate = useNavigate();
  const [likes, setLikes] = useState<string[]>(
    Array.isArray(post.likes)
      ? post.likes.map((user: any) =>
        typeof user === 'object' ? user.$id : user
      )
      : []
  );
  const [isSaved, setIsSaved] = useState(false);
  const [commentCount, setCommentCount] = useState(post.commentCount || 0);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);

  // Get mutations and current user data
  const { mutate: likePost } = useLikePost();
  const { mutate: savePost } = useSavePost();
  const { mutate: deleteSavePost } = useDeleteSavedPost();
  const { data: currentUser } = useGetCurrentUser();
  const { data: commentsData } = useGetPostComments(post.$id);

  // Update comment count when comments data changes
  useEffect(() => {
    if (commentsData) {
      // Handle the case where commentsData might not have 'total' property
      const count =
        'total' in commentsData
          ? commentsData.total
          : commentsData.documents?.length || 0;

      setCommentCount(count);
    }
  }, [commentsData]);

  // Check if post is saved by current user
  useEffect(() => {
    if (!currentUser?.save) return;

    const savedRecord = currentUser.save.find(
      (record: Models.Document) =>
        record.post?.$id === post.$id || record.post === post.$id
    );

    setIsSaved(!!savedRecord);
  }, [currentUser, post.$id]);

  // Handle liking/unliking a post
  const handleLikePost = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    let likesArray = [...likes];
    const hasLiked = likesArray.includes(userId);

    if (hasLiked) {
      likesArray = likesArray.filter((id) => id !== userId);
    } else {
      likesArray.push(userId);
      setIsLikeAnimating(true);
      setTimeout(() => setIsLikeAnimating(false), 1000);
    }

    setLikes(likesArray);
    likePost({ postId: post.$id, likesArray });
  };

  // Handle saving/unsaving a post
  const handleSavePost = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSaved && currentUser?.save) {
      const savedRecord = currentUser.save.find(
        (record: Models.Document) =>
          record.post?.$id === post.$id || record.post === post.$id
      );

      if (savedRecord) {
        setIsSaved(false);
        deleteSavePost(savedRecord.$id);
      }
    } else {
      savePost({ userId, postId: post.$id });
      setIsSaved(true);
    }
  };

  // Navigate to post details for commenting
  const handleCommentClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/posts/${post.$id}`);
  };

  // Format like count for display
  const formatCount = (count: number) => {
    if (count > 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count > 1000) return `${(count / 1000).toFixed(1)}K`;
    return count;
  };

  // Get liked users text
  const getLikedByText = () => {
    if (likes.length === 0) return null;

    if (likes.includes(userId)) {
      if (likes.length === 1) {
        return 'You liked this post';
      } else {
        return `You and ${likes.length - 1} ${likes.length === 2 ? 'other' : 'others'}`;
      }
    } else {
      return `${likes.length} ${likes.length === 1 ? 'like' : 'likes'}`;
    }
  };

  // Grid view - use a more compact layout
  if (isGridView) {
    return (
      <div className='absolute inset-0 bg-gradient-to-t from-black/70 to-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-6 px-4'>
        <div className='flex items-center gap-1 text-white'>
          <button
            onClick={handleLikePost}
            className='flex items-center gap-1 hover:scale-110 transition-transform'
          >
            <img
              src={
                checkIsLiked(likes, userId)
                  ? '/assets/icons/liked.svg'
                  : '/assets/icons/like.svg'
              }
              alt='like'
              width={20}
              height={20}
            />
            <span className='text-sm font-medium'>{likes.length}</span>
          </button>
        </div>

        <div className='flex items-center gap-1 text-white'>
          <button
            onClick={handleCommentClick}
            className='flex items-center gap-1 hover:scale-110 transition-transform'
          >
            <img
              src='/assets/icons/comment.svg'
              alt='comment'
              width={20}
              height={20}
            />
            <span className='text-sm font-medium'>{commentCount}</span>
          </button>
        </div>

        <div className='flex items-center gap-1 text-white'>
          <button
            onClick={handleSavePost}
            className='hover:scale-110 transition-transform'
          >
            <img
              src={isSaved ? '/assets/icons/saved.svg' : '/assets/icons/save.svg'}
              alt='save'
              width={20}
              height={20}
            />
          </button>
        </div>
      </div>
    );
  }

  // Regular detailed view
  return (
    <div className='space-y-2'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          {/* Like Button */}
          <button
            onClick={handleLikePost}
            className='flex items-center justify-center group relative'
          >
            {isLikeAnimating && (
              <motion.div
                initial={{ scale: 0, opacity: 0.7 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 0.8 }}
                className='absolute inset-0 bg-primary-500 rounded-full'
              />
            )}
            <motion.img
              whileTap={{ scale: 1.2 }}
              src={
                checkIsLiked(likes, userId)
                  ? '/assets/icons/liked.svg'
                  : '/assets/icons/like.svg'
              }
              alt='like'
              width={24}
              height={24}
              className={checkIsLiked(likes, userId) ? 'scale-110' : ''}
            />
            <span className='ml-1 text-sm text-light-2'>
              {formatCount(likes.length)}
            </span>
          </button>

          {/* Comment Button */}
          <button
            onClick={handleCommentClick}
            className='flex items-center group'
          >
            <motion.img
              whileTap={{ scale: 1.2 }}
              src='/assets/icons/comment.svg'
              alt='comment'
              width={24}
              height={24}
            />
            <span className='ml-1 text-sm text-light-2'>
              {formatCount(commentCount)}
            </span>
          </button>

          {/* Share Button */}
          <ShareModal postId={post.$id} />
        </div>

        {/* Save Button */}
        <motion.button
          onClick={handleSavePost}
          className='group'
          whileTap={{ scale: 1.2 }}
        >
          <img
            src={isSaved ? '/assets/icons/saved.svg' : '/assets/icons/save.svg'}
            alt='save'
            width={24}
            height={24}
            className={isSaved ? 'scale-110' : ''}
          />
        </motion.button>
      </div>

      {/* Liked by summary */}
      {likes.length > 0 && (
        <p className='text-sm text-light-2 font-medium'>{getLikedByText()}</p>
      )}
    </div>
  );
};

export default PostStats;