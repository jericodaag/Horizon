import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useGetFollowers, useGetFollowing } from '@/lib/react-query/queries';
import { Models } from 'appwrite'; // Add this import
import { Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import FollowButton from './FollowButton';

type FollowModalProps = {
  userId: string;
  type: 'followers' | 'following';
  isOpen: boolean;
  onClose: () => void;
};

const FollowModal = ({ userId, type, isOpen, onClose }: FollowModalProps) => {
  const { data: followers, isLoading: isLoadingFollowers } =
    useGetFollowers(userId);
  const { data: following, isLoading: isLoadingFollowing } =
    useGetFollowing(userId);

  const isLoading =
    type === 'followers' ? isLoadingFollowers : isLoadingFollowing;
  const users: Models.Document[] =
    type === 'followers' ? followers || [] : following || [];
  const title = type === 'followers' ? 'Followers' : 'Following';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='bg-dark-2 text-light-1'>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className='flex-center w-full h-[200px]'>
            <Loader />
          </div>
        ) : (
          <div className='flex flex-col gap-4 max-h-[60vh] overflow-y-auto custom-scrollbar'>
            {users.map((user: Models.Document) => (
              <div
                key={user.$id}
                className='flex items-center justify-between p-4 rounded-xl bg-dark-3'
              >
                <Link
                  to={`/profile/${user.$id}`}
                  onClick={onClose}
                  className='flex items-center gap-3'
                >
                  <img
                    src={
                      user.imageUrl || '/assets/icons/profile-placeholder.svg'
                    }
                    alt='profile'
                    className='w-12 h-12 rounded-full object-cover'
                  />
                  <div>
                    <p className='base-medium text-light-1'>{user.name}</p>
                    <p className='small-regular text-light-3'>
                      @{user.username}
                    </p>
                  </div>
                </Link>

                <FollowButton userId={user.$id} />
              </div>
            ))}

            {users.length === 0 && (
              <p className='text-light-3 text-center py-4'>No {type} yet</p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FollowModal;
