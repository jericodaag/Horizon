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
      <div className='w-full flex flex-col gap-6'>
        {/* Form header */}
        <div className='flex flex-col gap-2'>
          <h2 className='text-3xl font-bold'>Welcome Back 👋</h2>
          <p className='text-light-3'>
            Step into a new world of connections and possibilities.
            <br />
            Sign in and start your journey today!
          </p>
        </div>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='flex flex-col gap-5'
        >
          {/* Email field with validation */}
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-light-2'>Email</FormLabel>
                <FormControl>
                  <Input
                    type='email'
                    className='shad-input bg-dark-3'
                    placeholder='example@email.com'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password field with validation */}
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-light-2'>Password</FormLabel>
                <FormControl>
                  <Input
                    type='password'
                    className='shad-input bg-dark-3'
                    placeholder='At least 8 characters'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit button */}
          <motion.div
            whileHover={{ scale: isLoading || isRateLimited ? 1 : 1.01 }}
            whileTap={{ scale: isLoading || isRateLimited ? 1 : 0.99 }}
          >
            <Button
              type='submit'
              className='bg-primary-500 hover:bg-primary-600 text-light-1 w-full py-6 px-4 rounded-lg !mt-8'
              disabled={isLoading || isRateLimited}
            >
              {isRateLimited ? 'Please wait...' : 'Sign in'}
            </Button>
          </motion.div>

          {/* Password reset link (not required) */}
          <p className='text-light-2 text-center text-sm mt-2'>
            Forgot your password?{' '}
            <button
              type='button'
              className='text-primary-500 hover:underline'
              onClick={() => navigate('/reset-password')}
            >
              Reset it here
            </button>
          </p>
        </form>
      </div>
    </Form>
  );
};

export default SigninForm;