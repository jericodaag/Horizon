import { useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { useSignOutAccount } from '@/lib/react-query/queries';
import { useUserContext } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { sidebarLinks } from '@/constants';
import { INavLink } from '@/types';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const LeftSidebar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useUserContext();
  const { totalUnreadMessages } = useSocket();

  const {
    mutate: signOut,
    isSuccess,
    isPending: isSigningOut,
  } = useSignOutAccount();

  useEffect(() => {
    if (isSuccess) navigate(0);
  }, [isSuccess, navigate]);

  return (
    <nav className="leftsidebar bg-dark-2 border-r border-dark-4">
      <div className="flex flex-col h-screen py-8 px-4">
        {/* Logo */}
        <div className="mb-10">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/assets/images/logo.svg"
              alt="Horizon"
              width={170}
              height={36}
            />
          </Link>
        </div>

        {/* User Profile Section */}
        <Link
          to={`/profile/${user.id}`}
          className="flex gap-3 items-center mb-8"
        >
          <img
            src={user.imageUrl || '/assets/icons/profile-placeholder.svg'}
            alt="profile"
            className="h-14 w-14 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <p className="font-semibold text-light-1">{user.name}</p>
            <p className="text-sm text-light-3">@{user.username}</p>
          </div>
        </Link>

        {/* Navigation Menu */}
        <div className="flex-1 mb-8">
          <h2 className="text-light-3 text-xs uppercase font-semibold mb-4 px-3">Menu</h2>
          <ul className="space-y-2">
            {sidebarLinks.map((link: INavLink) => {
              const isActive = pathname === link.route;
              const isMessages = link.route === '/messages';

              return (
                <li key={link.label}>
                  <NavLink
                    to={link.route}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${isActive
                      ? 'bg-primary-500 text-light-1 font-medium'
                      : 'text-light-2 hover:bg-dark-3'
                      }`}
                  >
                    <div className={`w-6 h-6 flex items-center justify-center ${isActive ? 'text-light-1' : 'text-light-3'}`}>
                      <img
                        src={link.imgURL}
                        alt={link.label}
                        className={`w-5 h-5 ${isActive ? 'invert-white' : ''}`}
                      />
                    </div>
                    <span>{link.label}</span>

                    {/* Message notification badge */}
                    {isMessages && totalUnreadMessages > 0 && (
                      <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex-shrink-0 ml-auto bg-primary-500 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center"
                      >
                        {totalUnreadMessages > 9 ? '9+' : totalUnreadMessages}
                      </motion.div>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Logout Button */}
        <Button
          variant="ghost"
          onClick={() => signOut()}
          disabled={isSigningOut}
          className="w-full py-3 px-3 rounded-xl hover:bg-dark-3 border border-dark-4 transition-all duration-300 flex justify-start gap-3"
        >
          {isSigningOut ? (
            <div className="flex gap-2 items-center">
              <Loader2 className="animate-spin" size={16} />
              <p>Logging out...</p>
            </div>
          ) : (
            <>
              <img
                src="/assets/icons/logout.svg"
                alt="logout"
                className="w-5 h-5"
              />
              <p>Logout</p>
            </>
          )}
        </Button>
      </div>
    </nav>
  );
};

export default LeftSidebar;