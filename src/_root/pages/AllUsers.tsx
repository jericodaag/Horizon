import { useState, useMemo, useCallback } from 'react';
import { useGetUsers, useGetTopCreators } from '@/lib/react-query/queries';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserContext } from '@/context/AuthContext';
import FollowButton from '@/components/shared/FollowButton';
import FollowModal from '@/components/shared/FollowModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Users,
  UserPlus,
  X,
  MessagesSquare,
  Zap,
  Filter,
  ChevronDown,
  User,
  MapPin,
  Calendar,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const AllUsers = () => {
  const { user: currentUser } = useUserContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [activeTab, setActiveTab] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'followers' | 'following'>(
    'followers'
  );

  // Fetch all users and top creators
  const { data: usersData, isLoading: isLoadingUsers } = useGetUsers();
  const { data: topCreators, isLoading: isLoadingCreators } =
    useGetTopCreators(8);

  // Format date helper - show complete date
  const formatDate = useCallback((dateString: string) => {
    try {
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      };
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', options);
    } catch (e) {
      return 'Recently joined';
    }
  }, []);

  // Process users with useMemo for better performance
  const displayedUsers = useMemo(() => {
    if (!usersData?.documents) return [];

    let filteredUsers = [...usersData.documents];

    // Filter out current user
    filteredUsers = filteredUsers.filter((user) => user.$id !== currentUser.id);

    // Apply search filter
    if (searchTerm) {
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.bio &&
            user.bio.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply tab filter
    if (activeTab === 'suggested') {
      // For "Suggested" tab, we prioritize:
      // 1. Users with the most followers (popular creators)
      // 2. Users who share similar interests (based on top creators)

      if (topCreators && topCreators.length) {
        // Get IDs of top creators to highlight them
        const topCreatorIds = topCreators.map((creator) => creator.$id);

        // First, include users who are top creators
        const topUsers = filteredUsers.filter((user) =>
          topCreatorIds.includes(user.$id)
        );

        // Then, add other users sorted by follower count (most popular first)
        const otherUsers = filteredUsers
          .filter((user) => !topCreatorIds.includes(user.$id))
          .sort((a, b) => (b.followerCount || 0) - (a.followerCount || 0));

        // Combine both lists
        filteredUsers = [...topUsers, ...otherUsers].slice(0, 20); // Limit to 20 suggestions
      } else {
        // If no top creators available, just sort by follower count
        filteredUsers.sort(
          (a, b) => (b.followerCount || 0) - (a.followerCount || 0)
        );
        filteredUsers = filteredUsers.slice(0, 20); // Limit to 20 suggestions
      }
    } else {
      // Apply sort for the "All" tab
      if (sortBy === 'newest') {
        filteredUsers.sort(
          (a, b) =>
            new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
        );
      } else if (sortBy === 'popular') {
        filteredUsers.sort(
          (a, b) => (b.followerCount || 0) - (a.followerCount || 0)
        );
      }
    }

    return filteredUsers;
  }, [usersData, searchTerm, sortBy, activeTab, topCreators, currentUser.id]);

  // Modal handlers with immediate rendering
  const openFollowersModal = useCallback((type: 'followers' | 'following') => {
    // Set type first, then open modal to ensure correct content on open
    setModalType(type);
    setTimeout(() => {
      setModalOpen(true);
    }, 0);
  }, []);

  // Custom sort dropdown component
  const SortDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className='relative'>
        <Button
          variant='outline'
          className='gap-2 border-dark-4'
          onClick={() => setIsOpen(!isOpen)}
        >
          <Filter size={16} />
          <span>{sortBy === 'newest' ? 'Newest' : 'Most Followers'}</span>
          <ChevronDown size={14} />
        </Button>

        {isOpen && (
          <div className='absolute top-full right-0 mt-1 w-36 bg-dark-2 border border-dark-4 rounded-md shadow-lg z-10'>
            <button
              className='w-full text-left px-3 py-2 hover:bg-dark-3 text-light-1 text-sm'
              onClick={() => {
                setSortBy('newest');
                setIsOpen(false);
              }}
            >
              Newest
            </button>
            <button
              className='w-full text-left px-3 py-2 hover:bg-dark-3 text-light-1 text-sm'
              onClick={() => {
                setSortBy('popular');
                setIsOpen(false);
              }}
            >
              Most Followers
            </button>
          </div>
        )}
      </div>
    );
  };

  // Generate shimmer loading state
  const renderLoading = () => (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
      {Array(8)
        .fill(0)
        .map((_, index) => (
          <div
            key={index}
            className='bg-dark-2 rounded-xl p-5 flex flex-col gap-3 border border-dark-4'
          >
            <div className='flex items-center gap-3'>
              <div className='w-16 h-16 rounded-full bg-dark-3 animate-pulse'></div>
              <div className='flex-1'>
                <div className='h-4 w-2/3 bg-dark-3 rounded animate-pulse mb-2'></div>
                <div className='h-3 w-1/2 bg-dark-3 rounded animate-pulse'></div>
              </div>
            </div>
            <div className='h-3 w-4/5 bg-dark-3 rounded animate-pulse mt-2'></div>
            <div className='flex justify-between mt-4'>
              <div className='h-8 w-24 bg-dark-3 rounded-full animate-pulse'></div>
              <div className='h-8 w-8 bg-dark-3 rounded-full animate-pulse'></div>
            </div>
          </div>
        ))}
    </div>
  );

  return (
    <div className='flex-1 h-screen overflow-y-auto hide-scrollbar p-4 md:p-8 pb-20'>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className='max-w-7xl mx-auto'
      >
        {/* Header Section */}
        <section className='mb-8'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <h1 className='text-2xl md:text-3xl font-bold text-light-1'>
                Discover People
              </h1>
              <p className='text-light-3 mt-1'>
                Connect with creators and build your network
              </p>
            </div>

            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => openFollowersModal('followers')}
                className='gap-2 border-dark-4'
              >
                <Users size={16} />
                <span>Your Followers</span>
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => openFollowersModal('following')}
                className='gap-2 border-dark-4'
              >
                <UserPlus size={16} />
                <span>Following</span>
              </Button>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className='flex flex-col sm:flex-row gap-3 mt-6'>
            <div className='relative flex-1'>
              <Search
                className='absolute left-3 top-1/2 -translate-y-1/2 text-light-3 pointer-events-none'
                size={18}
              />
              <Input
                type='text'
                placeholder='Search by name, username, or bio...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10 bg-dark-3 border-dark-4 text-light-1 rounded-lg w-full'
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-light-3 hover:text-light-1'
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className='flex gap-2'>
              <SortDropdown />
            </div>
          </div>
        </section>

        {/* Tabs */}
        <Tabs
          defaultValue='all'
          value={activeTab}
          onValueChange={setActiveTab}
          className='mb-8'
        >
          <TabsList className='bg-dark-3 p-1 rounded-full h-auto'>
            <TabsTrigger
              value='all'
              className='rounded-full data-[state=active]:bg-primary-500 data-[state=active]:text-light-1'
            >
              <User className='w-4 h-4 mr-1' />
              All Users
            </TabsTrigger>
            <TabsTrigger
              value='suggested'
              className='rounded-full data-[state=active]:bg-primary-500 data-[state=active]:text-light-1'
            >
              <Zap className='w-4 h-4 mr-1' />
              Top Creators
            </TabsTrigger>
          </TabsList>

          {/* Tab Content */}
          <TabsContent value='all' className='mt-6'>
            {isLoadingUsers ? (
              renderLoading()
            ) : displayedUsers.length > 0 ? (
              <UserGrid users={displayedUsers} formatDate={formatDate} />
            ) : (
              <EmptyState searchTerm={searchTerm} />
            )}
          </TabsContent>

          <TabsContent value='suggested' className='mt-6'>
            {isLoadingCreators ? (
              renderLoading()
            ) : displayedUsers.length > 0 ? (
              <UserGrid users={displayedUsers} formatDate={formatDate} />
            ) : (
              <EmptyState searchTerm={searchTerm} type='suggested' />
            )}
          </TabsContent>
        </Tabs>

        {/* Follow Modal */}
        {modalOpen && (
          <FollowModal
            userId={currentUser.id}
            type={modalType}
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
          />
        )}
      </motion.div>
    </div>
  );
};

