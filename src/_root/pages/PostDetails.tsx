import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  useGetPostById,
  useGetUserPosts,
  useDeletePost,
  useCreateComment,
  useGetPostComments,
  useGetUserById,
} from '@/lib/react-query/queries';
import { multiFormatDateString } from '@/lib/utils';
import { useUserContext } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';
import PostStats from '@/components/shared/PostStats';
import GridPostList from '@/components/shared/GridPostList';
import { useState, useEffect } from 'react';
import { Models } from 'appwrite';
import { IComment } from '@/types';
import { appwriteConfig, databases } from '@/lib/appwrite/config';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/react-query/queryKeys';

const PostDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUserContext();
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<IComment[]>([]);
  const queryClient = useQueryClient();

  const { data: post, isLoading } = useGetPostById(id);
  const { data: userPosts, isLoading: isUserPostLoading } = useGetUserPosts(
    post?.creator.$id
  );
  const { mutate: deletePost } = useDeletePost();
  const { data: commentsData, isLoading: isCommentsLoading } =
    useGetPostComments(id || '');
  const { mutate: createComment, isPending: isCommentSubmitting } =
    useCreateComment();

  // Get related posts
  const relatedPosts = userPosts?.documents.filter(
    (userPost) => userPost.$id !== id
  );

  // Update comments when data changes
  useEffect(() => {
    const fetchCommentsWithUserDetails = async () => {
      if (commentsData?.documents) {
        // For each comment, fetch the user details
        const enhancedComments = await Promise.all(
          commentsData.documents.map(async (comment: Models.Document) => {
            try {
              // Fetch user data for this comment's userId
              const userData = await databases.getDocument(
                appwriteConfig.databaseId,
                appwriteConfig.userCollectionId,
                comment.userId
              );

              // Return the comment with user data
              return {
                $id: comment.$id,
                userId: comment.userId,
                postId: comment.postId,
                content: comment.content,
                createdAt: comment.createdAt,
                likes: comment.likes || [],
                user: {
                  $id: userData.$id,
                  name: userData.name,
                  username: userData.username,
                  imageUrl: userData.imageUrl,
                },
              } as IComment;
            } catch (error) {
              console.error('Error fetching user for comment:', error);
              // If fetching user fails, return comment with placeholder user data
              return {
                $id: comment.$id,
                userId: comment.userId,
                postId: comment.postId,
                content: comment.content,
                createdAt: comment.createdAt,
                likes: comment.likes || [],
                user: {
                  $id: comment.userId,
                  name: 'User',
                  username: '',
                  imageUrl: '/assets/icons/profile-placeholder.svg',
                },
              } as IComment;
            }
          })
        );

        setComments(enhancedComments);
      }
    };

    fetchCommentsWithUserDetails();
  }, [commentsData]);

  const handleDeletePost = () => {
    deletePost({ postId: id, imageId: post?.imageId });
    navigate(-1);
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    createComment(
      {
        postId: id || '',
        content: commentText.trim(),
        userId: user.id,
      },
      {
        onSuccess: () => {
          setCommentText('');
          queryClient.invalidateQueries({
            queryKey: [QUERY_KEYS.GET_POST_COMMENTS, id],
          });
        },
      }
    );
  };

  return (
    <div className='post_details-container'>
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
                    <p className='subtle-semibold lg:small-regular '>
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
                <Link
                  to={`/update-post/${post?.$id}`}
                  className={`${user.id !== post?.creator.$id && 'hidden'}`}
                >
                  <img
                    src={'/assets/icons/edit.svg'}
                    alt='edit'
                    width={24}
                    height={24}
                  />
                </Link>

                <Button
                  onClick={handleDeletePost}
                  variant='ghost'
                  className={`post_details-delete_btn ${
                    user.id !== post?.creator.$id && 'hidden'
                  }`}
                >
                  <img
                    src={'/assets/icons/delete.svg'}
                    alt='delete'
                    width={24}
                    height={24}
                  />
                </Button>
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

            {/* Comments Section */}
            <div className='w-full mt-4'>
              {/* Comment Input */}
              <div className='flex items-center gap-3 pt-2'>
                <img
                  src={user.imageUrl || '/assets/icons/profile-placeholder.svg'}
                  alt='user profile'
                  className='w-8 h-8 rounded-full object-cover'
                />
                <div className='flex-1 flex gap-2'>
                  <input
                    type='text'
                    placeholder='Write a comment...'
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className='flex-1 bg-dark-3 text-light-1 rounded-lg px-4 py-2.5 
                              focus:outline-none text-sm'
                  />
                  <Button
                    onClick={handleSubmitComment}
                    disabled={isCommentSubmitting || !commentText.trim()}
                    className='bg-primary-500 px-5 py-1.5 rounded-lg text-light-1 
                              hover:bg-primary-600 disabled:opacity-50'
                  >
                    {isCommentSubmitting ? (
                      <Loader className='w-4 h-4 animate-spin' />
                    ) : (
                      'Post'
                    )}
                  </Button>
                </div>
              </div>

              {/* Comments List */}
              <div className='mt-6 space-y-4'>
                {isCommentsLoading ? (
                  <Loader />
                ) : commentsData?.documents &&
                  commentsData.documents.length > 0 ? (
                  commentsData.documents.map((comment) => (
                    <div key={comment.$id} className='flex gap-3 items-start'>
                      <Link to={`/profile/${comment.userId}`}>
                        <img
                          src={
                            comment.user?.imageUrl ||
                            '/assets/icons/profile-placeholder.svg'
                          }
                          alt='commenter'
                          className='w-8 h-8 rounded-full object-cover'
                        />
                      </Link>
                      <div>
                        <Link
                          to={`/profile/${comment.userId}`}
                          className='text-light-1 font-medium hover:underline'
                        >
                          {comment.user?.name || 'User'}
                        </Link>{' '}
                        <span className='text-light-2'>{comment.content}</span>
                        <p className='text-light-3 text-sm mt-1'>
                          {multiFormatDateString(comment.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className='text-light-3 text-center py-6'>
                    No comments yet. Be the first to comment!
                  </p>
                )}
              </div>
            </div>
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
