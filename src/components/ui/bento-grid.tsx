import React from 'react';
import { cn } from '@/lib/utils';

interface BentoGridProps {
  className?: string;
  children?: React.ReactNode;
}

export const BentoGrid = ({ className, children }: BentoGridProps) => {
  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto',
        className
      )}
    >
      {children}
    </div>
  );
};

interface BentoCardProps {
  className?: string;
  Icon?: React.FC<{ className?: string }>;
  name?: string;
  description?: string;
  cta?: string;
  href?: string;
  background?: React.ReactNode;
  children?: React.ReactNode;
}

export const BentoCard = ({
  className,
  Icon,
  name,
  description,
  cta,
  href,
  background,
  children,
}: BentoCardProps) => {
  return (
    <div
      className={cn(
        'row-span-1 rounded-2xl group/bento hover:shadow-xl transition duration-200 shadow-input dark:shadow-none p-6 bg-black/5 dark:bg-white/5 border border-white/10 overflow-hidden relative',
        className
      )}
    >
      <div className='absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-violet-600/10 z-0 opacity-0 group-hover/bento:opacity-100 transition duration-500'></div>
      {background && background}

      <div className='relative z-10'>
        <div className='flex flex-row justify-between items-start'>
          <div>
            {Icon && (
              <div className='p-2 rounded-full w-10 h-10 flex items-center justify-center border border-white/10 bg-black/5 dark:bg-white/5 text-white mb-4'>
                <Icon className='w-5 h-5' />
              </div>
            )}
            <h3 className='font-medium text-lg text-white mb-2'>{name}</h3>
          </div>
        </div>
        <p className='text-sm text-white/70 mb-4'>{description}</p>
        {cta && href && (
          <a
            href={href}
            className='inline-flex items-center text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors'
          >
            {cta}
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='16'
              height='16'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='ml-1 h-3 w-3'
            >
              <path d='M5 12h14' />
              <path d='m12 5 7 7-7 7' />
            </svg>
          </a>
        )}
        {children}
      </div>
    </div>
  );
};
