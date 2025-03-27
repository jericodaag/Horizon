import { motion } from 'framer-motion';

const SkeletonLoader = () => {
  // Animation for shimmer effect
  const shimmerVariants = {
    initial: {
      backgroundPosition: '-1000px 0',
    },
    animate: {
      backgroundPosition: ['1000px 0', '-1000px 0'],
      transition: {
        repeat: Infinity,
        duration: 2,
        ease: 'linear',
      },
    },
  };

  const shimmerStyle = {
    background: 'linear-gradient(90deg, #2A2A2A 0%, #3A3A3A 50%, #2A2A2A 100%)',
    backgroundSize: '2000px 100%',
  };

  return (
    <div className='bg-dark-2 rounded-xl overflow-hidden border border-dark-4 mb-4 max-w-[500px] w-full mx-auto'>
      {/* Header */}
      <div className='p-3 border-b border-dark-4 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <motion.div
            className='w-8 h-8 rounded-full'
            style={shimmerStyle}
            variants={shimmerVariants}
            initial='initial'
            animate='animate'
          />
          <div className='flex flex-col gap-1'>
            <motion.div
              className='h-3 w-24 rounded-md'
              style={shimmerStyle}
              variants={shimmerVariants}
              initial='initial'
              animate='animate'
            />
            <motion.div
              className='h-2 w-16 rounded-md'
              style={shimmerStyle}
              variants={shimmerVariants}
              initial='initial'
              animate='animate'
            />
          </div>
        </div>
        <motion.div
          className='w-6 h-6 rounded-full'
          style={shimmerStyle}
          variants={shimmerVariants}
          initial='initial'
          animate='animate'
        />
      </div>

      {/* Caption */}
      <div className='p-3 border-b border-dark-4'>
        <motion.div
          className='h-3 w-full rounded-md mb-2'
          style={shimmerStyle}
          variants={shimmerVariants}
          initial='initial'
          animate='animate'
        />
        <motion.div
          className='h-3 w-3/4 rounded-md mb-2'
          style={shimmerStyle}
          variants={shimmerVariants}
          initial='initial'
          animate='animate'
        />
        <div className='flex gap-2 mt-2'>
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className='h-5 w-14 rounded-full'
              style={shimmerStyle}
              variants={shimmerVariants}
              initial='initial'
              animate='animate'
            />
          ))}
        </div>
      </div>

      {/* Image */}
      <motion.div
        className='w-full aspect-square'
        style={shimmerStyle}
        variants={shimmerVariants}
        initial='initial'
        animate='animate'
      />

      {/* Post Stats */}
      <div className='p-3 border-t border-dark-4'>
        <div className='flex justify-between items-center'>
          <div className='flex gap-3'>
            <motion.div
              className='h-6 w-14 rounded-md'
              style={shimmerStyle}
              variants={shimmerVariants}
              initial='initial'
              animate='animate'
            />
            <motion.div
              className='h-6 w-14 rounded-md'
              style={shimmerStyle}
              variants={shimmerVariants}
              initial='initial'
              animate='animate'
            />
            <motion.div
              className='h-6 w-6 rounded-md'
              style={shimmerStyle}
              variants={shimmerVariants}
              initial='initial'
              animate='animate'
            />
          </div>
          <motion.div
            className='h-6 w-6 rounded-md'
            style={shimmerStyle}
            variants={shimmerVariants}
            initial='initial'
            animate='animate'
          />
        </div>

        <motion.div
          className='h-3 w-32 rounded-md mt-2'
          style={shimmerStyle}
          variants={shimmerVariants}
          initial='initial'
          animate='animate'
        />
      </div>

      {/* Comments Preview */}
      <div className='px-3 pb-3'>
        <motion.div
          className='h-3 w-28 rounded-md mb-2'
          style={shimmerStyle}
          variants={shimmerVariants}
          initial='initial'
          animate='animate'
        />
        <div className='flex items-start gap-2 mt-2'>
          <motion.div
            className='w-5 h-5 rounded-full flex-shrink-0'
            style={shimmerStyle}
            variants={shimmerVariants}
            initial='initial'
            animate='animate'
          />
          <motion.div
            className='flex-1 h-10 rounded-lg'
            style={shimmerStyle}
            variants={shimmerVariants}
            initial='initial'
            animate='animate'
          />
        </div>
      </div>
    </div>
  );
};

const PostCardSkeleton = () => {
  return (
    <div className='space-y-4'>
      {[1, 2].map((index) => (
        <SkeletonLoader key={index} />
      ))}
    </div>
  );
};

export default PostCardSkeleton;
