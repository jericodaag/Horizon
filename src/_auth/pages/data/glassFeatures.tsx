import { MessageCircle, Camera, Globe, Bookmark } from 'lucide-react';
import React from 'react';

export interface GlassFeature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export const glassFeatures: GlassFeature[] = [
  {
    title: 'Real-time Messaging',
    description:
      'Connect instantly with your followers through secure, instant messaging',
    icon: <MessageCircle className='h-5 w-5 text-violet-400' />,
  },
  {
    title: 'Post Creation',
    description:
      'Create and share posts with tags for better discovery by other users',
    icon: <Camera className='h-5 w-5 text-indigo-400' />,
  },
  {
    title: 'Multilingual Support',
    description:
      'Reach global audiences with automatic translation of posts and comments',
    icon: <Globe className='h-5 w-5 text-blue-400' />,
  },
  {
    title: 'Custom Collections',
    description: 'Organize saved content into personalized collections',
    icon: <Bookmark className='h-5 w-5 text-pink-400' />,
  },
];
