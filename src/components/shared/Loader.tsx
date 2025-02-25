// src/components/shared/Loader.tsx
import { Loader2 } from 'lucide-react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Reusable spinner component for loading states
 * @param {object} props - Component properties
 * @param {string} [props.size='md'] - Size of the loader (sm, md, lg)
 */
const Loader = ({ size = 'md' }: LoaderProps) => {
  // Size mapping for different loader sizes
  const sizeMap = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  };

  const sizeClass = sizeMap[size];

  return (
    <div className='flex-center w-full'>
      <Loader2 className={`${sizeClass} text-primary-500 animate-spin`} />
    </div>
  );
};

export default Loader;
