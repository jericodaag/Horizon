import { Routes, Route } from 'react-router-dom';
import './globals.css';
import RootLayout from './_root/RootLayout';
import AuthLayout from './_auth/AuthLayout';
import AuthPage from './_auth/forms/AuthPage';
import LandingPage from './_auth/pages/LandingPage';
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

const App = () => {
  return (
    <main className='flex h-screen'>
      <Routes>
        {/* Landing page route */}
        <Route path='/' element={<LandingPage />} />

        {/* Public routes */}
        <Route element={<AuthLayout />}>
          <Route path='/sign-in' element={<AuthPage />} />
          <Route path='/sign-up' element={<AuthPage />} />
        </Route>

        {/* Private routes */}
        <Route element={<RootLayout />}>
          <Route path='/home' element={<Home />} />{' '}
          {/* Changed from index to /home */}
          <Route path='/explore' element={<Explore />} />
          <Route path='/saved' element={<Saved />} />
          <Route path='/all-users' element={<AllUsers />} />
          <Route path='/create-post' element={<CreatePost />} />
          <Route path='/update-post/:id' element={<EditPost />} />
          <Route path='/posts/:id' element={<PostDetails />} />
          <Route path='/profile/:id/*' element={<Profile />} />
          <Route path='/update-profile/:id' element={<UpdateProfile />} />
        </Route>
      </Routes>

      <Toaster />
    </main>
  );
};

export default App;
