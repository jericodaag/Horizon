import { Models } from 'appwrite';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkIsLiked } from '@/lib/utils';
import {
  useLikePost,
  useSavePost,
  useDeleteSavedPost,
  useGetCurrentUser,
} from '@/lib/react-query/queries';

type PostStatsProps = {
  post: Models.Document;
  userId: string;
  isGridView?: boolean; // Add this prop to adjust layout for grid vs detailed view
};

const PostStats = ({ post, userId, isGridView = false }: PostStatsProps) => {
  // Initialize states and navigation
  const navigate = useNavigate();
  const [likes, setLikes] = useState<string[]>(
    post.likes.map((user: Models.Document) => user.$id)
  );
  const [isSaved, setIsSaved] = useState(false);

  // Get mutations and current user data
  const { mutate: likePost } = useLikePost();
  const { mutate: savePost } = useSavePost();
  const { mutate: deleteSavePost } = useDeleteSavedPost();
  const { data: currentUser } = useGetCurrentUser();

  // Check if post is saved by current user
  useEffect(() => {
    setIsSaved(
      !!currentUser?.save.find(
        (record: Models.Document) => record.post.$id === post.$id
      )
    );
  }, [currentUser]);

  // Handle liking/unliking a post
  const handleLikePost = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    let likesArray = [...likes];
    if (likesArray.includes(userId)) {
      likesArray = likesArray.filter((Id) => Id !== userId);
    } else {
      likesArray.push(userId);
    }

    setLikes(likesArray);
    likePost({ postId: post.$id, likesArray });
  };

  // Handle saving/unsaving a post
  const handleSavePost = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSaved && currentUser?.save) {
      const savedRecord = currentUser.save.find(
        (record: Models.Document) => record.post.$id === post.$id
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
  const handleCommentClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/posts/${post.$id}`);
  };

  // Grid view - use a more compact layout
  if (isGridView) {
    return (
      <div className='flex-center gap-1'>
        <button onClick={handleLikePost} className='flex-center'>
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
        </button>

        <button onClick={handleCommentClick} className='flex-center'>
          <img
            src='/assets/icons/comment.svg'
            alt='comment'
            width={20}
            height={20}
          />
        </button>

        <button onClick={handleSavePost} className='flex-center'>
          <img
            src={isSaved ? '/assets/icons/saved.svg' : '/assets/icons/save.svg'}
            alt='save'
            width={20}
            height={20}
          />
        </button>
      </div>
    );
  }

  // Regular detailed view
  return (
    <div className='flex flex-col gap-2'>
      <div className='flex gap-4 items-center'>
        {/* Like Button */}
        <button
          onClick={handleLikePost}
          className='flex items-center gap-2 hover:opacity-80 transition-opacity'
        >
          <img
            src={
              checkIsLiked(likes, userId)
                ? '/assets/icons/liked.svg'
                : '/assets/icons/like.svg'
            }
            alt='like'
            width={24}
            height={24}
          />
        </button>

        {/* Comment Button */}
        <button
          onClick={handleCommentClick}
          className='flex items-center gap-2 hover:opacity-80 transition-opacity'
        >
          <img
            src='/assets/icons/comment.svg'
            alt='comment'
            width={24}
            height={24}
          />
        </button>

        {/* Save Button */}
        <button
          onClick={handleSavePost}
          className='hover:opacity-80 transition-opacity ml-auto'
        >
          <img
            src={isSaved ? '/assets/icons/saved.svg' : '/assets/icons/save.svg'}
            alt='save'
            width={24}
            height={24}
          />
        </button>
      </div>

      {/* Stats Display */}
      <div className='flex gap-4'>
        {/* Like Count */}
        {likes.length > 0 && (
          <p className='text-light-2 text-sm'>
            {likes.length} {likes.length === 1 ? 'like' : 'likes'}
          </p>
        )}
        {/* Comment Count */}
        {post.comments?.length > 0 && (
          <p className='text-light-2 text-sm'>
            {post.comments.length}{' '}
            {post.comments.length === 1 ? 'comment' : 'comments'}
          </p>
        )}
      </div>
    </div>
  );
};

export default PostStats;
