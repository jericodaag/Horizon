import { useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { useSignOutAccount } from '@/lib/react-query/queries';
import { useUserContext } from '@/context/AuthContext';
import { sidebarLinks } from '@/constants';
import { INavLink } from '@/types';
import { Loader2 } from 'lucide-react';

const LeftSidebar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useUserContext();
  const {
    mutate: signOut,
    isSuccess,
    isPending: isSigningOut,
  } = useSignOutAccount();

  useEffect(() => {
    if (isSuccess) navigate(0);
  }, [isSuccess]);

  return (
    <nav className='leftsidebar'>
      <div className='flex flex-col gap-11'>
        <Link to='/' className='flex gap-3 items-center'>
          <img
            src='/assets/images/logo.svg'
            alt='logo'
            width={170}
            height={36}
          />
        </Link>

        <Link to={`/profile/${user.id}`} className='flex gap-3 items-center'>
          <img
            src={user.imageUrl || '/assets/icons/profile-placeholder.svg'}
            alt='profile'
            className='h-14 w-14 rounded-full object-cover'
          />
          <div className='flex flex-col'>
            <p className='body-vold'>{user.name}</p>
            <p className='small-regular text-light-3'>@{user.username}</p>
          </div>
        </Link>

        <ul className='flex flex-col gap-6'>
          {sidebarLinks.map((link: INavLink) => {
            const isActive = pathname === link.route;

            return (
              <li
                key={link.label}
                className={`leftsidebar-link group
                                ${isActive && 'bg-primary-500'}`}
              >
                <NavLink
                  to={link.route}
                  className='flex gap-4 items-center p-4'
                >
                  <img
                    src={link.imgURL}
                    alt={link.label}
                    className={`group-hover:invert-white 
                                        ${isActive && 'invert-white'}`}
                  />
                  {link.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>

      <Button
        variant='ghost'
        className='shad-button_ghost'
        onClick={() => signOut()}
        disabled={isSigningOut}
      >
        {isSigningOut ? (
          <div className='flex gap-2 items-center'>
            <Loader2 className="animate-spin" size={16} />
            <p className='small-medium lg:base-medium'>Logging out...</p>
          </div>
        ) : (
          <>
            <img
              src="/assets/icons/logout.svg"
              alt="logout"
              className="w-6 h-6"
            />
            <p className='small-medium lg:base-medium'>Logout</p>
          </>
        )}
      </Button>
    </nav>
  );
};

export default LeftSidebar;