import { Models } from 'appwrite';
import { Link } from 'react-router-dom';
import { useUserContext } from '@/context/AuthContext';
import PostStats from './PostStats';
import { Hash } from 'lucide-react';

type GridPostListProps = {
  posts: Models.Document[];
  showUser?: boolean;
  showStats?: boolean;
  searchQuery?: string; // New prop to highlight matching tags
};

const GridPostList = ({
  posts,
  showUser = true,
  showStats = true,
  searchQuery = '', // Default to empty string
}: GridPostListProps) => {
  const { user } = useUserContext();

  // Normalize search query for comparison
  const normalizedQuery = searchQuery.toLowerCase().trim();

  return (
    <ul className='grid-container'>
      {posts.map((post) => {
        // Check if any tags match the search query
        const matchingTags =
          post.tags?.filter(
            (tag: string) =>
              normalizedQuery && tag.toLowerCase().includes(normalizedQuery)
          ) || [];

        const hasTagMatch = matchingTags.length > 0;

        return (
          <li key={post.$id} className='relative min-w-64 h-64 md:h-80'>
            <Link to={`/posts/${post.$id}`} className='grid-post_link'>
              <img
                src={post.imageUrl}
                alt='post'
                className='h-full w-full object-cover transition-all hover:scale-105 duration-300'
              />
            </Link>

            {/* Tag match indicator - show when a post has a matching tag */}
            {hasTagMatch && (
              <div className='absolute top-2 right-2 bg-primary-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-md'>
                <Hash size={10} />
                <span>{matchingTags[0]}</span>
              </div>
            )}

            <div className='grid-post_user'>
              {showUser && (
                <div className='flex items-center justify-start gap-2 flex-1'>
                  <img
                    src={
                      post.creator.imageUrl ||
                      '/assets/icons/profile-placeholder.svg'
                    }
                    alt='creator'
                    className='w-8 h-8 rounded-full'
                  />
                  <p className='line-clamp-1 text-light-1'>
                    {post.creator.name}
                  </p>
                </div>
              )}

              {/* Post details - Caption and Tags */}
              <div className='flex-1 flex flex-col overflow-hidden'>
                {post.caption && (
                  <p className='text-light-2 text-xs line-clamp-1'>
                    {post.caption}
                  </p>
                )}

                {post.tags && post.tags.length > 0 && (
                  <div className='mt-1 flex flex-wrap gap-1 overflow-hidden max-h-6'>
                    {post.tags.slice(0, 3).map((tag: string) => (
                      <span
                        key={tag}
                        className={`text-xs px-1.5 py-0.5 rounded-full ${
                          normalizedQuery &&
                          tag.toLowerCase().includes(normalizedQuery)
                            ? 'bg-primary-500 text-white'
                            : 'bg-dark-3 text-light-3'
                        }`}
                      >
                        #{tag}
                      </span>
                    ))}
                    {post.tags.length > 3 && (
                      <span className='text-xs text-light-3'>
                        +{post.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {showStats && (
                <PostStats post={post} userId={user.id} isGridView={true} />
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default GridPostList;
