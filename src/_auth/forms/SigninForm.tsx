import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { SigninValidation } from '@/lib/validation';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useSignInAccount } from '@/lib/react-query/queries';
import { useUserContext } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { motion } from 'framer-motion';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, Lock, LogIn, KeyRound } from 'lucide-react';

interface SigninFormProps {
  onLoadingChange?: (isLoading: boolean) => void;
}

const SigninForm = ({ onLoadingChange }: SigninFormProps) => {
  const { toast } = useToast();
  const { checkAuthUser, isLoading: isUserLoading } = useUserContext();
  const navigate = useNavigate();
  const { mutateAsync: signInAccount, isPending: isSigningIn } =
    useSignInAccount();

  // State for managing form submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add rate limiting state to prevent brute force attacks
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  // Combine all loading states for UI feedback
  const isLoading = isUserLoading || isSigningIn || isSubmitting;

  // Notify parent component of loading state changes
  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(isLoading);
    }
  }, [isLoading, onLoadingChange]);

  // Initialize form with validation schema
  const form = useForm<z.infer<typeof SigninValidation>>({
    resolver: zodResolver(SigninValidation),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Form submission handler
  async function onSubmit(values: z.infer<typeof SigninValidation>) {
    // Check if user is rate limited
    if (isRateLimited) {
      toast({
        title: 'Please wait',
        description: 'Too many attempts. Please try again in 30 seconds.',
        variant: 'destructive',
      });
      return;
    }

    // Track login attempts for rate limiting
    setAttemptCount((prev) => prev + 1);
    if (attemptCount >= 3) {
      setIsRateLimited(true);
      toast({
        title: 'Too many attempts',
        description: 'Please wait 30 seconds before trying again.',
        variant: 'destructive',
      });
      setTimeout(() => {
        setIsRateLimited(false);
        setAttemptCount(0);
      }, 30000);
      return;
    }

    try {
      setIsSubmitting(true); // Start loading indicator

      // Attempt to sign in with provided credentials
      const session = await signInAccount({
        email: values.email,
        password: values.password,
      });

      if (!session) {
        setIsSubmitting(false);
        return toast({
          title: 'Sign in failed',
          description: 'Please check your credentials and try again.',
          variant: 'destructive',
        });
      }

      // Verify user authentication state
      const isLoggedIn = await checkAuthUser();

      if (isLoggedIn) {
        form.reset();
        // Keep loading indicator on during navigation
        navigate('/home');
      } else {
        setIsSubmitting(false);
        toast({
          title: 'Sign in failed',
          description: 'Unable to verify authentication. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      setIsSubmitting(false);

      // Handle different types of authentication errors
      if (error.message?.includes('Rate limit')) {
        setIsRateLimited(true);
        setTimeout(() => {
          setIsRateLimited(false);
          setAttemptCount(0);
        }, 30000);
        toast({
          title: 'Rate limit exceeded',
          description: 'Please wait 30 seconds before trying again.',
          variant: 'destructive',
        });
      } else if (error.message?.includes('Invalid credentials')) {
        toast({
          title: 'Invalid credentials',
          description: 'Please check your email and password.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Sign in failed',
          description:
            error.message || 'An unexpected error occurred. Please try again.',
          variant: 'destructive',
        });
      }
      form.reset();
    }
  }

  return (
    <Form {...form}>
      <div className='w-full flex flex-col gap-4 sm:gap-6'>
        {/* Form header */}
        <div className='flex flex-col gap-1 sm:gap-2'>
          <h2 className='text-2xl sm:text-3xl font-bold text-light-1'>Welcome Back 👋</h2>
          <p className='text-sm sm:text-base text-light-3'>
            Step into a new world of connections and possibilities.
            <br className='hidden sm:block' />
            Sign in and start your journey today!
          </p>
        </div>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='flex flex-col gap-4 sm:gap-5'
        >
          {/* Email field with validation */}
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-light-2 flex items-center gap-2 text-sm sm:text-base'>
                  <Mail className='h-3 w-3 sm:h-4 sm:w-4' />
                  Email
                </FormLabel>
                <FormControl>
                  <div className='relative'>
                    <Input
                      type='email'
                      className='shad-input bg-dark-3 pl-8 sm:pl-10 text-sm sm:text-base py-1.5 sm:py-2'
                      placeholder='example@email.com'
                      {...field}
                    />
                    <Mail className='absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-light-3 h-4 w-4 sm:h-5 sm:w-5' />
                  </div>
                </FormControl>
                <FormMessage className='text-red text-xs sm:text-sm' />
              </FormItem>
            )}
          />

          {/* Password field with validation */}
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <div className='flex justify-between items-center'>
                  <FormLabel className='text-light-2 flex items-center gap-2 text-sm sm:text-base'>
                    <Lock className='h-3 w-3 sm:h-4 sm:w-4' />
                    Password
                  </FormLabel>
                  <button
                    type='button'
                    className='text-xs sm:text-sm text-primary-500 hover:text-primary-600 font-medium'
                    onClick={() => navigate('/reset-password')}
                  >
                    Forgot password?
                  </button>
                </div>
                <FormControl>
                  <div className='relative'>
                    <Input
                      type='password'
                      className='shad-input bg-dark-3 pl-8 sm:pl-10 text-sm sm:text-base py-1.5 sm:py-2'
                      placeholder='At least 8 characters'
                      {...field}
                    />
                    <KeyRound className='absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-light-3 h-4 w-4 sm:h-5 sm:w-5' />
                  </div>
                </FormControl>
                <FormMessage className='text-red text-xs sm:text-sm' />
              </FormItem>
            )}
          />

          {/* Submit button */}
          <motion.div
            whileHover={{ scale: isLoading || isRateLimited ? 1 : 1.01 }}
            whileTap={{ scale: isLoading || isRateLimited ? 1 : 0.99 }}
            className='pt-1 sm:pt-2 relative group'
          >
            <Button
              type='submit'
              className='w-full py-4 sm:py-6 px-4 rounded-lg flex items-center justify-center gap-2 relative z-10 text-light-1 overflow-hidden text-sm sm:text-base'
              disabled={isLoading || isRateLimited}
            >
              <span className='absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-100 group-hover:opacity-90 transition-opacity'></span>
              <LogIn className='h-4 w-4 sm:h-5 sm:w-5 relative z-10' />
              <span className='relative z-10'>
                {isRateLimited ? 'Please wait...' : 'Sign in'}
              </span>
            </Button>
          </motion.div>

          {/* Sign in divider */}
          <div className='relative mt-2 sm:mt-4'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-dark-4'></div>
            </div>
            <div className='relative flex justify-center text-xs sm:text-sm'>
              <span className='px-2 bg-black text-light-3'>or</span>
            </div>
          </div>
        </form>
      </div>
    </Form>
  );
};

export default SigninForm;