import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
  index?: number;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  className,
  index = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.2, duration: 0.5 }}
      viewport={{ once: true }}
      className={cn(
        'group flex flex-col p-8 rounded-2xl transition-all duration-300',
        'hover:bg-white/[0.05] hover:shadow-lg hover:shadow-violet-500/10',
        'border border-white/[0.08] bg-white/[0.02]',
        className
      )}
    >
      <div className='relative mb-6 w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-violet-600/20 to-indigo-600/20 text-violet-500 group-hover:from-violet-600/30 group-hover:to-indigo-600/30 group-hover:text-white transition-all duration-300'>
        {icon}
      </div>
      <h3 className='text-2xl font-bold mb-3 text-white group-hover:text-violet-400 transition-colors duration-300'>
        {title}
      </h3>
      <p className='text-gray-400 group-hover:text-gray-300 transition-colors duration-300'>
        {description}
      </p>
    </motion.div>
  );
};

export default FeatureCard;
