import React from 'react';

export type IComment = {
  $id: string;
  userId: string;
  postId: string;
  content: string;
  createdAt: string;
  likes: string[];
  user?: {
    $id: string;
    name: string;
    username: string;
    imageUrl: string;
  };
};

export type INewComment = {
  userId: string;
  postId: string;
  content: string;
};

// Update IContextType to remain the same
export type IContextType = {
  user: IUser;
  isLoading: boolean;
  setUser: React.Dispatch<React.SetStateAction<IUser>>;
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  checkAuthUser: () => Promise<boolean>;
};

export type INavLink = {
  imgURL: string;
  route: string;
  label: string;
};

export type IUpdateUser = {
  userId: string;
  name: string;
  bio: string | undefined;
  imageId: string;
  imageUrl: URL | string;
  file: File[];
};

export type INewPost = {
  userId: string;
  caption: string;
  file: File[];
  location?: string;
  tags?: string;
  comments?: IComment[];
};

export type IUpdatePost = {
  postId: string;
  caption: string;
  imageId: string;
  imageUrl: URL;
  file: File[];
  location?: string;
  tags?: string;
  comments?: IComment[];
};

export type IUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  imageUrl: string;
  bio: string;
};

export type INewUser = {
  name: string;
  email: string;
  username: string;
  password: string;
};

export interface ICreatorWithFollowers {
  id: string;
  $id: string;
  name: string;
  username: string;
  email: string;
  imageUrl: string;
  bio: string;
  followerCount: number;
}

export interface IPost extends Omit<INewPost, 'tags'> {
  $id: string;
  creator: IUser;
  imageUrl: string;
  likes: string[];
  tags: string[];
  comments: IComment[];
  save?: boolean;
}
