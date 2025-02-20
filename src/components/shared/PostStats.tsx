import { Models } from 'appwrite';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

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
};

const PostStats = ({ post, userId }: PostStatsProps) => {
  const [likes, setLikes] = useState<string[]>(
    post.likes.map((user: Models.Document) => user.$id)
  );
  const [isSaved, setIsSaved] = useState(false);
  const { mutate: likePost } = useLikePost();
  const { mutate: savePost } = useSavePost();
  const { mutate: deleteSavePost } = useDeleteSavedPost();
  const { data: currentUser } = useGetCurrentUser();

  useEffect(() => {
    setIsSaved(
      !!currentUser?.save.find(
        (record: Models.Document) => record.post.$id === post.$id
      )
    );
  }, [currentUser]);

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

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex gap-4 items-center'>
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

      {likes.length > 0 && (
        <p className='text-light-2 text-sm'>
          {likes.length} {likes.length === 1 ? 'like' : 'likes'}
        </p>
      )}
    </div>
  );
};

export default PostStats;
