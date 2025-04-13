export interface CarouselItem {
  category: string;
  title: string;
  description: string;
  image: string;
}

export const carouselItems: CarouselItem[] = [
  {
    category: 'Social',
    title: 'Connect With Friends',
    description: 'Build meaningful relationships with creators worldwide',
    image: '/assets/images/image1.jpg',
  },
  {
    category: 'Create',
    title: 'Share Your Story',
    description: 'Express yourself through photos, videos, and stories',
    image: '/assets/images/image2.jpg',
  },
  {
    category: 'Explore',
    title: 'Discover Content',
    description: 'Find new creators aligned with your interests',
    image: '/assets/images/image3.jpg',
  },
  {
    category: 'Growth',
    title: 'Grow Your Community',
    description: 'Expand your reach and build your personal brand',
    image: '/assets/images/image4.jpg',
  },
  {
    category: 'Engage',
    title: 'Real-time Interactions',
    description: 'Engage with your audience through live features',
    image: '/assets/images/image6.jpg',
  },
];
