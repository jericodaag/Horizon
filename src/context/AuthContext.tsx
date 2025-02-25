import { createContext, useContext, useEffect, useState } from 'react';
import { IUser } from '@/types';
import { getCurrentUser } from '@/lib/appwrite/api';

export const INITIAL_USER = {
  id: '',
  name: '',
  username: '',
  email: '',
  imageUrl: '',
  bio: '',
};

const INITIAL_STATE = {
  user: INITIAL_USER,
  isLoading: true, // Start with loading true
  isAuthenticated: false,
  setUser: () => {},
  setIsAuthenticated: () => {},
  checkAuthUser: async () => false as boolean,
};

type IContextType = {
  user: IUser;
  isLoading: boolean;
  setUser: React.Dispatch<React.SetStateAction<IUser>>;
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  checkAuthUser: () => Promise<boolean>;
};

const AuthContext = createContext<IContextType>(INITIAL_STATE);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<IUser>(INITIAL_USER);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true

  const checkAuthUser = async () => {
    try {
      const currentAccount = await getCurrentUser();

      if (!currentAccount) {
        setUser(INITIAL_USER);
        setIsAuthenticated(false);
        return false;
      }

      setUser({
        id: currentAccount.$id,
        name: currentAccount.name,
        username: currentAccount.username,
        email: currentAccount.email,
        imageUrl: currentAccount.imageUrl,
        bio: currentAccount.bio,
      });
      setIsAuthenticated(true);

      return true;
    } catch (error) {
      console.error('Auth check failed:', error);
      return false;
    } finally {
      setIsLoading(false); // Set loading to false regardless of outcome
    }
  };

  useEffect(() => {
    // Check for authentication on initial load
    const cookieFallback = localStorage.getItem('cookieFallback');

    if (cookieFallback && cookieFallback !== '[]') {
      checkAuthUser();
    } else {
      // If no cookie, we know we're not authenticated
      setIsLoading(false);
    }
  }, []);

  const value = {
    user,
    setUser,
    isLoading,
    isAuthenticated,
    setIsAuthenticated,
    checkAuthUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useUserContext = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useUserContext must be used within an AuthProvider');
  }

  return context;
};
