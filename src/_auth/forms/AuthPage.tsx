import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SigninForm from './SigninForm';
import SignupForm from './SignupForm';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Loader from '@/components/shared/Loader';

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

  // Set up image carousel to rotate every 5secs
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev % 3) + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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

  return (
    <div className='flex min-h-screen w-full bg-dark-1'>
      {/* Back button */}
      <motion.button
        onClick={handleBackToLanding}
        className='fixed top-6 left-6 z-20 flex items-center gap-2 text-light-1 hover:text-primary-500 transition-colors'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <ArrowLeft className='w-5 h-5' />
        <span className='font-medium'>Back to Home</span>
      </motion.button>

      <div className='w-full flex justify-center items-center'>
        <div className='w-full max-w-6xl h-[800px] flex bg-dark-2 rounded-2xl overflow-hidden shadow-2xl'>
          {/* Left side: Image carousel (hidden upon switched to mobile) */}
          <div className='relative hidden lg:block w-1/2 overflow-hidden'>
            <AnimatePresence mode='wait'>
              <motion.img
                key={currentImage}
                src={`/assets/images/carousel${currentImage}.jpg`}
                alt='carousel'
                className='absolute inset-0 w-full h-full object-cover'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              />
              {/* Gradient overlay for better text visibility */}
              <div className='absolute inset-0 bg-gradient-to-t from-dark-1/80 via-dark-1/30 to-transparent' />
            </AnimatePresence>

            {/* Welcome text overlay on carousel */}
            <div className='absolute bottom-20 left-10 right-10 text-light-1'>
              <motion.h1
                className='text-5xl font-bold mb-4'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {isSignIn ? 'Welcome Back!' : 'Join Horizon'}
              </motion.h1>
              <motion.p
                className='text-xl text-light-2'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {isSignIn
                  ? 'Sign in to continue your journey with us.'
                  : 'Create an account to start sharing your moments.'}
              </motion.p>
            </div>
          </div>

          {/* Right side: Form section */}
          <div className='w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center relative overflow-hidden'>
            {/* Loading overlay - appears during authentication operations */}
            {isLoading && (
              <div className='absolute inset-0 bg-dark-2/80 backdrop-blur-sm z-30 flex items-center justify-center'>
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
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className='w-full'
              >
                {isSignIn ? (
                  <>
                    <SigninForm onLoadingChange={handleLoadingChange} />
                    <div className='mt-6 text-center'>
                      <p className='text-light-3'>
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
                      <p className='text-light-3'>
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
              className='text-light-3 text-center text-sm mt-8'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              © {new Date().getFullYear()} ALL RIGHTS RESERVED
            </motion.p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;