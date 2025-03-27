import { Link } from 'react-router-dom';
import { useGetTopCreators } from '@/lib/react-query/queries';
import { Loader, Hash, TrendingUp } from 'lucide-react';
import FollowButton from './FollowButton';
import { Models } from 'appwrite';
import { ICreatorWithFollowers } from '@/types';

const transformCreator = (doc: Models.Document): ICreatorWithFollowers => ({
  id: doc.$id,
  $id: doc.$id,
  name: doc.name,
  username: doc.username,
  email: doc.email,
  imageUrl: doc.imageUrl,
  bio: doc.bio || '',
  followerCount: doc.followerCount || 0,
});

// Trending topics data with coding added
const trendingTopics = [
  { tag: 'photography', postCount: 1240 },
  { tag: 'design', postCount: 980 },
  { tag: 'travel', postCount: 843 },
  { tag: 'coding', postCount: 712 },
];

const CreatorCard = ({ creator }: { creator: ICreatorWithFollowers }) => (
  <div className='flex flex-col items-center text-center'>
    <Link to={`/profile/${creator.$id}`} className='flex flex-col items-center'>
      <img
        src={creator.imageUrl || '/assets/icons/profile-placeholder.svg'}
        alt={creator.name}
        className='w-16 h-16 rounded-full object-cover border border-dark-4'
      />

      <div className='mt-1'>
        <p className='text-sm font-medium text-light-1 line-clamp-1'>
          {creator.name.split(' ')[0]}
        </p>
        <p className='text-xs text-light-3 line-clamp-1'>@{creator.username}</p>
      </div>
    </Link>

    <div className='mt-2 w-full flex justify-center'>
      <FollowButton userId={creator.$id} compact={true} />
    </div>
  </div>
);

const TrendingCard = ({
  tag,
  postCount,
}: {
  tag: string;
  postCount: number;
}) => (
  <div className='group flex items-center justify-between py-2 px-3 hover:bg-dark-3 transition-colors cursor-pointer'>
    <div className='flex items-center gap-3'>
      <div className='w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center'>
        <Hash className='w-4 h-4 text-primary-500' />
      </div>
      <div>
        <p className='text-sm font-medium text-light-1'>#{tag}</p>
        <p className='text-xs text-light-3'>{postCount} posts</p>
      </div>
    </div>
    <TrendingUp className='w-4 h-4 text-light-3' />
  </div>
);

const RightSidebar = () => {
  const { data: rawCreators = [], isLoading: isUserLoading } =
    useGetTopCreators(6);

  const creators = rawCreators.map(transformCreator);

  return (
    <aside className='hidden xl:flex flex-col w-80 h-screen bg-dark-2 border-l border-dark-4 py-5'>
      <div className='flex flex-col justify-between h-full px-5'>
        <div className='space-y-8'>
          {/* Top Creators Section */}
          <section>
            <div className='flex items-center justify-between mb-3'>
              <h2 className='text-lg font-bold text-light-1'>Top Creators</h2>
              <Link
                to='/all-users'
                className='text-xs text-primary-500 hover:underline'
              >
                See all
              </Link>
            </div>

            {isUserLoading ? (
              <div className='flex-center w-full h-24'>
                <Loader className='w-6 h-6 text-primary-500 animate-spin' />
              </div>
            ) : (
              <div className='grid grid-cols-2 gap-4'>
                {creators.slice(0, 6).map((creator) => (
                  <div key={creator.$id} className='col-span-1'>
                    <CreatorCard creator={creator} />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Trending Topics Section */}
          <section>
            <div className='flex items-center justify-between mb-3'>
              <h2 className='text-lg font-bold text-light-1'>
                Trending Topics
              </h2>
              <Link
                to='/explore'
                className='text-xs text-primary-500 hover:underline'
              >
                See all
              </Link>
            </div>

            <div className='space-y-1'>
              {trendingTopics.map((topic) => (
                <TrendingCard
                  key={topic.tag}
                  tag={topic.tag}
                  postCount={topic.postCount}
                />
              ))}
            </div>
          </section>
        </div>

        {/* Footer - Always visible at bottom */}
        <footer className='text-center text-xs text-light-3 pt-3 border-t border-dark-4 mt-auto'>
          <div className='flex justify-center gap-3 mb-2'>
            <span className='hover:text-light-2 cursor-pointer'>About</span>
            <span className='hover:text-light-2 cursor-pointer'>Privacy</span>
            <span className='hover:text-light-2 cursor-pointer'>Terms</span>
          </div>
          <p>© 2025 Horizon Social</p>
        </footer>
      </div>
    </aside>
  );
};

export default RightSidebar;
