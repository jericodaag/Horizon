import { Outlet } from 'react-router-dom';

/**
 * AuthLayout Component
 * 
 * This component serves as a container for auth-related screens (sign-in, sign-up).
 * It provides a full-height, full-width container with no additional padding.
 * 
 * The Outlet component acts as a placeholder where the child routes defined
 * in the router configuration will be rendered.
 */

const AuthLayout = () => {
  return (
    <section className='h-screen w-full'>
      <Outlet />
    </section>
  );
};

export default AuthLayout;