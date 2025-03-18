import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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
import { MessageCircle, Edit3, Calendar } from 'lucide-react';

const Profile = () => {
  // Get profile ID from URL parameters
  const { id } = useParams();

  // Get current user from auth context
  const { user } = useUserContext();

  // State for followers/following modal
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [followModalType, setFollowModalType] = useState<
    'followers' | 'following'
  >('followers');

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

  return (
    <div className='flex flex-1'>
      <div className='common-container'>
        <div className='flex flex-col items-center max-w-5xl w-full mx-auto'>
          {/* Profile Cover/Banner Image */}
          <div className='w-full h-64 bg-dark-3 overflow-hidden rounded-b-xl relative'>
            {currentUser.coverImageUrl ? (
              <img
                src={currentUser.coverImageUrl}
                alt='cover'
                className='w-full h-full object-cover'
                style={{
                  objectPosition: `center ${getCoverPosition().y}%`,
                }}
              />
            ) : (
              // Fallback gradient if no cover image
              <div className='w-full h-full bg-gradient-to-r from-primary-600 to-purple-600 rounded-b-xl' />
            )}

            {/* Edit cover button - only shows on user's own profile */}
            {isOwnProfile && (
              <Link
                to={`/update-profile/${currentUser.$id}`}
                className='absolute bottom-4 right-4 bg-dark-4 bg-opacity-70 hover:bg-opacity-100 text-white rounded-lg px-3 py-1.5 text-sm flex items-center transition-colors'
              >
                <Edit3 size={16} className='mr-1.5' /> Edit Cover
              </Link>
            )}
          </div>

          {/* Profile Header Section */}
          <div className='flex flex-col items-center -mt-16 gap-6 w-full'>
            {/* Profile Image */}
            <div className='relative w-32 h-32 rounded-full overflow-hidden border-4 border-dark-1 shadow-lg'>
              <img
                src={
                  currentUser.imageUrl ||
                  '/assets/icons/profile-placeholder.svg'
                }
                alt='profile'
                className='w-full h-full object-cover'
              />
            </div>

            {/* Name and Username */}
            <div className='flex flex-col items-center'>
              <h2 className='h3-bold md:h2-bold text-center'>
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

            {/* User Bio (if available) - moved up */}
            {currentUser.bio && (
              <p className='text-light-2 text-center max-w-lg px-4'>
                {currentUser.bio}
              </p>
            )}

            {/* Edit Profile or Follow Button */}
            {isOwnProfile ? (
              // Show Edit Profile button for own profile
              <Link to={`/update-profile/${currentUser.$id}`}>
                <Button variant='outline' className='rounded-full px-6'>
                  <Edit3 size={16} className='mr-2' /> Edit Profile
                </Button>
              </Link>
            ) : (
              // For other users' profiles, show Follow/Unfollow and Message buttons
              <div className='flex gap-4'>
                <FollowButton userId={currentUser.$id} />

                {/* Message button */}
                <Link
                  to={`/messages`}
                  state={{ initialConversation: currentUser }}
                >
                  <Button variant='secondary' className='rounded-full'>
                    <MessageCircle size={18} className='mr-2' />
                    Message
                  </Button>
                </Link>
              </div>
            )}

            {/* User Stats (Posts, Followers, Following) */}
            <div className='flex gap-8 py-3 px-6 bg-dark-3 rounded-full shadow-sm'>
              {/* Posts count */}
              <div className='flex-center gap-2'>
                <p className='small-semibold lg:body-bold text-primary-500'>
                  {userPosts?.documents?.length || 0}
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
                  {followers?.length || 0}
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
                  {following?.length || 0}
                </p>
                <p className='small-medium lg:base-medium text-light-2'>
                  Following
                </p>
              </button>
            </div>
          </div>

          {/* Posts, Liked Posts, and Saved Posts Tabs */}
          <div className='w-full mt-10'>
            <Tabs defaultValue='posts' className='w-full'>
              {/* Tab Navigation */}
              {/* Tab Navigation */}
              <TabsList className='w-full flex gap-4 bg-dark-3 p-1 rounded-full mb-8'>
                <TabsTrigger
                  value='posts'
                  className='group w-full py-3 rounded-full data-[state=active]:bg-primary-500 transition-all'
                >
                  <div className='flex-center gap-2'>
                    <img
                      src='/assets/icons/posts.svg'
                      alt='posts'
                      width={20}
                      height={20}
                      className='group-data-[state=active]:invert-white'
                    />
                    <p className='group-data-[state=active]:text-white'>Posts</p>
                  </div>
                </TabsTrigger>

                {/* Show Liked posts tab on user's own profile */}
                {isOwnProfile && (
                  <TabsTrigger
                    value='liked'
                    className='group w-full py-3 rounded-full data-[state=active]:bg-primary-500 transition-all'
                  >
                    <div className='flex-center gap-2'>
                      <img
                        src='/assets/icons/like.svg'
                        alt='liked'
                        width={20}
                        height={20}
                        className='group-data-[state=active]:invert-white'
                      />
                      <p className='group-data-[state=active]:text-white'>Liked</p>
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
                      <img
                        src='/assets/icons/save.svg'
                        alt='saved'
                        width={20}
                        height={20}
                        className='group-data-[state=active]:invert-white'
                      />
                      <p className='group-data-[state=active]:text-white'>Saved</p>
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
                        <div>
                          <GridPostList
                            posts={userPosts.documents}
                            showStats={true}
                          />
                        </div>
                      ) : (
                        // Show empty state message if no posts
                        <div className='flex-center flex-col gap-4 py-10'>
                          <img
                            src='/assets/icons/gallery-add.svg'
                            alt='No posts'
                            className='w-16 h-16 opacity-30'
                          />
                          <p className='text-light-4 text-center'>
                            No posts yet
                          </p>
                          {isOwnProfile && (
                            <Link to='/create-post'>
                              <Button variant='secondary' className='mt-2'>
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
                          // Display liked posts in grid layout if available
                          <div>
                            <GridPostList
                              posts={likedPosts}
                              showStats={true}
                              showUser={true}
                            />
                          </div>
                        ) : (
                          // Show empty state message if no liked posts
                          <div className='flex-center flex-col gap-4 py-10'>
                            <img
                              src='/assets/icons/like.svg'
                              alt='No liked posts'
                              className='w-16 h-16 opacity-30'
                            />
                            <p className='text-light-4 text-center'>
                              No liked posts yet
                            </p>
                            <Link to='/explore'>
                              <Button variant='secondary' className='mt-2'>
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
                          // Display saved posts in grid layout if available
                          <div>
                            <GridPostList
                              posts={savedPosts}
                              showStats={true}
                              showUser={true}
                            />
                          </div>
                        ) : (
                          // Show empty state message if no saved posts
                          <div className='flex-center flex-col gap-4 py-10'>
                            <img
                              src='/assets/icons/save.svg'
                              alt='No saved posts'
                              className='w-16 h-16 opacity-30'
                            />
                            <p className='text-light-4 text-center'>
                              No saved posts yet
                            </p>
                            <Link to='/explore'>
                              <Button variant='secondary' className='mt-2'>
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