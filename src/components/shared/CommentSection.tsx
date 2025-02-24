import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUserContext } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { databases } from '@/lib/appwrite/config';
import { Query, ID, Models } from 'appwrite';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';
import { multiFormatDateString } from '@/lib/utils';

interface Comment extends Models.Document {
  userId: string;
  postId: string;
  content: string;
  createdAt: string;
  likes: string[];
  user?: {
    imageUrl?: string;
    name?: string;
  };
}

const CommentSection = ({ post }: { post: Models.Document }) => {
  const { user } = useUserContext();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [commentText, setCommentText] = useState('');

  const fetchComments = async () => {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'comments',
        [Query.equal('postId', post.$id), Query.orderDesc('$createdAt')]
      );
      setComments(response.documents as Comment[]);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [post.$id]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsLoading(true);
    try {
      await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'comments',
        ID.unique(),
        {
          userId: user.id,
          postId: post.$id,
          content: commentText.trim(),
          createdAt: new Date().toISOString(),
          likes: [],
        }
      );

      setCommentText('');
      toast({ title: 'Success', description: 'Comment added successfully' });
      fetchComments();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add comment',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await databases.deleteDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        'comments',
        commentId
      );

      toast({ title: 'Success', description: 'Comment deleted successfully' });
      fetchComments();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete comment',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className='w-full space-y-6 mt-8'>
      {/* Comment Form */}
      <form onSubmit={handleSubmitComment} className='flex gap-4'>
        <div className='w-10 h-10'>
          <img
            src={user?.imageUrl || '/assets/icons/profile-placeholder.svg'}
            alt='user avatar'
            className='w-full h-full rounded-full object-cover'
          />
        </div>

        <div className='flex-1 flex gap-2'>
          <input
            type='text'
            placeholder='Write a comment...'
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className='flex-1 bg-dark-4 text-light-1 rounded-lg px-4 py-2 
                     focus:outline-none focus:ring-2 focus:ring-primary-500'
          />
          <Button
            type='submit'
            disabled={isLoading || !commentText.trim()}
            className='shad-button_primary px-8'
          >
            {isLoading ? <Loader className='h-5 w-5 animate-spin' /> : 'Post'}
          </Button>
        </div>
      </form>

      {/* Comments List */}
      <div className='space-y-4'>
        {comments.map((comment: any) => (
          <div
            key={comment.$id}
            className='flex gap-4 bg-dark-2 rounded-xl p-4'
          >
            <Link to={`/profile/${comment.userId}`}>
              <div className='w-10 h-10'>
                <img
                  src={
                    comment.user?.imageUrl ||
                    '/assets/icons/profile-placeholder.svg'
                  }
                  alt='user avatar'
                  className='w-full h-full rounded-full object-cover'
                />
              </div>
            </Link>

            <div className='flex-1'>
              <div className='flex items-center justify-between'>
                <Link
                  to={`/profile/${comment.userId}`}
                  className='font-semibold text-light-1 hover:underline'
                >
                  {comment.user?.name || 'User'}
                </Link>
                <span className='text-light-3 text-sm'>
                  {multiFormatDateString(comment.createdAt)}
                </span>
              </div>

              <p className='text-light-2 mt-1'>{comment.content}</p>

              <div className='flex gap-4 mt-2'>
                <button className='text-light-3 hover:text-light-1 text-sm'>
                  Like
                </button>
                <button className='text-light-3 hover:text-light-1 text-sm'>
                  Reply
                </button>
                {user.id === comment.userId && (
                  <button
                    onClick={() => handleDeleteComment(comment.$id)}
                    className='text-light-3 hover:text-red-500 text-sm'
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;
