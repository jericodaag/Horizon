import React from 'react';
import { motion } from 'framer-motion';
import {
  MessageCircle,
  Camera,
  Users,
  Bell,
  ArrowRight,
  Wifi,
  Battery,
} from 'lucide-react';

interface LandingAppMockupProps {
  hasIntersected: boolean;
  setupRef: (ref: HTMLElement | null) => void;
}

export const LandingAppMockup: React.FC<LandingAppMockupProps> = ({
  hasIntersected,
  setupRef,
}) => {
  return (
    <section
      id='features'
      className='w-full py-20 sm:py-28 bg-black relative overflow-hidden'
      ref={setupRef}
    >
      <div className='max-w-7xl mx-auto px-4 sm:px-6 relative z-10'>
        <div className='text-center mb-12 sm:mb-16'>
          <motion.p
            className='text-violet-400 text-sm font-medium mb-2'
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            MODERN EXPERIENCE
          </motion.p>
          <motion.h2
            className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-white/90'
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            A social platform reimagined
          </motion.h2>
          <motion.p
            className='text-gray-400 max-w-2xl mx-auto text-sm sm:text-base'
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Experience a sleek, intuitive interface designed for modern creators
            and social networkers
          </motion.p>
        </div>

        {hasIntersected && (
          <div className='mt-12 sm:mt-16 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12'>
            {/* Mobile App Mockup */}
            <motion.div
              className='w-full max-w-[320px] relative'
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <div className='relative w-full rounded-3xl overflow-hidden aspect-[9/19] frosted-glass shadow-2xl border border-white/10'>
                {/* Phone frame */}
                <div className='absolute inset-0 z-10 pointer-events-none'>
                  {/* Notch */}
                  <div className='absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-6 bg-black rounded-b-xl'></div>
                </div>

                {/* App Content */}
                <div className='absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black/90 flex flex-col h-full'>
                  {/* Status Bar */}
                  <div className='absolute top-0 inset-x-0 h-7 flex items-center justify-between px-6'>
                    <div className='text-xs text-white/80'>12:00</div>
                    <div className='flex items-center space-x-2'>
                      {/* WiFi Icon */}
                      <Wifi className='w-4 h-4 text-white/80' />
                      {/* Battery Icon */}
                      <Battery className='w-5 h-4 text-white/80' />
                    </div>
                  </div>

                  {/* App Header */}
                  <div className='pt-9 px-4 flex-shrink-0'>
                    <div className='flex justify-between items-center'>
                      <div className='text-xl font-bold'>HORIZON</div>
                      <div className='flex gap-4'>
                        <div className='w-6 h-6'>
                          <img
                            src='/assets/icons/liked.svg'
                            alt='Notification'
                            className='w-full h-full text-white/90'
                          />
                        </div>
                        <div className='w-6 h-6'>
                          <img
                            src='/assets/icons/message.svg'
                            alt='Message'
                            className='w-full h-full text-white/90'
                          />
                        </div>
                      </div>
                    </div>

                    {/* Stories */}
                    <div className='mt-3'>
                      <div className='flex justify-between'>
                        {/* Your story */}
                        <div className='flex flex-col items-center'>
                          <div className='w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-violet-500 via-pink-500 to-blue-500'>
                            <div className='w-full h-full rounded-full bg-black flex items-center justify-center'>
                              <img
                                src='/assets/icons/add-post.svg'
                                alt='Add story'
                                className='w-5 h-5 text-white'
                              />
                            </div>
                          </div>
                          <span className='text-xs mt-1 text-white/80'>
                            Your story
                          </span>
                        </div>

                        {/* Other stories */}
                        {['bateman_', 'tyler1', 'wayne'].map(
                          (username, index) => (
                            <div
                              key={index}
                              className='flex flex-col items-center'
                            >
                              <div className='w-14 h-14 rounded-full p-[2px] bg-gradient-to-br from-violet-500 via-pink-500 to-blue-500'>
                                <div className='w-full h-full rounded-full bg-gradient-to-br from-purple-500/40 to-blue-500/40 overflow-hidden'>
                                  <img
                                    src={`/assets/stories/story${index + 1}.jpg`}
                                    alt={`${username}'s story`}
                                    className='w-full h-full object-cover'
                                  />
                                </div>
                              </div>
                              <span className='text-xs mt-1 text-white/80'>
                                {username}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Posts Section - Single post with expanded image */}
                  <div className='border-t border-white/10 mt-3 flex-grow flex flex-col overflow-hidden'>
                    {/* Single Post */}
                    <div className='p-3 flex flex-col h-full'>
                      <div className='flex items-center gap-2'>
                        <div className='w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 overflow-hidden'>
                          <img
                            src='/assets/avatars/avatar.jpg'
                            alt='eco_dev'
                            className='w-full h-full object-cover'
                          />
                        </div>
                        <div>
                          <div className='text-sm font-medium'>eco_dev</div>
                          <div className='text-xs text-white/60'>
                            Tokyo, Japan
                          </div>
                        </div>
                        <div className='ml-auto'>
                          <img
                            src='/assets/icons/edit.svg'
                            alt='Edit'
                            className='w-5 h-5 text-white/80'
                          />
                        </div>
                      </div>

                      {/* Post image - significantly larger to fill space */}
                      <div className='mt-2 flex-grow rounded-md bg-black/30 overflow-hidden'>
                        <img
                          src='/assets/images/post1.jpg'
                          alt='Post image'
                          className='w-full h-full object-cover'
                        />
                      </div>

                      {/* Post interactions */}
                      <div className='mt-2'>
                        <div className='flex justify-between items-center'>
                          <div className='flex gap-3'>
                            <img
                              src='/assets/icons/liked.svg'
                              alt='Heart'
                              className='w-5 h-5 text-rose-500'
                            />
                            <img
                              src='/assets/icons/comment.svg'
                              alt='Comment'
                              className='w-5 h-5 text-white/80'
                            />
                            <img
                              src='/assets/icons/share.svg'
                              alt='Share'
                              className='w-5 h-5 text-white/80'
                            />
                          </div>
                          <img
                            src='/assets/icons/bookmark.svg'
                            alt='Bookmark'
                            className='w-5 h-5 text-white/80'
                          />
                        </div>
                        <div className='mt-0.5 text-xs font-medium'>
                          1,482 likes
                        </div>
                        <div className='mt-0.5 text-xs'>
                          <span className='font-medium'>eco_dev</span>
                          <span className='text-white/80'>
                            {' '}
                            Exploring the beautiful streets of Tokyo #travel
                            #japan
                          </span>
                        </div>
                        <div className='mt-0.5 text-xs text-white/60'>
                          View all 42 comments
                        </div>
                        <div className='mt-0.5 text-xs text-white/50'>
                          2 HOURS AGO
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Navigation */}
                  <div className='flex-shrink-0 h-14 border-t border-white/10 flex items-center justify-around px-2'>
                    <div className='w-6 h-6'>
                      <img
                        src='/assets/icons/home.svg'
                        alt='Home'
                        className='w-full h-full text-white'
                      />
                    </div>
                    <div className='w-6 h-6'>
                      <img
                        src='/assets/icons/search-home.svg'
                        alt='Search'
                        className='w-full h-full text-white/70'
                      />
                    </div>
                    <div className='w-6 h-6'>
                      <img
                        src='/assets/icons/gallery-add.svg'
                        alt='Add post'
                        className='w-full h-full text-white/70'
                      />
                    </div>
                    <div className='w-6 h-6'>
                      <img
                        src='/assets/icons/like.svg'
                        alt='Notifications'
                        className='w-full h-full text-white/70'
                      />
                    </div>
                    <div className='w-6 h-6'>
                      <img
                        src='/assets/avatars/mobile-icon.jpg'
                        alt='Profile'
                        className='w-full h-full rounded-full object-cover'
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className='absolute -z-10 -bottom-8 -right-8 w-40 h-40 bg-violet-600/40 rounded-full filter blur-[80px]'></div>
              <div className='absolute -z-10 -top-8 -left-8 w-40 h-40 bg-blue-600/30 rounded-full filter blur-[80px]'></div>
            </motion.div>

            {/* Feature Highlights */}
            <motion.div
              className='max-w-lg w-full'
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.5 }}
            >
              <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                {[
                  {
                    icon: <Camera className='w-6 h-6 text-violet-400' />,
                    title: 'Rich Media Posts',
                    description:
                      'Share photos, videos, and stories that disappear after 24 hours',
                  },
                  {
                    icon: <Users className='w-6 h-6 text-violet-400' />,
                    title: 'Social Connections',
                    description:
                      'Follow friends and discover new creators worldwide',
                  },
                  {
                    icon: <MessageCircle className='w-6 h-6 text-violet-400' />,
                    title: 'Real-time Chat',
                    description:
                      'Direct messaging with read receipts and typing indicators',
                  },
                  {
                    icon: <Bell className='w-6 h-6 text-violet-400' />,
                    title: 'Smart Notifications',
                    description:
                      'Stay updated on likes, comments, and new followers',
                  },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    className='p-5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors'
                    whileHover={{
                      y: -5,
                      x: 0,
                      transition: { duration: 0.2 },
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  >
                    <div className='w-12 h-12 flex items-center justify-center rounded-full bg-white/5 mb-4'>
                      {feature.icon}
                    </div>
                    <h3 className='text-lg font-semibold mb-2'>
                      {feature.title}
                    </h3>
                    <p className='text-sm text-white/70'>
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>

              <div className='mt-6 flex justify-center md:justify-start'>
                <motion.button
                  onClick={() => (window.location.href = '/sign-up')}
                  className='relative px-5 py-2.5 overflow-hidden rounded-full group'
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className='absolute inset-0 w-full h-full bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 opacity-100 group-hover:opacity-90 transition-opacity'></span>
                  <span className='relative flex items-center justify-center gap-2 text-white font-medium text-sm'>
                    Try It Now
                    <ArrowRight className='w-4 h-4' />
                  </span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
};
