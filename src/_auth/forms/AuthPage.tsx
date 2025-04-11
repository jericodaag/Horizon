import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SigninForm from './SigninForm';
import SignupForm from './SignupForm';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import Loader from '@/components/shared/Loader';

// Testimonial data for carousel
const testimonials = [
  {
    quote: "Sharing moments has never been easier. Connect with friends and family in a space designed for authentic expression.",
    author: "Marcus Chen",
    title: "User Experience Lead",
    subtitle: "Digital Nomad"
  },
  {
    quote: "We move 10x faster than our peers and stay consistent. While they're bogged down with design debt, we're releasing new features.",
    author: "Sophie Hall",
    title: "Founder, Catalog",
    subtitle: "Web Design Agency"
  },
  {
    quote: "The platform's intuitive design makes sharing my creative journey seamless and engaging for my audience.",
    author: "Elena Rivera",
    title: "Content Creator",
    subtitle: "Visual Storyteller"
  }
];

const AuthPage: React.FC = () => {
  // Get current location and navigate function from React Router
  const location = useLocation();

  // Determine if we're on the sign-in page based on the URL
  const [isSignIn, setIsSignIn] = useState(location.pathname === '/sign-in');
  const navigate = useNavigate();

  // State for image carousel and loading UI
  const [currentImage, setCurrentImage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Update loading message based on current auth mode
  useEffect(() => {
    setLoadingMessage(isSignIn ? 'Signing in...' : 'Creating account...');
  }, [isSignIn]);

  // Handler to switch between sign-in and sign-up forms
  const handleFormSwitch = (isSignInForm: boolean) => {
    setIsSignIn(isSignInForm);
    navigate(isSignInForm ? '/sign-in' : '/sign-up');
  };

  // Navigate back to landing page
  const handleBackToLanding = () => {
    navigate('/');
  };

  // Allow child components to update loading state
  const handleLoadingChange = (loading: boolean) => {
    setIsLoading(loading);
  };

  // Handle carousel navigation
  const nextSlide = () => {
    setCurrentImage((prev) => (prev % 3) + 1);
  };

  const prevSlide = () => {
    setCurrentImage((prev) => (prev === 1 ? 3 : prev - 1));
  };

  return (
    <div className='flex min-h-screen w-full bg-dark-1'>
      {/* Back button */}
      <motion.button
        onClick={handleBackToLanding}
        className='fixed top-4 left-4 md:top-6 md:left-6 z-50 flex items-center gap-2 text-light-1 hover:text-primary-500 transition-colors'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <ArrowLeft className='w-4 h-4 md:w-5 md:h-5' />
        <span className='text-sm md:text-base font-medium'>Back</span>
      </motion.button>

      {/* Form section - takes full width on mobile, half width on desktop */}
      <div className='w-full md:w-1/2 min-h-screen flex flex-col justify-center relative overflow-hidden bg-black'>
        <div className='max-w-md mx-auto w-full px-4 sm:px-6 md:px-10 lg:px-16 py-8 md:py-0'>
          {/* Loading overlay - appears during authentication operations */}
          {isLoading && (
            <div className='fixed inset-0 bg-dark-1/80 backdrop-blur-sm z-30 flex items-center justify-center'>
              <div className='bg-dark-3 p-6 rounded-lg shadow-lg border border-dark-4 flex flex-col items-center gap-4'>
                <Loader />
                <p className='text-light-1 font-medium'>{loadingMessage}</p>
              </div>
            </div>
          )}

          {/* Animated form container - switches between sign-in and sign-up */}
          <AnimatePresence mode='wait'>
            <motion.div
              key={isSignIn ? 'signin' : 'signup'}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className='w-full'
            >
              {isSignIn ? (
                <>
                  <SigninForm onLoadingChange={handleLoadingChange} />
                  <div className='mt-6 text-center'>
                    <p className='text-light-3 text-sm sm:text-base'>
                      Don't have an account?
                      <button
                        onClick={() => handleFormSwitch(false)}
                        className='text-primary-500 hover:text-primary-600 transition-colors font-medium ml-1'
                      >
                        Sign up
                      </button>
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <SignupForm onLoadingChange={handleLoadingChange} />
                  <div className='mt-6 text-center'>
                    <p className='text-light-3 text-sm sm:text-base'>
                      Already have an account?
                      <button
                        onClick={() => handleFormSwitch(true)}
                        className='text-primary-500 hover:text-primary-600 transition-colors font-medium ml-1'
                      >
                        Sign in
                      </button>
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Copyright footer */}
          <motion.p
            className='text-light-3 text-center text-xs sm:text-sm mt-6 md:mt-8'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            © {new Date().getFullYear()} Horizon. All rights reserved.
          </motion.p>
        </div>
      </div>

      {/* Desktop: Image carousel - completely removed on mobile */}
      <div className='hidden md:block md:w-1/2 h-screen relative overflow-hidden'>
        <AnimatePresence mode='wait'>
          <motion.div
            key={currentImage}
            className='absolute inset-0 w-full h-full'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
          >
            {/* Image */}
            <img
              src={`/assets/images/carousel${currentImage}.jpg`}
              alt={`Testimonial ${currentImage}`}
              className='absolute inset-0 w-full h-full object-cover'
            />

            {/* Gradient overlay for better text visibility */}
            <div className='absolute inset-0 bg-gradient-to-t from-dark-1/80 via-dark-1/30 to-transparent' />

            {/* Testimonial content */}
            <div className='absolute bottom-32 left-12 right-12 text-light-1 z-10'>
              <motion.p
                className='text-xl lg:text-2xl xl:text-3xl font-medium mb-8 leading-relaxed'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {testimonials[currentImage - 1].quote}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h3 className='text-lg xl:text-xl font-bold'>{testimonials[currentImage - 1].author}</h3>
                <p className='text-light-2'>{testimonials[currentImage - 1].title}</p>
                <p className='text-light-3 text-sm'>{testimonials[currentImage - 1].subtitle}</p>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className='absolute bottom-12 right-12 flex items-center space-x-3 z-20'>
          <button
            onClick={prevSlide}
            className='p-3 rounded-full bg-dark-3/40 backdrop-blur-sm hover:bg-dark-3/60 text-light-1 transition-colors'
            aria-label="Previous slide"
          >
            <ChevronLeft className='w-5 h-5' />
          </button>
          <button
            onClick={nextSlide}
            className='p-3 rounded-full bg-dark-3/40 backdrop-blur-sm hover:bg-dark-3/60 text-light-1 transition-colors'
            aria-label="Next slide"
          >
            <ChevronRight className='w-5 h-5' />
          </button>
        </div>

        {/* Carousel indicator dots */}
        <div className='absolute bottom-12 left-12 flex space-x-2 z-20'>
          {[1, 2, 3].map((dot) => (
            <button
              key={dot}
              onClick={() => setCurrentImage(dot)}
              className={`h-2 rounded-full transition-all ${currentImage === dot ? 'bg-light-1 w-6' : 'bg-light-1/40 hover:bg-light-1/60 w-2'
                }`}
              aria-label={`Go to slide ${dot}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;