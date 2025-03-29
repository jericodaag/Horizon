import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import {
  useGetPosts,
  useSearchPosts,
  useGetRecentPosts,
  useGetSavedPosts,
} from '@/lib/react-query/queries';
import { Input } from '@/components/ui/input';
import Loader from '@/components/shared/Loader';
import GridPostList from '@/components/shared/GridPostList';
import useDebounce from '@/hooks/useDebounce';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bookmark, Flame, Clock, Search as SearchIcon } from 'lucide-react';
import { Models } from 'appwrite';
import { useUserContext } from '@/context/AuthContext';

const Explore = () => {
  const { user } = useUserContext();
  const { ref, inView } = useInView();
  const { data: allPosts, fetchNextPage, hasNextPage } = useGetPosts();
  const { data: recentPosts, isPending: isRecentPostsLoading } =
    useGetRecentPosts();
  const { data: savedPosts, isPending: isSavedPostsLoading } = useGetSavedPosts(
    user.id
  );

  const [searchValue, setSearchValue] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [popularPosts, setPopularPosts] = useState<Models.Document[]>([]);

  const debouncedSearch = useDebounce(searchValue, 500);
  const { data: searchedPosts, isFetching: isSearchFetching } =
    useSearchPosts(debouncedSearch);

  // Filter posts by most likes when "popular" tab is selected
  useEffect(() => {
    if (recentPosts?.documents) {
      // Sort posts by number of likes (descending)
      const sorted = [...recentPosts.documents].sort((a, b) => {
        const likesA = Array.isArray(a.likes) ? a.likes.length : 0;
        const likesB = Array.isArray(b.likes) ? b.likes.length : 0;
        return likesB - likesA;
      });

      setPopularPosts(sorted);
    }
  }, [recentPosts]);

  // Handle infinite scroll for "all" tab
  useEffect(() => {
    if (inView && !searchValue && activeTab === 'all') {
      fetchNextPage();
    }
  }, [inView, searchValue, fetchNextPage, activeTab]);

  // Reset search when changing tabs
  useEffect(() => {
    setSearchValue('');
  }, [activeTab]);

  if (!allPosts && activeTab === 'all')
    return (
      <div className='flex-center w-full h-full'>
        <Loader />
      </div>
    );

  const shouldShowSearchResults = searchValue !== '';
  const shouldShowPosts =
    !shouldShowSearchResults &&
    activeTab === 'all' &&
    allPosts?.pages.every((item) => item.documents.length === 0);

  const renderCurrentTabContent = () => {
    if (shouldShowSearchResults) {
      return isSearchFetching ? (
        <div className='flex-center w-full py-10'>
          <Loader />
        </div>
      ) : searchedPosts?.documents?.length ? (
        <GridPostList posts={searchedPosts.documents} />
      ) : (
        <div className='flex-center w-full flex-col py-10'>
          <img
            src='/assets/icons/search.svg'
            alt='No search results'
            className='w-14 h-14 mb-4 opacity-30'
          />
          <p className='text-light-4 mt-5 text-center w-full'>
            No results found for "{searchValue}"
          </p>
        </div>
      );
    }

    switch (activeTab) {
      case 'popular':
        return isRecentPostsLoading ? (
          <Loader />
        ) : (
          <GridPostList posts={popularPosts} />
        );
      case 'latest':
        return isRecentPostsLoading ? (
          <Loader />
        ) : (
          <GridPostList posts={recentPosts?.documents || []} />
        );
      case 'saved':
        return isSavedPostsLoading ? (
          <Loader />
        ) : !savedPosts?.length ? (
          <div className='flex-center w-full h-[200px] flex-col gap-4'>
            <Bookmark size={48} className='text-light-3' />
            <p className='text-light-4 text-center'>No saved posts yet</p>
          </div>
        ) : (
          <GridPostList posts={savedPosts} />
        );
      case 'all':
      default:
        return shouldShowPosts ? (
          <p className='text-light-4 mt-10 text-center w-full'>End of posts</p>
        ) : (
          <div className='w-full'>
            {allPosts?.pages.map((item, index) => (
              <GridPostList key={`page-${index}`} posts={item.documents} />
            ))}
          </div>
        );
    }
  };

  return (
    <div className='w-full h-screen flex justify-center'>
      {/* Main scrollable content area */}
      <div className='flex-1 max-w-5xl h-screen overflow-y-auto hide-scrollbar px-4 sm:px-6 md:px-8 py-6'>
        <div className='flex flex-col gap-8'>
          {/* Search Section */}
          <div className='w-full'>
            <h2 className='h3-bold md:h2-bold mb-6'>Explore</h2>
            <div className='flex items-center gap-1 px-4 w-full rounded-lg bg-dark-4 relative'>
              <SearchIcon
                size={20}
                className='text-light-3 flex-shrink-0 absolute left-4'
              />
              <Input
                type='text'
                placeholder='Search posts...'
                className='explore-search pl-10 pr-10 py-3 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0'
                value={searchValue}
                onChange={(e) => {
                  const { value } = e.target;
                  setSearchValue(value);
                }}
              />
              {searchValue && (
                <button
                  onClick={() => setSearchValue('')}
                  className='absolute right-4 text-light-3 hover:text-light-1'
                  aria-label='Clear search'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='18'
                    height='18'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <circle cx='12' cy='12' r='10'></circle>
                    <line x1='15' y1='9' x2='9' y2='15'></line>
                    <line x1='9' y1='9' x2='15' y2='15'></line>
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Browse Posts Section - Fixed position regardless of search */}
          <div className='w-full'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6'>
              <h3 className='body-bold md:h3-bold'>Browse Posts</h3>

              <Tabs
                defaultValue='all'
                value={activeTab}
                onValueChange={setActiveTab}
                className='w-full sm:w-auto'
              >
                <TabsList className='bg-dark-3 p-1 rounded-full h-auto w-full sm:w-auto flex flex-nowrap overflow-x-auto hide-scrollbar'>
                  <TabsTrigger
                    value='all'
                    className='rounded-full data-[state=active]:bg-primary-500 data-[state=active]:text-light-1 flex-1 sm:flex-none min-w-16'
                  >
                    All
                  </TabsTrigger>
                  <TabsTrigger
                    value='popular'
                    className='rounded-full data-[state=active]:bg-primary-500 data-[state=active]:text-light-1 flex-1 sm:flex-none min-w-24'
                  >
                    <Flame className='w-4 h-4 mr-1' />
                    Popular
                  </TabsTrigger>
                  <TabsTrigger
                    value='latest'
                    className='rounded-full data-[state=active]:bg-primary-500 data-[state=active]:text-light-1 flex-1 sm:flex-none min-w-20'
                  >
                    <Clock className='w-4 h-4 mr-1' />
                    Latest
                  </TabsTrigger>
                  <TabsTrigger
                    value='saved'
                    className='rounded-full data-[state=active]:bg-primary-500 data-[state=active]:text-light-1 flex-1 sm:flex-none min-w-20'
                  >
                    <Bookmark className='w-4 h-4 mr-1' />
                    Saved
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Content Area */}
            <div className='w-full'>{renderCurrentTabContent()}</div>
          </div>

          {/* Loading indicator for infinite scroll */}
          {hasNextPage && !searchValue && activeTab === 'all' && (
            <div ref={ref} className='mt-10 flex-center w-full'>
              <Loader />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Explore;
