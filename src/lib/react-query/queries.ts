import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ID } from 'appwrite';
import { databases, storage, appwriteConfig } from '@/lib/appwrite/config';
import { INewPost, INewUser } from '@/types';
import {
  createPost,
  createUserAccount,
  getRecentPosts,
  signInAccount,
  signOutAccount,
} from '../appwrite/api';
import { QUERY_KEYS } from './queryKeys';

// Auth Mutations
export const useCreateUserAccount = () => {
  return useMutation({
    mutationFn: (user: INewUser) => createUserAccount(user),
  });
};

export const useSignInAccount = () => {
  return useMutation({
    mutationFn: (user: { email: string; password: string }) =>
      signInAccount(user),
  });
};

export const useSignOutAccount = () => {
  return useMutation({
    mutationFn: signOutAccount,
  });
};

// Post Mutations
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (post: INewPost) => createPost(post),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
      });
    },
  });
};

export const useGetRecentPosts = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
    queryFn: getRecentPosts,
  });
};
