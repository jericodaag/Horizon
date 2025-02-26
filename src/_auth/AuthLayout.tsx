import { Outlet } from 'react-router-dom';

/**
 * AuthLayout Component
 * 
 * This component serves as a container for auth-related screens (sign-in, sign-up).
 * It centers the authentication forms vertically and horizontally in the viewport.
 * 
 * The Outlet component acts as a placeholder where the child routes defined
 * in the router configuration (typically SigninForm or SignupForm) will be rendered.
 * This allows for consistent layout across all authentication pages.
 */

const AuthLayout = () => {
  return (
    <section className='flex flex-1 justify-center items-center flex-col py-10'>
      <Outlet />
    </section>
  );
};

export default AuthLayout;