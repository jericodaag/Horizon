export interface Testimonial {
  quote: string;
  name: string;
  title: string;
  avatar?: string;
}

export const testimonials: Testimonial[] = [
  {
    quote:
      'Horizon has completely transformed how I share my photography with the world.',
    name: 'John Pingul',
    title: 'Professional Photographer',
    avatar: '/assets/avatars/avatar1.png',
  },
  {
    quote:
      "The connections I've made through this platform have been incredible. Best community ever!",
    name: 'Elmalia Diaz',
    title: 'Content Creator',
    avatar: '/assets/avatars/avatar2.png',
  },
  {
    quote:
      'This platform has helped me grow my audience by 300% in just three months.',
    name: 'Richard Darwin',
    title: 'Influencer',
    avatar: '/assets/avatars/avatar3.png',
  },
  {
    quote:
      'I love the clean interface and how easy it is to share my daily experiences.',
    name: 'Paul Santos',
    title: 'Travel Blogger',
    avatar: '/assets/avatars/avatar4.png',
  },
  {
    quote:
      "The engagement on my posts here is way higher than on any other platform I've used.",
    name: 'Ranielle Tuazon',
    title: 'Digital Artist',
    avatar: '/assets/avatars/avatar5.png',
  },
];
