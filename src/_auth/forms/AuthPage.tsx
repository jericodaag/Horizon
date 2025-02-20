// src/_auth/forms/AuthPage.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SigninForm from './SigninForm';
import SignupForm from './SignupForm';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthPage: React.FC = () => {
  const location = useLocation();
  const [isSignIn, setIsSignIn] = useState(location.pathname === '/sign-in');
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(1);

  // Image carousel effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev % 3) + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleFormSwitch = (isSignInForm: boolean) => {
    setIsSignIn(isSignInForm);
    navigate(isSignInForm ? '/sign-in' : '/sign-up');
  };

  return (
    <div className='flex min-h-screen w-full bg-dark-1'>
      <div className='w-full flex justify-center items-center'>
        <div className='w-full max-w-6xl h-[800px] flex bg-dark-2 rounded-2xl overflow-hidden shadow-2xl'>
          {/* Image Section */}
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
              <div className='absolute inset-0 bg-gradient-to-t from-dark-1/80 via-dark-1/30 to-transparent' />
            </AnimatePresence>

            {/* Welcome Text Overlay */}
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

          {/* Form Section */}
          <div className='w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center'>
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
                    <SigninForm />
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
                    <SignupForm />
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

            {/* Copyright */}
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
