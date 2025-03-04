import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { useUserContext } from '@/context/AuthContext';
import {
  useFollowUser,
  useUnfollowUser,
  useIsFollowing,
} from '@/lib/react-query/queries';
import { motion, AnimatePresence } from 'framer-motion';

type FollowButtonProps = {
  userId: string;
  className?: string;
  compact?: boolean;
};

const FollowButton = ({ userId, className = '', compact = false }: FollowButtonProps) => {
  const { user } = useUserContext();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const { data: isFollowingUser } = useIsFollowing(user.id, userId);
  const { mutate: followUser } = useFollowUser();
  const { mutate: unfollowUser } = useUnfollowUser();

  // Don't show the button for the current user
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

  // Determine button text based on follow state and compact prop
  const getButtonText = () => {
    if (compact) return null;

    if (isFollowingUser) {
      return isHovering ? 'Unfollow' : 'Following';
    }

    return 'Follow';
  };

  return (
    <motion.div
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Button
        onClick={handleFollow}
        disabled={isLoading}
        variant={isFollowingUser ? 'outline' : 'default'}
        size={compact ? 'icon' : 'default'}
        className={`transition-all duration-300 ${className} ${compact ? 'w-8 h-8 rounded-full' : ''
          } ${isFollowingUser
            ? 'text-light-1 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20'
            : 'bg-primary-500 hover:bg-primary-600'
          }`}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className='h-4 w-4 animate-spin rounded-full border-2 border-light-1 border-t-transparent' />
          ) : (
            <div className="flex items-center gap-2">
              {compact && (
                isFollowingUser ? (
                  <UserCheck size={16} className={`${isHovering ? 'text-red-500' : ''}`} />
                ) : (
                  <UserPlus size={16} />
                )
              )}
              {getButtonText()}
            </div>
          )}
        </AnimatePresence>
      </Button>
    </motion.div>
  );
};

export default FollowButton;