import React from 'react';

export const LandingFooter: React.FC = () => {
  return (
    <footer className='w-full px-6 py-12 relative z-10 bg-black'>
      <div className='max-w-[1400px] mx-auto'>
        <div className='flex flex-col md:flex-row justify-between items-center md:items-start mb-10'>
          <div className='text-center md:text-left mb-8 md:mb-0'>
            <h3 className='text-2xl font-bold mb-2'>HORIZON</h3>
            <p className='text-gray-400 text-sm max-w-xs'>
              A modern social platform for creators and storytellers
            </p>
            <div className='flex gap-4 mt-4 justify-center md:justify-start'>
              <a
                href='https://www.facebook.com/DaagEco'
                target='_blank'
                rel='noopener noreferrer'
                className='w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors'
              >
                <svg
                  className='w-4 h-4 text-white'
                  viewBox='0 0 24 24'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              </a>
              <a
                href='https://www.instagram.com/ecodaag'
                target='_blank'
                rel='noopener noreferrer'
                className='w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors'
              >
                <svg
                  className='w-4 h-4 text-white'
                  viewBox='0 0 24 24'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                  <rect
                    x='2'
                    y='2'
                    width='20'
                    height='20'
                    rx='5'
                    stroke='currentColor'
                    strokeWidth='2'
                  />
                  <path
                    d='M17.5 6.5L17.51 6.5'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                  />
                </svg>
              </a>
              <a
                href='https://www.linkedin.com/in/jerico-daag'
                target='_blank'
                rel='noopener noreferrer'
                className='w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors'
              >
                <svg
                  className='w-4 h-4 text-white'
                  viewBox='0 0 24 24'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M16 8C17.5913 8 19.1174 8.63214 20.2426 9.75736C21.3679 10.8826 22 12.4087 22 14V21H18V14C18 13.4696 17.7893 12.9609 17.4142 12.5858C17.0391 12.2107 16.5304 12 16 12C15.4696 12 14.9609 12.2107 14.5858 12.5858C14.2107 12.9609 14 13.4696 14 14V21H10V14C10 12.4087 10.6321 10.8826 11.7574 9.75736C12.8826 8.63214 14.4087 8 16 8Z'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                  <path
                    d='M6 9H2V21H6V9Z'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                  <path
                    d='M4 6C5.10457 6 6 5.10457 6 4C6 2.89543 5.10457 2 4 2C2.89543 2 2 2.89543 2 4C2 5.10457 2.89543 6 4 6Z'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              </a>
            </div>
          </div>

          <div className='grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16'>
            <div>
              <h4 className='text-sm font-semibold mb-4 text-white'>
                Features
              </h4>
              <ul className='space-y-2 text-gray-400 text-xs'>
                <li className='hover:text-white transition-colors'>
                  <a href='#'>Photo Sharing</a>
                </li>
                <li className='hover:text-white transition-colors'>
                  <a href='#'>Stories</a>
                </li>
                <li className='hover:text-white transition-colors'>
                  <a href='#'>Messaging</a>
                </li>
                <li className='hover:text-white transition-colors'>
                  <a href='#'>Explore</a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className='text-sm font-semibold mb-4 text-white'>Company</h4>
              <ul className='space-y-2 text-gray-400 text-xs'>
                <li className='hover:text-white transition-colors'>
                  <a href='#'>About Us</a>
                </li>
                <li className='hover:text-white transition-colors'>
                  <a href='#'>Careers</a>
                </li>
                <li className='hover:text-white transition-colors'>
                  <a href='#'>Press</a>
                </li>
                <li className='hover:text-white transition-colors'>
                  <a href='#'>Contact</a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className='text-sm font-semibold mb-4 text-white'>Legal</h4>
              <ul className='space-y-2 text-gray-400 text-xs'>
                <li className='hover:text-white transition-colors'>
                  <a href='#'>Terms of Service</a>
                </li>
                <li className='hover:text-white transition-colors'>
                  <a href='#'>Privacy Policy</a>
                </li>
                <li className='hover:text-white transition-colors'>
                  <a href='#'>Cookie Policy</a>
                </li>
                <li className='hover:text-white transition-colors'>
                  <a href='#'>Guidelines</a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className='text-sm font-semibold mb-4 text-white'>Support</h4>
              <ul className='space-y-2 text-gray-400 text-xs'>
                <li className='hover:text-white transition-colors'>
                  <a href='#'>Help Center</a>
                </li>
                <li className='hover:text-white transition-colors'>
                  <a href='#'>Safety Center</a>
                </li>
                <li className='hover:text-white transition-colors'>
                  <a href='#'>Community</a>
                </li>
                <li className='hover:text-white transition-colors'>
                  <a href='#'>Creators</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className='pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between'>
          <p className='text-gray-400 font-inter text-xs mb-4 md:mb-0'>
            © {new Date().getFullYear()} Horizon. All rights reserved.
          </p>
          <div className='flex items-center gap-4'>
            <a
              href='#'
              className='text-xs text-gray-400 hover:text-white transition-colors'
            >
              Terms
            </a>
            <a
              href='#'
              className='text-xs text-gray-400 hover:text-white transition-colors'
            >
              Privacy
            </a>
            <a
              href='#'
              className='text-xs text-gray-400 hover:text-white transition-colors'
            >
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
