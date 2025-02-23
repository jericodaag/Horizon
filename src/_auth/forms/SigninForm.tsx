import { useState } from 'react';
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
import Loader from '@/components/shared/Loader';

const SigninForm = () => {
  const { toast } = useToast();
  const { checkAuthUser, isLoading: isUserLoading } = useUserContext();
  const navigate = useNavigate();
  const { mutateAsync: signInAccount } = useSignInAccount();

  // Add rate limiting state
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);

  const form = useForm<z.infer<typeof SigninValidation>>({
    resolver: zodResolver(SigninValidation),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof SigninValidation>) {
    // Check if rate limited
    if (isRateLimited) {
      toast({
        title: 'Please wait',
        description: 'Too many attempts. Please try again in 30 seconds.',
        variant: 'destructive',
      });
      return;
    }

    // Increment attempt count
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
      const session = await signInAccount({
        email: values.email,
        password: values.password,
      });

      if (!session) {
        return toast({
          title: 'Sign in failed',
          description: 'Please check your credentials and try again.',
          variant: 'destructive',
        });
      }

      const isLoggedIn = await checkAuthUser();

      if (isLoggedIn) {
        form.reset();
        navigate('/home');
      } else {
        toast({
          title: 'Sign in failed',
          description: 'Unable to verify authentication. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      // Handle different types of errors
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
        {/* Form Header */}
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

          <motion.div
            whileHover={{ scale: isRateLimited || isUserLoading ? 1 : 1.01 }}
            whileTap={{ scale: isRateLimited || isUserLoading ? 1 : 0.99 }}
          >
            <Button
              type='submit'
              className='bg-primary-500 hover:bg-primary-600 text-light-1 w-full py-6 px-4 rounded-lg !mt-8'
              disabled={isUserLoading || isRateLimited}
            >
              {isUserLoading ? (
                <div className='flex-center gap-2'>
                  <Loader />
                  Loading...
                </div>
              ) : isRateLimited ? (
                'Please wait...'
              ) : (
                'Sign in'
              )}
            </Button>
          </motion.div>

          {/* Password Reset Link */}
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
