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
import { Mail, Lock, User, UserPlus, KeyRound, AtSign, Info } from 'lucide-react';
import TermsModal from '@/components/shared/TermsModal';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'terms' | 'privacy'>('terms');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTermsError, setShowTermsError] = useState(false);

  // Handle opening modals
  const handleOpenModal = (type: 'terms' | 'privacy') => {
    setModalType(type);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Combined loading state
  const isLoading =
    isUserLoading || isCreatingAccount || isSigningIn || isSubmitting;

  // Update parent component loading state
  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(isLoading);
    }
  }, [isLoading, onLoadingChange]);

  // Clear terms error when user checks the box
  useEffect(() => {
    if (agreedToTerms) {
      setShowTermsError(false);
    }
  }, [agreedToTerms]);

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
    // Only check if the checkbox is checked, no need to verify if they viewed the terms
    if (!agreedToTerms) {
      setShowTermsError(true);
      toast({
        title: 'Agreement required',
        description: 'Please agree to our Terms of Service and Privacy Policy before signing up',
        variant: 'destructive',
      });
      return;
    }

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
      <TermsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        type={modalType}
      />
      <div className='w-full flex flex-col gap-4 sm:gap-6'>
        {/* Form Header */}
        <div className='flex flex-col gap-1 sm:gap-2'>
          <h2 className='text-2xl sm:text-3xl font-bold text-light-1'>Create Account 👋</h2>
          <p className='text-sm sm:text-base text-light-3'>
            To use Horizon, please enter your details
          </p>
        </div>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='flex flex-col gap-4 sm:gap-5'
        >
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-light-2 flex items-center gap-2 text-sm sm:text-base'>
                  <User className='h-3 w-3 sm:h-4 sm:w-4' />
                  Name
                </FormLabel>
                <FormControl>
                  <div className='relative'>
                    <Input
                      type='text'
                      className='shad-input bg-dark-3 pl-8 sm:pl-10 text-sm sm:text-base py-1.5 sm:py-2'
                      placeholder='Enter your name'
                      {...field}
                    />
                    <User className='absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-light-3 h-4 w-4 sm:h-5 sm:w-5' />
                  </div>
                </FormControl>
                <FormMessage className='text-red text-xs sm:text-sm' />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='username'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-light-2 flex items-center gap-2 text-sm sm:text-base'>
                  <AtSign className='h-3 w-3 sm:h-4 sm:w-4' />
                  Username
                </FormLabel>
                <FormControl>
                  <div className='relative'>
                    <Input
                      type='text'
                      className='shad-input bg-dark-3 pl-8 sm:pl-10 text-sm sm:text-base py-1.5 sm:py-2'
                      placeholder='Choose a username'
                      {...field}
                    />
                    <AtSign className='absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-light-3 h-4 w-4 sm:h-5 sm:w-5' />
                  </div>
                </FormControl>
                <FormMessage className='text-red text-xs sm:text-sm' />
              </FormItem>
            )}
          />

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

          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='text-light-2 flex items-center gap-2 text-sm sm:text-base'>
                  <Lock className='h-3 w-3 sm:h-4 sm:w-4' />
                  Password
                </FormLabel>
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

          {/* Terms and conditions */}
          <div className='flex items-start pt-1 sm:pt-2'>
            <div className='flex items-center h-5 mt-0.5'>
              <input
                id='terms'
                name='terms'
                type='checkbox'
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className='h-3 w-3 sm:h-4 sm:w-4 text-primary-500 focus:ring-primary-500 border-dark-4 rounded bg-dark-3 opacity-80'
              />
            </div>
            <div className='ml-2 sm:ml-3 text-xs sm:text-sm'>
              <label htmlFor='terms' className={`text-light-3 ${showTermsError ? 'text-red' : ''}`}>
                By creating an account, you agree to our{' '}
                <button
                  type='button'
                  onClick={() => handleOpenModal('terms')}
                  className='text-primary-500 hover:text-primary-600 font-medium'
                >
                  Terms of Service
                </button>{' '}
                and{' '}
                <button
                  type='button'
                  onClick={() => handleOpenModal('privacy')}
                  className='text-primary-500 hover:text-primary-600 font-medium'
                >
                  Privacy Policy
                </button>
              </label>
            </div>
          </div>

          {/* Terms error message */}
          {showTermsError && (
            <div className='flex items-center gap-2 text-red text-xs sm:text-sm -mt-2 sm:mt-0'>
              <Info className='h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0' />
              <span>
                Please agree to our Terms of Service and Privacy Policy to continue
              </span>
            </div>
          )}

          {/* Submit button */}
          <motion.div
            whileHover={{ scale: isLoading ? 1 : 1.01 }}
            whileTap={{ scale: isLoading ? 1 : 0.99 }}
            className='pt-1 sm:pt-2 relative group'
          >
            <Button
              type='submit'
              className='w-full py-4 sm:py-6 px-4 rounded-lg flex items-center justify-center gap-2 relative z-10 text-light-1 overflow-hidden text-sm sm:text-base'
              disabled={isLoading}
            >
              <span className='absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-100 group-hover:opacity-90 transition-opacity'></span>
              <UserPlus className='h-4 w-4 sm:h-5 sm:w-5 relative z-10' />
              <span className='relative z-10'>Sign up</span>
            </Button>
          </motion.div>

          {/* Sign up divider */}
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

export default SignupForm;