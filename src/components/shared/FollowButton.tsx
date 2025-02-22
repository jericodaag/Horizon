import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { useUserContext } from '@/context/AuthContext';
import {
  useFollowUser,
  useUnfollowUser,
  useIsFollowing,
} from '@/lib/react-query/queries';
import { motion } from 'framer-motion';

type FollowButtonProps = {
  userId: string;
  className?: string;
};

const FollowButton = ({ userId, className = '' }: FollowButtonProps) => {
  const { user } = useUserContext();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const { data: isFollowingUser } = useIsFollowing(user.id, userId);
  const { mutate: followUser } = useFollowUser();
  const { mutate: unfollowUser } = useUnfollowUser();

  if (user.id === userId) return null;

  const handleFollow = async () => {
    setIsLoading(true);
    try {
      if (isFollowingUser) {
        unfollowUser({ followerId: user.id, followingId: userId });
      } else {
        followUser({ followerId: user.id, followingId: userId });
      }
    } catch (error) {
      console.log(error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }}>
      <Button
        onClick={handleFollow}
        disabled={isLoading}
        className={`transition-all duration-300 ${className} ${
          isFollowingUser
            ? 'bg-dark-4 text-light-1 hover:bg-dark-3'
            : 'bg-primary-500 hover:bg-primary-600'
        }`}
        variant={isFollowingUser ? 'outline' : 'default'}
      >
        {isLoading ? (
          <div className='h-4 w-4 animate-spin rounded-full border-2 border-light-1 border-t-transparent' />
        ) : isFollowingUser ? (
          'Following'
        ) : (
          'Follow'
        )}
      </Button>
    </motion.div>
  );
};

export default FollowButton;
