import { Routes, Route, Navigate } from 'react-router-dom';
import './globals.css';
import RootLayout from './_root/RootLayout';
import AuthLayout from './_auth/AuthLayout';
import AuthPage from './_auth/forms/AuthPage';
import LandingPage from './_auth/pages/LandingPage';
import { useUserContext } from '@/context/AuthContext';
import {
  AllUsers,
  CreatePost,
  EditPost,
  Explore,
  Home,
  PostDetails,
  Profile,
  Saved,
  UpdateProfile,
} from './_root/pages';
import { Toaster } from '@/components/ui/toaster';

// Create a loading component
const LoadingScreen = () => (
  <div className='flex items-center justify-center w-full h-screen bg-dark-1'>
    <div className='w-10 h-10 border-4 border-primary-500 rounded-full animate-spin border-t-transparent'></div>
  </div>
);

const App = () => {
  const { isAuthenticated, isLoading } = useUserContext();

  // Show loading screen while authentication state is being determined
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <main className='flex h-screen'>
      <Routes>
        {/* Public routes */}
        {/* Landing page is always accessible, but redirects to home if authenticated */}
        <Route
          path='/'
          element={
            isAuthenticated ? <Navigate to='/home' replace /> : <LandingPage />
          }
        />

        {/* Auth Layout wraps all auth-related pages */}
        <Route
          element={
            isAuthenticated ? <Navigate to='/home' replace /> : <AuthLayout />
          }
        >
          <Route path='/sign-in' element={<AuthPage />} />
          <Route path='/sign-up' element={<AuthPage />} />
        </Route>

        {/* Protected routes - must be authenticated */}
        <Route
          element={
            isAuthenticated ? <RootLayout /> : <Navigate to='/' replace />
          }
        >
          <Route path='/home' element={<Home />} />
          <Route path='/explore' element={<Explore />} />
          <Route path='/saved' element={<Saved />} />
          <Route path='/all-users' element={<AllUsers />} />
          <Route path='/create-post' element={<CreatePost />} />
          <Route path='/update-post/:id' element={<EditPost />} />
          <Route path='/posts/:id' element={<PostDetails />} />
          <Route path='/profile/:id/*' element={<Profile />} />
          <Route path='/update-profile/:id' element={<UpdateProfile />} />
        </Route>

        {/* Catch all unknown routes and redirect to landing */}
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>

      <Toaster />
    </main>
  );
};

export default App;