// Props interface for UserGrid
interface UserGridProps {
  users: any[];
  formatDate: (date: string) => string;
}

const UserGrid = ({ users, formatDate }: UserGridProps) => {
  // Use useMemo to optimize grid rendering
  const gridItems = useMemo(() => {
    return users.map((user) => (
      <UserCard key={user.$id} user={user} formatDate={formatDate} />
    ));
  }, [users, formatDate]);

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
      <AnimatePresence>{gridItems}</AnimatePresence>
    </div>
  );
};

// Props interface for UserCard
interface UserCardProps {
  user: any;
  formatDate: (date: string) => string;
}

const UserCard = ({ user, formatDate }: UserCardProps) => {
  const navigate = useNavigate();

  // Memoize the formatted date to prevent recalculations
  const formattedDate = useMemo(() => {
    return user.$createdAt ? formatDate(user.$createdAt) : 'recently';
  }, [user.$createdAt, formatDate]);

  // Create a memoized navigation handler
  const handleMessageClick = useCallback(() => {
    navigate('/messages', { state: { initialConversation: user } });
  }, [navigate, user]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className='bg-dark-2 rounded-xl border border-dark-4 overflow-hidden hover:shadow-lg hover:shadow-primary-500/5 transition-all'
    >
      {/* Cover image or gradient background */}
      <div
        className='h-24 bg-gradient-to-r from-primary-500/20 to-purple-500/20 relative'
        style={
          user.coverImageUrl
            ? {
                backgroundImage: `url(${user.coverImageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : {}
        }
      >
        {/* User stats overlay */}
        <div className='absolute top-2 right-3'>
          <div className='bg-dark-1/70 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1'>
            <img
              src='/assets/icons/posts.svg'
              alt='posts'
              className='w-3.5 h-3.5'
            />
            <span className='text-xs font-medium text-light-2'>
              {user.posts?.length || 0}
            </span>
          </div>
        </div>
      </div>

      <div className='p-5 pt-0 relative'>
        {/* Profile image */}
        <div className='flex justify-between items-end -mt-8 mb-3'>
          <Link to={`/profile/${user.$id}`}>
            <img
              src={user.imageUrl || '/assets/icons/profile-placeholder.svg'}
              alt={user.name}
              className='w-16 h-16 rounded-full border-4 border-dark-2 object-cover'
            />
          </Link>

          {/* Join date with fixed width to prevent overlap */}
          <div className='flex items-center text-light-3 text-xs max-w-[150px] truncate ml-2'>
            <Calendar size={12} className='mr-1 flex-shrink-0' />
            <span className='truncate'>Joined {formattedDate}</span>
          </div>
        </div>

        {/* User info */}
        <Link to={`/profile/${user.$id}`}>
          <h3 className='font-bold text-light-1 hover:text-primary-500 transition-colors'>
            {user.name}
          </h3>
          <p className='text-light-3 text-sm mb-2'>@{user.username}</p>
        </Link>

        {/* Bio with truncation */}
        {user.bio && (
          <p className='text-light-2 text-sm line-clamp-2 mb-3'>{user.bio}</p>
        )}

        {/* Location if available */}
        {user.location && (
          <div className='flex items-center text-light-3 text-xs mb-4'>
            <MapPin size={12} className='mr-1' />
            <span>{user.location}</span>
          </div>
        )}

        {/* Action buttons */}
        <div className='flex justify-between items-center mt-3'>
          <FollowButton userId={user.$id} className='flex-1 mr-2' />

          <Button
            variant='outline'
            size='icon'
            className='h-9 w-9 rounded-full border-dark-4'
            onClick={handleMessageClick}
          >
            <MessagesSquare size={16} className='text-light-2' />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

interface EmptyStateProps {
  searchTerm: string;
  type?: string;
}

const EmptyState = ({ searchTerm, type = 'all' }: EmptyStateProps) => {
  return (
    <div className='flex flex-col items-center justify-center py-12 px-4 bg-dark-2 rounded-xl border border-dark-4'>
      <div className='bg-dark-3 p-4 rounded-full mb-4'>
        {searchTerm ? (
          <Search size={32} className='text-light-3' />
        ) : (
          <Users size={32} className='text-light-3' />
        )}
      </div>

      <h3 className='text-light-1 font-bold text-xl mb-2'>
        {searchTerm ? 'No users found' : `No ${type} users available`}
      </h3>

      <p className='text-light-3 text-center max-w-md'>
        {searchTerm
          ? `We couldn't find any users matching "${searchTerm}". Try a different search term.`
          : 'Check back later for more users to connect with, or explore other sections.'}
      </p>
    </div>
  );
};

export default AllUsers;
