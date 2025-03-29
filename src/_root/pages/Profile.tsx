import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  useGetUserById,
  useGetUserPosts,
  useGetFollowers,
  useGetFollowing,
  useGetSavedPosts,
  useGetLikedPosts,
} from '@/lib/react-query/queries';
import GridPostList from '@/components/shared/GridPostList';
import Loader from '@/components/shared/Loader';
import { Button } from '@/components/ui/button';
import { useUserContext } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FollowButton from '@/components/shared/FollowButton';
import FollowModal from '@/components/shared/FollowModal';
import {
  MessageCircle,
  Edit3,
  Calendar,
  ChevronLeft,
  Share2,
  Grid,
  Heart,
  Bookmark,
} from 'lucide-react';
import { motion } from 'framer-motion';

const Profile = () => {
  // Get profile ID from URL parameters
  const { id } = useParams();
  const navigate = useNavigate();

  // Get current user from auth context
  const { user } = useUserContext();

  // State for followers/following modal and animations
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [followModalType, setFollowModalType] = useState<
    'followers' | 'following'
  >('followers');
  const [activeTab, setActiveTab] = useState('posts');
  const [scrollPosition, setScrollPosition] = useState(0);

  // Fetch profile data using React Query hooks
  const { data: currentUser, isLoading: isUserLoading } = useGetUserById(
    id || ''
  );
  const { data: userPosts, isLoading: isPostLoading } = useGetUserPosts(id);
  const { data: followers } = useGetFollowers(id || '');
  const { data: following } = useGetFollowing(id || '');
  const { data: savedPosts, isLoading: isSavedLoading } = useGetSavedPosts(
    user.id
  );
  const { data: likedPosts, isLoading: isLikedLoading } = useGetLikedPosts(
    user.id
  );

  // Track scroll position for subtle parallax effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Function to parse cover position
  const getCoverPosition = () => {
    if (!currentUser?.coverPosition) return { x: 0, y: 0 };
    try {
      return JSON.parse(currentUser.coverPosition);
    } catch (error) {
      console.error('Error parsing cover position:', error);
      return { x: 0, y: 0 };
    }
  };

  // Handler to open followers/following modal
  const handleShowFollowModal = (type: 'followers' | 'following') => {
    setFollowModalType(type);
    setShowFollowModal(true);
  };

  // Format join date
  const formatJoinDate = () => {
    if (!currentUser?.$createdAt) return '';
    try {
      const date = new Date(currentUser.$createdAt);
      return date.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  // Handle share profile
  const handleShareProfile = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `${currentUser?.name || 'User'}'s Profile on Horizon`,
          text: `Check out ${currentUser?.name || 'this user'}'s profile on Horizon!`,
          url: window.location.href,
        })
        .catch((err) => {
          console.log('Error sharing:', err);
        });
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(window.location.href);
      // You would show a toast notification here
      alert('Profile link copied to clipboard!');
    }
  };

  // Show loading state while fetching user data
  if (isUserLoading) {
    return (
      <div className='flex-center w-full h-full'>
        <Loader />
      </div>
    );
  }

  // Handle case where user is not found
  if (!currentUser) {
    return (
      <div className='flex-center w-full h-full'>
        <p className='text-light-3'>User not found</p>
      </div>
    );
  }

  const isOwnProfile = currentUser.$id === user.id;

  // Calculate post stats
  const postCount = userPosts?.documents?.length || 0;
  const followersCount = followers?.length || 0;
  const followingCount = following?.length || 0;

  return (
    <div className='flex flex-1 relative'>
      {/* Back button - fixed position for mobile */}
      <button
        onClick={() => navigate(-1)}
        className='fixed top-5 left-5 z-20 md:absolute bg-dark-2 bg-opacity-70 hover:bg-opacity-100 p-2 rounded-full transition-all'
      >
        <ChevronLeft className='text-light-1 w-5 h-5' />
      </button>

      <div className='common-container'>
        <div className='flex flex-col items-center max-w-5xl w-full mx-auto'>
          {/* Profile Cover/Banner Image with subtle parallax */}
          <div className='w-full h-64 bg-dark-3 overflow-hidden rounded-b-xl relative'>
            {currentUser.coverImageUrl ? (
              <div className='w-full h-full overflow-hidden'>
                <img
                  src={currentUser.coverImageUrl}
                  alt='cover'
                  className='w-full h-full object-cover transition-all duration-200'
                  style={{
                    objectPosition: `center ${getCoverPosition().y}%`,
                    transform: `translateY(${scrollPosition * 0.1}px)`,
                  }}
                />
                <div className='absolute inset-0 bg-gradient-to-t from-dark-1 to-transparent opacity-40'></div>
              </div>
            ) : (
              // Gradient background if no cover image
              <div className='w-full h-full bg-gradient-to-r from-primary-600 via-purple-600 to-primary-600 rounded-b-xl relative overflow-hidden'>
                <div
                  className='absolute inset-0 bg-[url("/assets/images/bg-pattern.svg")] opacity-10'
                  style={{
                    backgroundSize: '200px',
                    backgroundRepeat: 'repeat',
                  }}
                ></div>
                <div className='absolute inset-0 bg-gradient-to-t from-dark-1 to-transparent opacity-40'></div>
              </div>
            )}

            {/* Profile actions - positioned in top-right of cover */}
            <div className='absolute top-4 right-4 flex gap-2'>
              {/* Share button */}
              <Button
                variant='ghost'
                size='icon'
                className='bg-dark-4 bg-opacity-60 hover:bg-opacity-100 text-light-1 rounded-full h-8 w-8'
                onClick={handleShareProfile}
                title='Share profile'
              >
                <Share2 size={14} />
              </Button>

              {/* Edit cover button - only shows on user's own profile */}
              {isOwnProfile && (
                <Link
                  to={`/update-profile/${currentUser.$id}`}
                  className='bg-dark-4 bg-opacity-60 hover:bg-opacity-100 text-light-1 rounded-full h-8 w-8 flex items-center justify-center'
                  title='Edit profile'
                >
                  <Edit3 size={14} />
                </Link>
              )}
            </div>
          </div>

          {/* Profile Header Section */}
          <div className='flex flex-col items-center -mt-16 gap-6 w-full px-4'>
            {/* Profile Image with subtle border */}
            <div className='relative'>
              <div className='w-32 h-32 rounded-full overflow-hidden border-4 border-dark-1 relative z-10'>
                <img
                  src={
                    currentUser.imageUrl ||
                    '/assets/icons/profile-placeholder.svg'
                  }
                  alt='profile'
                  className='w-full h-full object-cover'
                />
              </div>
              {/* Subtle gradient ring around profile image - only for owner */}
              {isOwnProfile && (
                <div
                  className='absolute inset-0 rounded-full bg-gradient-to-r from-primary-500 via-purple-500 to-primary-500 p-1 -z-0'
                  style={{
                    width: 'calc(100% + 6px)',
                    height: 'calc(100% + 6px)',
                    top: '-3px',
                    left: '-3px',
                  }}
                ></div>
              )}
            </div>

            {/* Name and Username */}
            <div className='flex flex-col items-center'>
              <h2 className='h3-bold md:h2-bold text-center text-light-1'>
                {currentUser.name}
              </h2>
              <p className='small-regular md:base-regular text-light-3 text-center'>
                @{currentUser.username}
              </p>

              {/* Join date */}
              <div className='flex items-center mt-1 text-light-4 text-xs gap-1'>
                <Calendar size={12} />
                <span>Joined {formatJoinDate()}</span>
              </div>
            </div>

            {/* User Bio with styling */}
            {currentUser.bio && (
              <p className='text-light-2 text-center max-w-lg px-4'>
                {currentUser.bio}
              </p>
            )}

            {/* Edit Profile or Follow Button */}
            <div className='flex gap-3'>
              {isOwnProfile ? (
                // Show Edit Profile button for own profile
                <Link to={`/update-profile/${currentUser.$id}`}>
                  <Button
                    variant='outline'
                    className='rounded-full px-6 border-dark-4 hover:bg-dark-3 transition-all'
                  >
                    <Edit3 size={16} className='mr-2' /> Edit Profile
                  </Button>
                </Link>
              ) : (
                // For other users' profiles, show Follow/Unfollow and Message buttons
                <>
                  <FollowButton userId={currentUser.$id} />

                  {/* Message button */}
                  <Link
                    to={`/messages`}
                    state={{ initialConversation: currentUser }}
                  >
                    <Button
                      variant='secondary'
                      className='rounded-full bg-dark-3 hover:bg-dark-4 transition-all'
                    >
                      <MessageCircle size={18} className='mr-2' />
                      Message
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* User Stats with improved visual design */}
            <div className='flex gap-8 py-3 px-6 bg-dark-3 rounded-full shadow-sm'>
              {/* Posts count */}
              <div className='flex-center gap-2'>
                <p className='small-semibold lg:body-bold text-primary-500'>
                  {postCount}
                </p>
                <p className='small-medium lg:base-medium text-light-2'>
                  Posts
                </p>
              </div>

              {/* Followers count with modal trigger */}
              <button
                className='flex-center gap-2'
                onClick={() => handleShowFollowModal('followers')}
              >
                <p className='small-semibold lg:body-bold text-primary-500'>
                  {followersCount}
                </p>
                <p className='small-medium lg:base-medium text-light-2'>
                  Followers
                </p>
              </button>

              {/* Following count with modal trigger */}
              <button
                className='flex-center gap-2'
                onClick={() => handleShowFollowModal('following')}
              >
                <p className='small-semibold lg:body-bold text-primary-500'>
                  {followingCount}
                </p>
                <p className='small-medium lg:base-medium text-light-2'>
                  Following
                </p>
              </button>
            </div>
          </div>

          {/* Posts, Liked Posts, and Saved Posts Tabs */}
          <div className='w-full mt-6'>
            <Tabs
              defaultValue='posts'
              className='w-full'
              value={activeTab}
              onValueChange={setActiveTab}
            >
              {/* Tab Navigation */}
              <TabsList className='w-full flex gap-4 bg-dark-3 p-1 rounded-full mb-8'>
                <TabsTrigger
                  value='posts'
                  className='group w-full py-3 rounded-full data-[state=active]:bg-primary-500 transition-all'
                >
                  <div className='flex-center gap-2'>
                    <Grid
                      size={18}
                      className='group-data-[state=active]:text-white text-light-3'
                    />
                    <p className='group-data-[state=active]:text-white text-light-2'>
                      Posts
                    </p>
                  </div>
                </TabsTrigger>

                {/* Show Liked posts tab on user's own profile */}
                {isOwnProfile && (
                  <TabsTrigger
                    value='liked'
                    className='group w-full py-3 rounded-full data-[state=active]:bg-primary-500 transition-all'
                  >
                    <div className='flex-center gap-2'>
                      <Heart
                        size={18}
                        className='group-data-[state=active]:text-white text-light-3'
                      />
                      <p className='group-data-[state=active]:text-white text-light-2'>
                        Liked
                      </p>
                    </div>
                  </TabsTrigger>
                )}

                {/* Show Saved tab on user's own profile */}
                {isOwnProfile && (
                  <TabsTrigger
                    value='saved'
                    className='group w-full py-3 rounded-full data-[state=active]:bg-primary-500 transition-all'
                  >
                    <div className='flex-center gap-2'>
                      <Bookmark
                        size={18}
                        className='group-data-[state=active]:text-white text-light-3'
                      />
                      <p className='group-data-[state=active]:text-white text-light-2'>
                        Saved
                      </p>
                    </div>
                  </TabsTrigger>
                )}
              </TabsList>

              {/* Tab Content */}
              <div className='mt-6'>
                {/* User's Own Posts Tab */}
                <TabsContent value='posts' className='w-full'>
                  {isPostLoading ? (
                    // Show loader while fetching posts
                    <div className='flex-center w-full h-40'>
                      <Loader />
                    </div>
                  ) : (
                    <>
                      {userPosts?.documents &&
                      userPosts.documents.length > 0 ? (
                        // Display posts in grid layout if available
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <GridPostList
                            posts={userPosts.documents}
                            showStats={true}
                          />
                        </motion.div>
                      ) : (
                        // Show empty state message if no posts
                        <div className='flex-center flex-col gap-4 py-10 bg-dark-3 bg-opacity-30 rounded-2xl border border-dark-4 p-8'>
                          <img
                            src='/assets/icons/gallery-add.svg'
                            alt='No posts'
                            className='w-16 h-16 opacity-30'
                          />
                          <p className='text-light-4 text-center max-w-md'>
                            {isOwnProfile
                              ? "You haven't shared any posts yet. Start capturing and sharing moments!"
                              : `${currentUser.name} hasn't shared any posts yet.`}
                          </p>
                          {isOwnProfile && (
                            <Link to='/create-post'>
                              <Button className='mt-4 bg-primary-500 hover:bg-primary-600 text-white rounded-full px-6'>
                                Create your first post
                              </Button>
                            </Link>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </TabsContent>

                {/* Liked Posts Tab (only visible on own profile) */}
                {isOwnProfile && (
                  <TabsContent value='liked'>
                    {isLikedLoading ? (
                      <div className='flex-center w-full h-40'>
                        <Loader />
                      </div>
                    ) : (
                      <>
                        {likedPosts && likedPosts.length > 0 ? (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <GridPostList
                              posts={likedPosts}
                              showStats={true}
                              showUser={true}
                            />
                          </motion.div>
                        ) : (
                          // Enhanced empty state for likes
                          <div className='flex-center flex-col gap-4 py-10 bg-dark-3 bg-opacity-30 rounded-2xl border border-dark-4 p-8'>
                            <Heart
                              size={36}
                              className='text-light-3 opacity-30'
                            />
                            <p className='text-light-4 text-center max-w-md'>
                              You haven't liked any posts yet. Explore and find
                              content you enjoy!
                            </p>
                            <Link to='/explore'>
                              <Button
                                variant='secondary'
                                className='mt-4 bg-dark-4 hover:bg-dark-3 text-light-1 rounded-full px-6'
                              >
                                Explore posts
                              </Button>
                            </Link>
                          </div>
                        )}
                      </>
                    )}
                  </TabsContent>
                )}

                {/* Saved Posts Tab (only visible on own profile) */}
                {isOwnProfile && (
                  <TabsContent value='saved'>
                    {isSavedLoading ? (
                      <div className='flex-center w-full h-40'>
                        <Loader />
                      </div>
                    ) : (
                      <>
                        {savedPosts && savedPosts.length > 0 ? (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <GridPostList
                              posts={savedPosts}
                              showStats={true}
                              showUser={true}
                            />
                          </motion.div>
                        ) : (
                          // Enhanced empty state for saved posts
                          <div className='flex-center flex-col gap-4 py-10 bg-dark-3 bg-opacity-30 rounded-2xl border border-dark-4 p-8'>
                            <Bookmark
                              size={36}
                              className='text-light-3 opacity-30'
                            />
                            <p className='text-light-4 text-center max-w-md'>
                              You haven't saved any posts yet. Bookmark posts to
                              revisit them later!
                            </p>
                            <Link to='/explore'>
                              <Button
                                variant='secondary'
                                className='mt-4 bg-dark-4 hover:bg-dark-3 text-light-1 rounded-full px-6'
                              >
                                Explore posts
                              </Button>
                            </Link>
                          </div>
                        )}
                      </>
                    )}
                  </TabsContent>
                )}
              </div>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Followers/Following Modal - shown when triggered */}
      <FollowModal
        userId={currentUser.$id}
        type={followModalType}
        isOpen={showFollowModal}
        onClose={() => setShowFollowModal(false)}
      />
    </div>
  );
};

export default Profile;
