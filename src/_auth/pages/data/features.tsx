import { Camera, MessageCircle, Compass, Heart } from 'lucide-react';
import React from 'react';

export interface Feature {
  Icon: React.FC<{ className?: string }> | (() => JSX.Element);
  name: string;
  description: string;
  href?: string;
  cta?: string;
  className?: string;
  background?: React.ReactNode;
}

export const features: Feature[] = [
  {
    Icon: Camera,
    name: 'Create Posts',
    description:
      'Share your photos and moments with creators around the world.',
    href: '/sign-in',
    cta: 'Try it out',
    className: 'col-span-3 lg:col-span-1',
    background: (
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute top-10 left-6 text-sm opacity-5 text-blue-300 font-bold'>
          #photography
        </div>
        <div className='absolute bottom-12 right-8 text-sm opacity-5 text-indigo-300 font-bold'>
          #moments
        </div>
        <div className='absolute top-4 right-10 text-sm opacity-5 text-purple-300 font-bold'>
          #create
        </div>
        <div className='absolute bottom-6 left-10 text-sm opacity-5 text-sky-300 font-bold'>
          #share
        </div>
      </div>
    ),
  },
  {
    Icon: Heart,
    name: 'Engage With Content',
    description:
      'Like, comment and save your favorite posts for later viewing.',
    href: '/sign-in',
    cta: 'Learn more',
    className: 'col-span-3 lg:col-span-2',
    background: (
      <div className='absolute right-5 top-10 [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)]'>
        <div className='grid grid-cols-2 gap-4'>
          {[...Array(4)].map((_, idx) => (
            <div
              key={idx}
              className='w-24 h-24 rounded-lg bg-gradient-to-br from-purple-500/10 to-blue-500/10 flex items-center justify-center'
            >
              <Heart className='w-8 h-8 text-white/20' />
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    Icon: Compass,
    name: 'Discover Content',
    description: 'Find new creators and content tailored to your interests.',
    href: '/sign-in',
    cta: 'Explore now',
    className: 'col-span-3 lg:col-span-2',
    background: (
      <div className='absolute right-5 top-10 grid grid-cols-3 gap-2 [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)]'>
        {[...Array(6)].map((_, idx) => (
          <div
            key={idx}
            className='w-16 h-16 rounded-md bg-gradient-to-br from-indigo-500/10 to-purple-500/10'
          />
        ))}
      </div>
    ),
  },
  {
    Icon: MessageCircle,
    name: 'Connect',
    description: 'Chat with friends and create meaningful connections.',
    className: 'col-span-3 lg:col-span-1',
    href: '/sign-in',
    cta: 'Start chatting',
    background: (
      <div className='absolute right-5 top-10 opacity-20'>
        <div className='flex flex-col gap-2'>
          <div className='w-32 h-6 rounded-full bg-violet-500/20 self-end'></div>
          <div className='w-24 h-6 rounded-full bg-indigo-500/20 self-start'></div>
          <div className='w-36 h-6 rounded-full bg-violet-500/20 self-end'></div>
          <div className='w-28 h-6 rounded-full bg-indigo-500/20 self-start'></div>
        </div>
      </div>
    ),
  },
];
