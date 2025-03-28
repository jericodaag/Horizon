import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  useGetPostById,
  useGetUserPosts,
  useDeletePost,
} from '@/lib/react-query/queries';
import { multiFormatDateString } from '@/lib/utils';
import { useUserContext } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';
import PostStats from '@/components/shared/PostStats';
import GridPostList from '@/components/shared/GridPostList';
import CommentSection from '@/components/shared/CommentSection';
import { useState, useEffect } from 'react';
import DeleteConfirmationModal from '@/components/shared/DeleteConfirmationModal';
import TranslateButton from '@/components/shared/TranslateButton';

const PostDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUserContext();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPostCreator, setIsPostCreator] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const { data: post, isLoading } = useGetPostById(id);
  const { data: userPosts, isLoading: isUserPostLoading } = useGetUserPosts(
    post?.creator.$id
  );
  const { mutate: deletePost } = useDeletePost();

  // Check if current user is the post creator
  useEffect(() => {
    if (post && user) {
      const creatorId = post.creator.$id;
      const currentUserId = user.id;
      const isCreator = currentUserId === creatorId;

      setIsPostCreator(isCreator);
    }
  }, [post, user]);

  // Listen for window resize to determine mobile or desktop view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get related posts
  const relatedPosts = userPosts?.documents.filter(
    (userPost) => userPost.$id !== id
  );

  const handleDeleteConfirm = () => {
    if (!isPostCreator) {
      console.error("You don't have permission to delete this post");
      return;
    }

    deletePost({ postId: id, imageId: post?.imageId });
    navigate(-1);
  };

  const openDeleteModal = () => {
    if (!isPostCreator) {
      console.error("You don't have permission to delete this post");
      return;
    }

    setIsDeleteModalOpen(true);
  };

  // Explicit back navigation handler for improved reliability
  const handleBackClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(-1);
  };

  return (
    <div className='post_details-container pt-0 pb-0 mb-4' style={{ gap: "0.5rem", minHeight: isMobile ? '100vh' : 'auto' }}>
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />

      {/* Back button - visible on desktop */}
      <div className='hidden md:flex max-w-5xl w-full mb-4'>
        <Button
          onClick={handleBackClick}
          variant='ghost'
          className='shad-button_ghost'
          type='button'
        >
          <img
            src={'/assets/icons/back.svg'}
            alt='back'
            width={24}
            height={24}
          />
          <p className='small-medium lg:base-medium'>Back</p>
        </Button>
      </div>

      {/* Mobile back button */}
      <div className='flex md:hidden w-full mb-2'>
        <Button
          onClick={handleBackClick}
          variant='ghost'
          className='shad-button_ghost'
          type='button'
        >
          <img
            src={'/assets/icons/back.svg'}
            alt='back'
            width={20}
            height={20}
          />
          <p className='small-medium'>Back</p>
        </Button>
      </div>

      {isLoading || !post ? (
        <div className='flex-center w-full h-60'>
          <Loader className='h-10 w-10 animate-spin' />
        </div>
      ) : (
        <>
          {/* Mobile View */}
          {isMobile && (
            <div className='mobile-post-card pb-16'>
              {/* Post Image - Optimized for mobile with proper spacing */}
              <div className='w-full aspect-square overflow-hidden'>
                {post.imageUrl && (
                  <img
                    src={post.imageUrl}
                    alt='post image'
                    className='w-full h-full object-cover'
                  />
                )}
              </div>

              {/* Post Creator Info */}
              <div className='post-creator-info px-3 mb-2'>
                <Link
                  to={`/profile/${post?.creator.$id}`}
                  className='flex items-center gap-3'
                >
                  <img
                    src={
                      post?.creator.imageUrl ||
                      '/assets/icons/profile-placeholder.svg'
                    }
                    alt='creator'
                    className='w-8 h-8 rounded-full'
                  />
                  <div className='flex gap-1 flex-col'>
                    <p className='base-medium text-light-1'>
                      {post?.creator.name}
                    </p>
                    <div className='flex-center gap-2 text-light-3'>
                      <p className='subtle-semibold'>
                        {multiFormatDateString(post?.$createdAt)}
                      </p>
                      {post?.location && (
                        <>
                          <span>-</span>
                          <p className='subtle-semibold'>{post?.location}</p>
                        </>
                      )}
                    </div>
                  </div>
                </Link>

                <div className='flex items-center gap-4'>
                  {/* Edit/Delete buttons - Only render if post creator */}
                  {isPostCreator && (
                    <>
                      <Link to={`/update-post/${post?.$id}`}>
                        <img
                          src={'/assets/icons/edit.svg'}
                          alt='edit'
                          width={20}
                          height={20}
                        />
                      </Link>
                      <Button
                        onClick={openDeleteModal}
                        variant='ghost'
                        className='p-0'
                        type='button'
                      >
                        <img
                          src={'/assets/icons/delete.svg'}
                          alt='delete'
                          width={20}
                          height={20}
                        />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Post Caption and Tags */}
              <div className='post-content px-3 mb-2'>
                <TranslateButton text={post?.caption} showAlways={false} />
                <ul className='flex flex-wrap gap-1 mt-1'>
                  {post?.tags.map((tag, index) => (
                    <li
                      key={`${tag}${index}`}
                      className='text-light-3 small-regular'
                    >
                      #{tag}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Post Stats */}
              <div className='w-full px-3 mb-2'>
                <PostStats post={post} userId={user.id} />
              </div>

              <hr className='border-t border-dark-4/60 w-full mb-2' />

              {/* Comments Section - With minimal height */}
              <div className='px-3 pb-0'>
                <h4 className="text-sm font-medium text-light-2 mb-1">Comments</h4>
                <div className="max-h-[100px] overflow-y-auto hide-scrollbar">
                  {post && id && (
                    <CommentSection
                      postId={id || ''}
                      postCreatorId={post?.creator.$id || ''}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Desktop View */}
          {!isMobile && (
            <div className='post_details-card'>
              {/* Left side - Post Image */}
              <div className='post-image-side h-full'>
                {post.imageUrl && (
                  <div className="h-full w-full flex items-center justify-center overflow-hidden border-r border-dark-4">
                    <img
                      src={post.imageUrl}
                      alt='post image'
                      className='w-full h-full object-cover'
                    />
                  </div>
                )}
              </div>

              {/* Right side - Post Info and Comments */}
              <div className='post_details-info'>
                <div className='flex-between w-full'>
                  <Link
                    to={`/profile/${post?.creator.$id}`}
                    className='flex items-center gap-3'
                  >
                    <img
                      src={
                        post?.creator.imageUrl ||
                        '/assets/icons/profile-placeholder.svg'
                      }
                      alt='creator'
                      className='w-8 h-8 lg:w-10 lg:h-10 rounded-full'
                    />
                    <div className='flex gap-1 flex-col'>
                      <p className='base-medium lg:body-bold text-light-1'>
                        {post?.creator.name}
                      </p>
                      <div className='flex-center gap-2 text-light-3'>
                        <p className='subtle-semibold lg:small-regular'>
                          {multiFormatDateString(post?.$createdAt)}
                        </p>
                        {post?.location && (
                          <>
                            <span>-</span>
                            <p className='subtle-semibold lg:small-regular'>
                              {post?.location}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>

                  <div className='flex-center gap-4'>
                    {/* Edit/Delete buttons - Only render if post creator */}
                    {isPostCreator && (
                      <>
                        <Link to={`/update-post/${post?.$id}`}>
                          <img
                            src={'/assets/icons/edit.svg'}
                            alt='edit'
                            width={24}
                            height={24}
                          />
                        </Link>
                        <Button
                          onClick={openDeleteModal}
                          variant='ghost'
                          className='post_details-delete_btn'
                          type='button'
                        >
                          <img
                            src={'/assets/icons/delete.svg'}
                            alt='delete'
                            width={24}
                            height={24}
                          />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                <hr className='border w-full border-dark-4/80 my-3' />

                {/* Post Caption and Tags - Less vertical space */}
                <div className='flex flex-col w-full small-medium lg:base-regular'>
                  <TranslateButton text={post?.caption} showAlways={false} />
                  <ul className='flex flex-wrap gap-1 mt-2'>
                    {post?.tags.map((tag, index) => (
                      <li
                        key={`${tag}${index}`}
                        className='text-light-3 small-regular'
                      >
                        #{tag}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Post Stats - More compact spacing */}
                <div className='w-full my-2'>
                  <PostStats post={post} userId={user.id} />
                </div>

                {/* Thinner divider with less spacing */}
                <hr className='border w-full border-dark-4/50 mb-2' />

                {/* Comments Section - Optimized size */}
                <div className='comments-container custom-scrollbar'>
                  {post && id && (
                    <CommentSection
                      postId={id || ''}
                      postCreatorId={post?.creator.$id || ''}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Related Posts Section - Only on desktop */}
      {!isMobile && (
        <div className='related-posts-section w-full max-w-5xl mt-8'>
          <hr className='border w-full border-dark-4/80 mb-8' />

          <h3 className='body-bold md:h3-bold w-full mb-8'>More Related Posts</h3>
          {isUserPostLoading || !relatedPosts ? (
            <Loader />
          ) : (
            <GridPostList posts={relatedPosts} />
          )}
        </div>
      )}
    </div>
  );
};

export default PostDetails;