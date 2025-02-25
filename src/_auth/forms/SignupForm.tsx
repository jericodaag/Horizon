import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { SignupValidation } from '@/lib/validation';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import {
  useCreateUserAccount,
  useSignInAccount,
} from '@/lib/react-query/queries';
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

interface SignupFormProps {
  onLoadingChange?: (isLoading: boolean) => void;
}

const SignupForm = ({ onLoadingChange }: SignupFormProps) => {
  const { toast } = useToast();
  const { checkAuthUser, isLoading: isUserLoading } = useUserContext();
  const navigate = useNavigate();
  const { mutateAsync: createUserAccount, isPending: isCreatingAccount } =
    useCreateUserAccount();
  const { mutateAsync: signInAccount, isPending: isSigningIn } =
    useSignInAccount();

  // Track local loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Combined loading state
  const isLoading =
    isUserLoading || isCreatingAccount || isSigningIn || isSubmitting;

  // Update parent component loading state
  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(isLoading);
    }
  }, [isLoading, onLoadingChange]);

  const form = useForm<z.infer<typeof SignupValidation>>({
    resolver: zodResolver(SignupValidation),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof SignupValidation>) {
    try {
      setIsSubmitting(true); // Start local loading

      const newUser = await createUserAccount(values);

      if (!newUser) {
        setIsSubmitting(false); // Stop local loading
        return toast({
          title: 'Sign up failed',
          description: 'Please try again later.',
          variant: 'destructive',
        });
      }

      const session = await signInAccount({
        email: values.email,
        password: values.password,
      });

      if (!session) {
        setIsSubmitting(false); // Stop local loading
        return toast({
          title: 'Sign in failed',
          description:
            'Account created but sign in failed. Please sign in manually.',
          variant: 'destructive',
        });
      }

      const isLoggedIn = await checkAuthUser();

      if (isLoggedIn) {
        form.reset();
        // Don't stop loading since we're navigating away
        navigate('/home');
      } else {
        setIsSubmitting(false); // Stop local loading
        toast({
          title: 'Authentication failed',
          description: 'Please try signing in manually.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      setIsSubmitting(false); // Stop local loading

      toast({
        title: 'Sign up failed',
        description: error.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });

      form.reset();
    }
  }

  return (
    <Form {...form}>
      <div className='w-full flex flex-col gap-6'>
        {/* Form Header */}
        <div className='flex flex-col gap-2'>
          <h2 className='text-3xl font-bold'>Create Account 👋</h2>
          <p className='text-light-3'>
            To use Horizon, please enter your details
          </p>
        </div>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='flex flex-col gap-5'
        >
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-light-2'>Name</FormLabel>
                <FormControl>
                  <Input
                    type='text'
                    className='shad-input bg-dark-3'
                    placeholder='Enter your name'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='username'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-light-2'>Username</FormLabel>
                <FormControl>
                  <Input
                    type='text'
                    className='shad-input bg-dark-3'
                    placeholder='Choose a username'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
            whileHover={{ scale: isLoading ? 1 : 1.01 }}
            whileTap={{ scale: isLoading ? 1 : 0.99 }}
          >
            <Button
              type='submit'
              className='bg-primary-500 hover:bg-primary-600 text-light-1 w-full py-6 px-4 rounded-lg !mt-8'
              disabled={isLoading}
            >
              Sign up
            </Button>
          </motion.div>
        </form>
      </div>
    </Form>
  );
};

export default SignupForm;
