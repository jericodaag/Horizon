import { useGetUsers } from '@/lib/react-query/queries';
import { Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import FollowButton from '@/components/shared/FollowButton';

const AllUsers = () => {
  const { data: users, isLoading } = useGetUsers();

  return (
    <div className='common-container'>
      <div className='user-container'>
        <h2 className='h3-bold md:h2-bold text-left w-full'>All Users</h2>

        {isLoading ? (
          <div className='flex-center w-full h-[200px]'>
            <Loader />
          </div>
        ) : (
          <ul className='user-grid'>
            {users?.documents.map((user) => (
              <motion.li
                key={user.$id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className='flex-1 min-w-[200px] w-full'
              >
                <Link to={`/profile/${user.$id}`} className='user-card'>
                  <img
                    src={
                      user.imageUrl || '/assets/icons/profile-placeholder.svg'
                    }
                    alt='profile'
                    className='rounded-full w-14 h-14'
                  />

                  <div className='flex-center flex-col gap-1'>
                    <p className='base-medium text-light-1 text-center line-clamp-1'>
                      {user.name}
                    </p>
                    <p className='small-regular text-light-3 text-center line-clamp-1'>
                      @{user.username}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className='flex gap-4 mt-4 items-center text-light-3'>
                    <div className='flex-center gap-2'>
                      <img
                        src='/assets/icons/posts.svg'
                        alt='posts'
                        width={20}
                        height={20}
                      />
                      <p className='subtle-semibold lg:small-regular'>
                        {user.posts?.length || 0}
                      </p>
                    </div>
                    <div className='flex-center gap-2'>
                      <img
                        src='/assets/icons/like.svg'
                        alt='likes'
                        width={20}
                        height={20}
                      />
                      <p className='subtle-semibold lg:small-regular'>
                        {user.totalLikes || 0}
                      </p>
                    </div>
                  </div>

                  <FollowButton userId={user.$id} className='mt-4 w-full' />
                </Link>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AllUsers;
