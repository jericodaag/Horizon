// src/components/shared/PostCard.tsx
import { useUserContext } from '@/context/AuthContext';
import { formatDateString } from '@/lib/utils';
import { Models } from 'appwrite';
import { Link } from 'react-router-dom';
import PostStats from './PostStats';

type PostCardProps = {
  post: Models.Document;
};

const PostCard = ({ post }: PostCardProps) => {
  const { user } = useUserContext();

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

      {/* Post Stats & Actions */}
      <PostStats post={post} userId={user.id} />

      {/* Caption & Tags */}
      <div className='mt-3 space-y-2'>
        <div className='flex gap-2'>
          <p className='text-light-1 font-medium'>{post.creator.name}</p>
          <p className='text-light-2'>{post.caption}</p>
        </div>

        {post.tags.length > 0 && (
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
