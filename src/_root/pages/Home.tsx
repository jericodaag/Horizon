import { useState, useEffect, useRef } from 'react';
import { useGetRecentPosts, useGetUsers } from '@/lib/react-query/queries';
import { Models } from 'appwrite';
import PostCard from '@/components/shared/PostCard';
import PostCardSkeleton from '@/components/shared/PostCardSkeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  ArrowUp,
  PlusCircle,
  TrendingUp,
  UserPlus,
  Hash,
  Clock,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useUserContext } from '@/context/AuthContext';
import FollowButton from '@/components/shared/FollowButton';
import { multiFormatDateString } from '@/lib/utils';
import ModeToggle from '@/components/shared/ModeToggle';

const Home = () => {
  const { user } = useUserContext();
  const { data: posts, isPending: isPostLoading } = useGetRecentPosts();
  const { data: allUsers, isLoading: isAllUsersLoading } = useGetUsers(10);

  // Refs for scroll synchronization
  const mainContentRef = useRef<HTMLDivElement>(null);
  const leftSidebarRef = useRef<HTMLDivElement>(null);
  const rightSidebarRef = useRef<HTMLDivElement>(null);

  // State management
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [displayedPosts, setDisplayedPosts] = useState<Models.Document[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<Models.Document[]>([]);

  // Infinite scroll with intersection observer
  const { ref: loadMoreRef, inView } = useInView();
  const postsPerPage = 5;

  // Trending topics data
  const trendingTopics = [
    { tag: 'photography', postCount: 1240 },
    { tag: 'design', postCount: 980 },
    { tag: 'travel', postCount: 843 },
    { tag: 'coding', postCount: 712 },
    { tag: 'gaming', postCount: 529 },
  ];

  // Prepare suggested users - randomly shuffled
  useEffect(() => {
    if (allUsers?.documents) {
      // Filter out current user
      const filtered = allUsers.documents.filter(
        (suggestedUser) => suggestedUser.$id !== user.id
      );

      // Randomly shuffle the users
      const shuffled = [...filtered].sort(() => 0.5 - Math.random());

      // Get first 5 users after shuffling
      setSuggestedUsers(shuffled.slice(0, 5));
    }
  }, [allUsers, user.id]);

  // Prepare recent activities data from posts
  useEffect(() => {
    if (posts?.documents) {
      // Sort posts by creation date (newest first)
      const sortedPosts = [...posts.documents].sort(
        (a, b) =>
          new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
      );

      // Take the 3 most recent posts
      const recent = sortedPosts.slice(0, 3).map((post) => {
        return {
          userId: post.creator.$id,
          username: post.creator.username || 'user',
          imageUrl:
            post.creator.imageUrl || '/assets/icons/profile-placeholder.svg',
          action: 'posted a new photo',
          time: multiFormatDateString(post.$createdAt),
          postId: post.$id,
        };
      });

      setRecentActivities(recent);
    }
  }, [posts]);

  // Update displayed posts when data loads
  useEffect(() => {
    if (posts?.documents && !isPostLoading) {
      if (page === 1) {
        setDisplayedPosts(posts.documents.slice(0, postsPerPage));
      } else {
        setDisplayedPosts((prevPosts) => {
          const newPosts = posts.documents.slice(
            (page - 1) * postsPerPage,
            page * postsPerPage
          );
          // Filter out duplicates
          return [
            ...prevPosts,
            ...newPosts.filter(
              (newPost) =>
                !prevPosts.some(
                  (existingPost) => existingPost.$id === newPost.$id
                )
            ),
          ];
        });
      }

      // Check if we've reached the end of available posts
      setHasMore(page * postsPerPage < posts.documents.length);
    }
  }, [posts, page, isPostLoading]);

  // Handle loading more posts when scroll reaches the bottom
  useEffect(() => {
    if (inView && hasMore && !isPostLoading) {
      setPage((prevPage) => prevPage + 1);
    }
  }, [inView, hasMore, isPostLoading]);

  // Add scroll listener to show button after scrolling down
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Set up faster scrolling for the sidebars
  useEffect(() => {
    const mainContent = mainContentRef.current;
    const leftSidebar = leftSidebarRef.current;
    const rightSidebar = rightSidebarRef.current;

    if (!mainContent || !leftSidebar || !rightSidebar) return;

    // Handle wheel events in left sidebar
    const handleLeftSidebarWheel = (e: WheelEvent) => {
      // Speed multiplier for faster scrolling
      const speedMultiplier = 2.5;

      // Apply scrolling to main content with increased speed
      mainContent.scrollBy({
        top: e.deltaY * speedMultiplier,
      });

      // Prevent default scroll behavior in sidebar
      e.preventDefault();
    };

    // Handle wheel events in right sidebar
    const handleRightSidebarWheel = (e: WheelEvent) => {
      // Speed multiplier for faster scrolling
      const speedMultiplier = 2.5;

      // Apply scrolling to main content with increased speed
      mainContent.scrollBy({
        top: e.deltaY * speedMultiplier,
      });

      // Prevent default scroll behavior in sidebar
      e.preventDefault();
    };

    // Add event listeners directly to sidebar elements
    leftSidebar.addEventListener('wheel', handleLeftSidebarWheel, {
      passive: false,
    });
    rightSidebar.addEventListener('wheel', handleRightSidebarWheel, {
      passive: false,
    });

    // Cleanup
    return () => {
      leftSidebar.removeEventListener('wheel', handleLeftSidebarWheel);
      rightSidebar.removeEventListener('wheel', handleRightSidebarWheel);
    };
  }, []);

  // Smooth scroll function to return to top of page
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div className='flex-1 h-screen'>
      <div className='grid grid-cols-1 lg:grid-cols-7 h-full'>
        {/* Activity Feed - Left Side */}
        <div
          ref={leftSidebarRef}
          className='lg:col-span-2 hidden lg:block space-y-4 p-4 h-screen overflow-y-auto hide-scrollbar sticky top-0 left-0'
        >
          <div className='bg-dark-2 rounded-2xl p-4 border border-dark-4'>
            <h2 className='text-light-1 font-bold mb-4 flex justify-between items-center'>
              <div className='flex items-center gap-2'>
                <Clock size={16} className='text-primary-500' />
                <span>Recent Activity</span>
              </div>
              <Link
                to='/explore'
                className='text-primary-500 text-sm hover:underline'
              >
                See all
              </Link>
            </h2>

            <div className='space-y-3'>
              {isPostLoading ? (
                Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className='flex items-center gap-3'>
                      <div className='w-10 h-10 rounded-full bg-dark-3 animate-pulse'></div>
                      <div className='flex-1'>
                        <div className='h-4 w-3/4 bg-dark-3 rounded animate-pulse mb-1'></div>
                        <div className='h-3 w-1/2 bg-dark-3 rounded animate-pulse'></div>
                      </div>
                    </div>
                  ))
              ) : (
                <>
                  {recentActivities.map((activity, index) => (
                    <ActivityItem
                      key={`${activity.userId}-${index}`}
                      imageUrl={activity.imageUrl}
                      username={activity.username}
                      action={activity.action}
                      time={activity.time}
                      userId={activity.userId}
                      postId={activity.postId}
                    />
                  ))}
                </>
              )}
            </div>
          </div>

          <div className='bg-dark-2 rounded-2xl p-4 border border-dark-4'>
            <h2 className='text-light-1 font-bold mb-4 flex items-center gap-2'>
              <TrendingUp size={16} className='text-primary-500' />
              <span>Trending Topics</span>
            </h2>
            <div className='flex flex-wrap gap-2'>
              {trendingTopics.map((topic) => (
                <TopicTag
                  key={topic.tag}
                  tag={topic.tag}
                  count={topic.postCount}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Main Feed - Center - Scrollable Content with Hidden Scrollbar */}
        <div className='lg:col-span-3 h-screen pt-4 px-4 overflow-hidden'>
          <div
            ref={mainContentRef}
            className='w-full h-full overflow-y-auto hide-scrollbar pr-1'
          >
            {/* Header */}
            <div className='flex mb-6 gap-4 items-center justify-between'>
              <h2 className='text-xl font-bold text-light-1'>Home Feed</h2>
              <ModeToggle />
            </div>

            {/* Main Content */}
            <div className='space-y-6'>
              {/* Post Feed */}
              {isPostLoading ? (
                <PostCardSkeleton />
              ) : (
                <AnimatePresence mode='popLayout'>
                  {displayedPosts.map((post) => (
                    <motion.div
                      key={post.$id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4 }}
                      className='mb-6 last:mb-0'
                    >
                      <PostCard post={post} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}

              {/* Loading More Indicator */}
              {hasMore && !isPostLoading && (
                <div ref={loadMoreRef} className='flex justify-center pt-2'>
                  <div className='w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin' />
                </div>
              )}

              {/* End of Feed Message */}
              {!hasMore && displayedPosts.length > 0 && (
                <div className='text-center py-4 bg-dark-2 rounded-2xl border border-dark-4 px-4 mt-2'>
                  <h3 className='font-bold text-light-1 mb-2'>
                    You're All Caught Up
                  </h3>
                  <p className='text-light-3 text-sm'>
                    You've seen all posts in your feed.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Suggestions - Right Side */}
        <div
          ref={rightSidebarRef}
          className='lg:col-span-2 hidden lg:block space-y-4 p-4 h-screen overflow-y-auto hide-scrollbar sticky top-0 right-0'
        >
          <div className='bg-dark-2 rounded-2xl p-4 border border-dark-4'>
            <h2 className='text-light-1 font-bold mb-4 flex justify-between items-center'>
              <div className='flex items-center gap-2'>
                <UserPlus size={16} className='text-primary-500' />
                <span>Suggested For You</span>
              </div>
              <Link
                to='/all-users'
                className='text-primary-500 text-sm hover:underline'
              >
                See all
              </Link>
            </h2>

            <div className='space-y-4'>
              {isAllUsersLoading ? (
                Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className='flex items-center gap-3'>
                      <div className='w-10 h-10 rounded-full bg-dark-3 animate-pulse'></div>
                      <div className='flex-1'>
                        <div className='h-4 w-3/4 bg-dark-3 rounded animate-pulse mb-1'></div>
                        <div className='h-3 w-1/2 bg-dark-3 rounded animate-pulse'></div>
                      </div>
                    </div>
                  ))
              ) : (
                <>
                  {suggestedUsers.map((suggestedUser) => (
                    <SuggestionItem
                      key={suggestedUser.$id}
                      imageUrl={
                        suggestedUser.imageUrl ||
                        '/assets/icons/profile-placeholder.svg'
                      }
                      name={suggestedUser.name}
                      username={suggestedUser.username}
                      userId={suggestedUser.$id}
                    />
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Create Post Button - Desktop */}
          <div className='sticky top-4'>
            <Link to='/create-post'>
              <Button className='w-full bg-gradient-to-r from-primary-500 to-purple-500 hover:opacity-90 text-white p-6 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20 border-none'>
                <PlusCircle size={20} />
                <span className='font-semibold'>Create New Post</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Original Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={scrollToTop}
            className='fixed bottom-24 right-5 z-50 w-10 h-10 rounded-full bg-primary-500 hover:bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20'
          >
            <ArrowUp className='w-5 h-5 text-white' />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

// Helper Components
const ActivityItem = ({
  imageUrl,
  username,
  action,
  time,
  userId,
  postId,
}: {
  imageUrl: string;
  username: string;
  action: string;
  time: string;
  userId: string;
  postId?: string;
}) => {
  return (
    <div className='flex items-start gap-2 p-2 rounded-lg'>
      <Link to={`/profile/${userId}`}>
        <img
          src={imageUrl}
          alt={username}
          className='w-10 h-10 rounded-full object-cover'
        />
      </Link>
      <div className='flex-1'>
        <p className='text-sm text-light-2'>
          <Link
            to={`/profile/${userId}`}
            className='font-semibold text-light-1 hover:underline cursor-pointer'
          >
            {username}
          </Link>{' '}
          {action}
        </p>
        <p className='text-xs text-light-3'>{time}</p>
      </div>
      {postId && (
        <Link
          to={`/posts/${postId}`}
          className='text-xs px-2 py-1 bg-dark-3 rounded-lg text-light-2 hover:bg-dark-4 transition-colors'
        >
          View
        </Link>
      )}
    </div>
  );
};

const TopicTag = ({ tag, count }: { tag: string; count: number }) => {
  return (
    <Link
      to={`/explore?tag=${tag}`}
      className='bg-dark-3 hover:bg-dark-4 transition-colors px-3 py-1.5 rounded-full cursor-pointer flex items-center gap-1'
    >
      <Hash size={14} className='text-primary-500' />
      <span className='text-primary-500 text-sm'>{tag}</span>
      <span className='text-light-3 text-xs'>{count}</span>
    </Link>
  );
};

const SuggestionItem = ({
  imageUrl,
  name,
  username,
  userId,
}: {
  imageUrl: string;
  name: string;
  username: string;
  userId: string;
}) => {
  return (
    <div className='flex items-center justify-between p-2 rounded-lg'>
      <Link to={`/profile/${userId}`} className='flex items-center gap-2'>
        <img
          src={imageUrl}
          alt={name}
          className='w-10 h-10 rounded-full object-cover'
        />
        <div>
          <p className='text-sm font-medium text-light-1'>{name}</p>
          <p className='text-xs text-light-3'>@{username}</p>
        </div>
      </Link>
      <FollowButton userId={userId} compact={true} />
    </div>
  );
};

export default Home;
