import PostCard from '@/components/shared/PostCard';
import { useGetRecentPosts } from '@/lib/react-query/queries';
import { Models } from 'appwrite';
import PostCardSkeleton from '@/components/shared/PostCardSkeleton';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';

const Home = () => {
  const { data: posts, isPending: isPostLoading } = useGetRecentPosts();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div className='flex flex-1'>
      <div className='home-container'>
        <h2 className='h3-bold md:h2-bold text-left w-full max-w-screen-sm mt-0 mb-3'>
          Home Feed
        </h2>

        <div className='home-posts'>
          {isPostLoading ? (
            <div className='flex flex-col gap-4 w-full max-w-screen-sm'>
              {[1, 2].map((i) => (
                <PostCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className='flex flex-col gap-4 w-full max-w-screen-sm'>
              {posts?.documents.map((post: Models.Document) => (
                <PostCard key={post.$id} post={post} />
              ))}
            </div>
          )}
        </div>

        {/* Scroll to top button - keep simple animation only for this element */}
        {showScrollTop && (
          <div className='fixed bottom-20 right-4 md:bottom-8 md:right-8 z-50'>
            <Button
              className='rounded-full w-10 h-10 md:w-12 md:h-12 bg-primary-500 hover:bg-primary-600 transition-colors shadow-lg'
              onClick={scrollToTop}
            >
              <ArrowUp className='w-5 h-5 md:w-6 md:h-6 text-light-1' />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
