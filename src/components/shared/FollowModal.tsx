import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useGetFollowers, useGetFollowing } from '@/lib/react-query/queries';
import { Models } from 'appwrite';
import { Loader, Search, X, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import FollowButton from './FollowButton';
import { Input } from '@/components/ui/input';
import { useUserContext } from '@/context/AuthContext';

type FollowModalProps = {
  userId: string;
  type: 'followers' | 'following';
  isOpen: boolean;
  onClose: () => void;
};

const FollowModal = ({ userId, type, isOpen, onClose }: FollowModalProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { user: currentUser } = useUserContext();

  const { data: followers, isLoading: isLoadingFollowers } =
    useGetFollowers(userId);
  const { data: following, isLoading: isLoadingFollowing } =
    useGetFollowing(userId);

  const isLoading =
    type === 'followers' ? isLoadingFollowers : isLoadingFollowing;
  const allUsers: Models.Document[] =
    type === 'followers' ? followers || [] : following || [];
  const title = type === 'followers' ? 'Followers' : 'Following';

  // Filter users based on search query
  const users = searchQuery.trim()
    ? allUsers.filter((user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : allUsers;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='bg-dark-2 text-light-1 border-dark-4 p-0 overflow-hidden rounded-xl max-w-md w-full'>
        <DialogHeader className='p-4 border-b border-dark-4'>
          <div className="flex items-center justify-between w-full">
            <DialogTitle className='text-xl font-bold'>{title}</DialogTitle>
          </div>

          {/* Search input */}
          <div className="relative mt-4">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-light-3">
              <Search size={18} />
            </div>
            <Input
              placeholder={`Search ${title.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-dark-3 border-dark-4 text-light-1 rounded-full h-10"
            />
            {searchQuery && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-light-3"
                onClick={() => setSearchQuery('')}
              >
                <X size={16} />
              </button>
            )}
          </div>
        </DialogHeader>

        {/* Results count */}
        {!isLoading && (
          <div className="px-4 py-2 text-sm text-light-3 border-b border-dark-4">
            {users.length} {type}
            {searchQuery ? ` matching "${searchQuery}"` : ''}
          </div>
        )}

        {isLoading ? (
          <div className='flex-center w-full h-[300px]'>
            <Loader className="animate-spin" />
          </div>
        ) : (
          <div className='flex flex-col max-h-[50vh] overflow-y-auto custom-scrollbar'>
            {users.length > 0 ? (
              users.map((user: Models.Document) => (
                <div
                  key={user.$id}
                  className="border-b border-dark-4 last:border-0"
                >
                  <div className='flex items-center justify-between p-4 hover:bg-dark-3 transition-colors'>
                    <Link
                      to={`/profile/${user.$id}`}
                      onClick={onClose}
                      className='flex items-center gap-3 flex-1'
                    >
                      <img
                        src={user.imageUrl || '/assets/icons/profile-placeholder.svg'}
                        alt='profile'
                        className='w-12 h-12 rounded-full object-cover'
                      />
                      <div>
                        <p className='base-medium text-light-1 line-clamp-1'>{user.name}</p>
                        <p className='small-regular text-light-3 line-clamp-1'>
                          @{user.username}
                        </p>
                      </div>
                    </Link>

                    <div className="flex gap-2">
                      {/* Only show message button if not the current user */}
                      {user.$id !== currentUser.id && (
                        <Link
                          to={`/messages`}
                          state={{ initialConversation: user }}
                          onClick={onClose}
                        >
                          <button
                            className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-dark-4 text-light-2"
                          >
                            <MessageCircle size={18} />
                          </button>
                        </Link>
                      )}

                      {/* Only show follow button if not the current user */}
                      {user.$id !== currentUser.id && (
                        <FollowButton userId={user.$id} compact={true} />
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <p className='text-light-3 text-center'>
                  {searchQuery
                    ? `No ${type} match your search`
                    : `No ${type} yet`
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FollowModal;