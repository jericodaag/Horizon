import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SigninForm from './SigninForm';
import SignupForm from './SignupForm';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthPage: React.FC = () => {
    const location = useLocation();
    const [isSignIn, setIsSignIn] = useState(location.pathname === '/sign-in');
    const navigate = useNavigate();

    const handleFormSwitch = (isSignInForm: boolean) => {
        setIsSignIn(isSignInForm);
        navigate(isSignInForm ? '/sign-in' : '/sign-up');
    };

    const slideTransition = {
        initial: { x: 0, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: isSignIn ? -100 : 100, opacity: 0 },
        transition: { type: "spring", stiffness: 100, damping: 20 }
    };

    return (
        <div className="flex min-h-screen w-full overflow-hidden bg-dark-1">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    className="absolute w-96 h-96 rounded-full bg-primary-500 opacity-[0.15]"
                    animate={{
                        x: [0, 100, 0],
                        y: [0, -50, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    style={{
                        left: '10%',
                        top: '20%'
                    }}
                />
                <motion.div
                    className="absolute w-96 h-96 rounded-full bg-primary-600 opacity-[0.15]"
                    animate={{
                        x: [0, -70, 0],
                        y: [0, 50, 0],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{
                        duration: 7,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    style={{
                        right: '10%',
                        bottom: '20%'
                    }}
                />
            </div>

            {/* Content container */}
            <div className="relative w-full flex items-center justify-center p-4">
                <div className="w-full max-w-5xl mx-auto flex items-center">
                    {/* Welcome text side */}
                    <motion.div
                        className="hidden lg:flex flex-col flex-1 p-12"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <motion.h1
                            className="text-6xl font-bold text-light-1 mb-6"
                            key={isSignIn ? 'signin' : 'signup'}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                        >
                            {isSignIn ? 'Welcome Back!' : 'Join Horizon'}
                        </motion.h1>
                        <motion.p
                            className="text-xl text-light-2"
                            key={isSignIn ? 'signin-text' : 'signup-text'}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            {isSignIn
                                ? 'Sign in to continue your journey with us.'
                                : 'Create an account to start sharing your moments.'}
                        </motion.p>
                    </motion.div>

                    {/* Form container */}
                    <div className="flex-1 max-w-md w-full">
                        <motion.div
                            className="bg-dark-2 backdrop-blur-lg rounded-2xl shadow-xl p-8"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={isSignIn ? 'signin-form' : 'signup-form'}
                                    {...slideTransition}
                                    className="w-full"
                                >
                                    {isSignIn ? (
                                        <div className="space-y-4">
                                            <SigninForm />
                                            <button
                                                onClick={() => handleFormSwitch(false)}
                                                className="text-primary-500 hover:text-primary-600 font-medium transition-colors text-small-regular w-full text-center mt-4"
                                            >
                                                Don't have an account? Sign up
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <SignupForm />
                                            <button
                                                onClick={() => handleFormSwitch(true)}
                                                className="text-primary-500 hover:text-primary-600 font-medium transition-colors text-small-regular w-full text-center mt-4"
                                            >
                                                Already have an account? Sign in
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;