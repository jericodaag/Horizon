import { Link } from 'react-router-dom';
import { useGetTopCreators } from '@/lib/react-query/queries';
import { Loader } from 'lucide-react';
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

const CreatorCard = ({ creator }: { creator: ICreatorWithFollowers }) => (
  <div className='flex flex-col items-center bg-dark-2 rounded-xl p-4'>
    <Link
      to={`/profile/${creator.$id}`}
      className='flex flex-col items-center gap-2 w-full'
    >
      {creator.imageUrl ? (
        <img
          src={creator.imageUrl}
          alt={creator.name}
          className='w-14 h-14 rounded-full object-cover'
        />
      ) : (
        <div className='w-14 h-14 rounded-full bg-primary-500 flex items-center justify-center'>
          <span className='text-lg text-light-1 font-bold'>
            {creator.name.charAt(0)}
          </span>
        </div>
      )}

      <div className='text-center w-full'>
        <p className='base-medium text-light-1 line-clamp-1'>{creator.name}</p>
        <p className='small-regular text-light-3 line-clamp-1'>
          @{creator.username}
        </p>
        <p className='text-xs text-primary-500 mt-1'>
          {creator.followerCount} followers
        </p>
      </div>
    </Link>

    <FollowButton userId={creator.$id} className='mt-3 w-full' />
  </div>
);

const RightSidebar = () => {
  const { data: rawCreators = [], isLoading: isUserLoading } =
    useGetTopCreators(6);

  const creators = rawCreators.map(transformCreator);

  return (
    <div className='hidden xl:flex flex-col w-72 2xl:w-465 px-6 py-10'>
      <h2 className='text-xl font-bold text-light-1 mb-6'>
        Top Creators
        <span className='text-sm font-normal text-light-3 ml-2'>
          (Most Followed)
        </span>
      </h2>

      <div className='flex flex-col gap-3'>
        {isUserLoading ? (
          <div className='flex-center w-full h-[200px]'>
            <Loader className='w-8 h-8 text-primary-500' />
          </div>
        ) : (
          <div className='grid grid-cols-2 gap-4'>
            {creators.map((creator) => (
              <CreatorCard key={creator.$id} creator={creator} />
            ))}
          </div>
        )}

        {creators.length === 0 && !isUserLoading && (
          <p className='text-light-3 text-center'>No creators found</p>
        )}
      </div>
    </div>
  );
};

export default RightSidebar;
