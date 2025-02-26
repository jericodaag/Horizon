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

const PostDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUserContext();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPostCreator, setIsPostCreator] = useState(false);

  const { data: post, isLoading } = useGetPostById(id);
  const { data: userPosts, isLoading: isUserPostLoading } = useGetUserPosts(
    post?.creator.$id
  );
  const { mutate: deletePost } = useDeletePost();

  // Check if current user is the post creator
  useEffect(() => {
    if (post && user) {
      // Explicit comparison and console log for debugging
      const creatorId = post.creator.$id;
      const currentUserId = user.id;
      const isCreator = currentUserId === creatorId;

      console.log("Current user ID:", currentUserId);
      console.log("Post creator ID:", creatorId);
      console.log("Is creator:", isCreator);

      setIsPostCreator(isCreator);
    }
  }, [post, user]);

  // Get related posts
  const relatedPosts = userPosts?.documents.filter(
    (userPost) => userPost.$id !== id
  );

  const handleDeleteConfirm = () => {
    // This function is called when user confirms deletion in the modal
    if (!isPostCreator) {
      console.error("You don't have permission to delete this post");
      return;
    }

    deletePost({ postId: id, imageId: post?.imageId });
    navigate(-1);
  };

  const openDeleteModal = () => {
    // This function is called when delete button is clicked
    if (!isPostCreator) {
      console.error("You don't have permission to delete this post");
      return;
    }

    setIsDeleteModalOpen(true);
  };

  return (
    <div className='post_details-container'>
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />

      <div className='hidden md:flex max-w-5xl w-full'>
        <Button
          onClick={() => navigate(-1)}
          variant='ghost'
          className='shad-button_ghost'
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

      {isLoading || !post ? (
        <Loader />
      ) : (
        <div className='post_details-card'>
          <img
            src={post?.imageUrl}
            alt='creator'
            className='post_details-img'
          />

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
                  className='w-8 h-8 lg:w-12 lg:h-12 rounded-full'
                />
                <div className='flex gap-1 flex-col'>
                  <p className='base-medium lg:body-bold text-light-1'>
                    {post?.creator.name}
                  </p>
                  <div className='flex-center gap-2 text-light-3'>
                    <p className='subtle-semibold lg:small-regular'>
                      {multiFormatDateString(post?.$createdAt)}
                    </p>
                    -
                    <p className='subtle-semibold lg:small-regular'>
                      {post?.location}
                    </p>
                  </div>
                </div>
              </Link>

              <div className='flex-center gap-4'>
                {/* Edit button - Only render if post creator */}
                {isPostCreator && (
                  <Link
                    to={`/update-post/${post?.$id}`}
                  >
                    <img
                      src={'/assets/icons/edit.svg'}
                      alt='edit'
                      width={24}
                      height={24}
                    />
                  </Link>
                )}

                {/* Delete button - Only render if post creator */}
                {isPostCreator && (
                  <Button
                    onClick={openDeleteModal}
                    variant='ghost'
                    className="post_details-delete_btn"
                  >
                    <img
                      src={'/assets/icons/delete.svg'}
                      alt='delete'
                      width={24}
                      height={24}
                    />
                  </Button>
                )}
              </div>
            </div>

            <hr className='border w-full border-dark-4/80' />

            <div className='flex flex-col flex-1 w-full small-medium lg:base-regular'>
              <p>{post?.caption}</p>
              <ul className='flex gap-1 mt-2'>
                {post?.tags.map((tag: string, index: string) => (
                  <li
                    key={`${tag}${index}`}
                    className='text-light-3 small-regular'
                  >
                    #{tag}
                  </li>
                ))}
              </ul>
            </div>

            <div className='w-full'>
              <PostStats post={post} userId={user.id} />
            </div>

            {/* Comments Section using the new component */}
            {post && id && (
              <CommentSection postId={id} />
            )}
          </div>
        </div>
      )}

      <div className='w-full max-w-5xl'>
        <hr className='border w-full border-dark-4/80' />

        <h3 className='body-bold md:h3-bold w-full my-10'>
          More Related Posts
        </h3>
        {isUserPostLoading || !relatedPosts ? (
          <Loader />
        ) : (
          <GridPostList posts={relatedPosts} />
        )}
      </div>
    </div>
  );
};

export default PostDetails;