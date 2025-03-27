import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const CreatePostButton = ({ className = '' }) => {
  return (
    <Link to='/create-post'>
      <Button
        className={`w-full bg-primary-500 hover:bg-primary-600 text-white rounded-xl py-3 ${className}`}
      >
        <div className='flex items-center justify-center gap-2'>
          <img
            src='/assets/icons/gallery-add.svg'
            alt='create'
            className='w-5 h-5 invert-white'
          />
          <span className='font-medium'>Create New Post</span>
        </div>
      </Button>
    </Link>
  );
};

export default CreatePostButton;
