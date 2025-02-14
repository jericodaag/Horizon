import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ID } from 'appwrite';
import { databases, storage, appwriteConfig } from '@/lib/appwrite/config';
import { INewUser } from '@/types';
import {
  createUserAccount,
  signInAccount,
  signOutAccount,
} from '../appwrite/api';

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
    mutationFn: async ({
      userId,
      caption,
      file,
      location,
      tags,
    }: {
      userId: string;
      caption: string;
      file: File[];
      location: string;
      tags: string;
    }) => {
      try {
        // Upload file to storage
        const uploadedFile = await storage.createFile(
          appwriteConfig.storageId,
          ID.unique(),
          file[0]
        );

        if (!uploadedFile) throw Error;

        // Get file url
        const fileUrl = storage.getFileView(
          appwriteConfig.storageId,
          uploadedFile.$id
        );

        // Convert tags string to array
        const tagArray = tags.split(',').map((tag) => tag.trim());

        // Create post
        const newPost = await databases.createDocument(
          appwriteConfig.databaseId,
          appwriteConfig.postCollectionId,
          ID.unique(),
          {
            creator: userId,
            caption,
            imageUrl: fileUrl,
            imageId: uploadedFile.$id,
            location,
            tags: tagArray,
          }
        );

        return newPost;
      } catch (error) {
        console.error('Error creating post:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['posts'],
      });
    },
  });
};
