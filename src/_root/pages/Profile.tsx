import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  useGetUserById,
  useGetUserPosts,
  useGetFollowers,
  useGetFollowing,
} from '@/lib/react-query/queries';
import GridPostList from '@/components/shared/GridPostList';
import { Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserContext } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FollowButton from '@/components/shared/FollowButton';
import FollowModal from '@/components/shared/FollowModal';

const Profile = () => {
  // Get profile ID from URL parameters
  const { id } = useParams();

  // Get current user from auth context
  const { user } = useUserContext();

  // State for followers/following modal
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [followModalType, setFollowModalType] = useState<'followers' | 'following'>('followers');

  // Fetch profile data using React Query hooks
  const { data: currentUser, isLoading: isUserLoading } = useGetUserById(id || '');
  const { data: userPosts, isLoading: isPostLoading } = useGetUserPosts(id);
  const { data: followers } = useGetFollowers(id || '');
  const { data: following } = useGetFollowing(id || '');

  // Handler to open followers/following modal
  const handleShowFollowModal = (type: 'followers' | 'following') => {
    setFollowModalType(type);
    setShowFollowModal(true);
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

  return (
    <div className='flex flex-1'>
      <div className='common-container'>
        <div className='flex flex-col items-center max-w-5xl w-full mx-auto gap-8 md:gap-12'>
          {/* Profile Header Section */}
          <div className='flex flex-col items-center gap-6 w-full'>
            {/* Profile Image */}
            <div className='relative w-28 h-28 rounded-full overflow-hidden'>
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
            </div>

            {/* Edit Profile or Follow Button */}
            {currentUser.$id === user.id ? (
              // Show Edit Profile button for own profile
              <Link to={`/update-profile/${currentUser.$id}`}>
                <Button variant='ghost' className='shad-button_ghost'>
                  Edit Profile
                </Button>
              </Link>
            ) : (
              // Show Follow/Unfollow button for other profiles
              <FollowButton userId={currentUser.$id} />
            )}

            {/* User Stats (Posts, Followers, Following) */}
            <div className='flex gap-8'>
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

            {/* User Bio (if available) */}
            {currentUser.bio && (
              <p className='text-light-2 text-center max-w-lg'>
                {currentUser.bio}
              </p>
            )}
          </div>

          {/* Posts and Liked Posts Tabs */}
          <div className='w-full'>
            <Tabs defaultValue='posts' className='w-full'>
              {/* Tab Navigation */}
              <TabsList className='w-full flex gap-4 bg-dark-2 p-1 rounded-xl'>
                <TabsTrigger
                  value='posts'
                  className='w-full py-4 rounded-lg data-[state=active]:bg-primary-500'
                >
                  <div className='flex-center gap-2'>
                    <img
                      src='/assets/icons/posts.svg'
                      alt='posts'
                      width={20}
                      height={20}
                    />
                    <p>Posts</p>
                  </div>
                </TabsTrigger>

                {/* Only show Liked Posts tab on user's own profile */}
                {currentUser.$id === user.id && (
                  <TabsTrigger
                    value='liked'
                    className='w-full py-4 rounded-lg data-[state=active]:bg-primary-500'
                  >
                    <div className='flex-center gap-2'>
                      <img
                        src='/assets/icons/like.svg'
                        alt='liked'
                        width={20}
                        height={20}
                      />
                      <p>Liked Posts</p>
                    </div>
                  </TabsTrigger>
                )}
              </TabsList>

              {/* Tab Content */}
              <div className='mt-8'>
                {/* User's Own Posts Tab */}
                <TabsContent value='posts'>
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
                        <GridPostList
                          posts={userPosts.documents}
                          showStats={false}
                        />
                      ) : (
                        // Show empty state message if no posts
                        <p className='text-light-4 text-center w-full'>
                          No posts yet
                        </p>
                      )}
                    </>
                  )}
                </TabsContent>

                {/* Liked Posts Tab (only visible on own profile) */}
                {currentUser.$id === user.id && (
                  <TabsContent value='liked'>
                    {currentUser.liked && currentUser.liked.length > 0 ? (
                      // Display liked posts in grid layout if available
                      <GridPostList
                        posts={currentUser.liked}
                        showStats={false}
                        showUser={true}
                      />
                    ) : (
                      // Show empty state message if no liked posts
                      <p className='text-light-4 text-center w-full'>
                        No liked posts yet
                      </p>
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