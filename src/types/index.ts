import React from 'react';

export type IComment = {
  $id: string;
  userId: string;
  postId: string;
  content: string;
  createdAt: string;
  likes: string[];
  gifUrl?: string; // New field for GIF URL
  gifId?: string; // New field for GIF ID
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
  gifUrl?: string; // New field for GIF URL
  gifId?: string; // New field for GIF ID
};

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
  coverFile?: File[];
  coverImageId?: string;
  coverImageUrl?: string | URL;
  coverPosition?: string;
};

export type INewPost = {
  userId: string;
  caption: string;
  file: File[];
  location?: string;
  tags?: string;
  comments?: IComment[];
  gifUrl?: string; // New field for GIF URL
  gifId?: string; // New field for GIF ID
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
  gifUrl?: string; // New field for GIF URL
  gifId?: string; // New field for GIF ID
};

export type IUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  imageUrl: string;
  bio: string;
  // New cover photo properties
  coverImageUrl?: string;
  coverPosition?: string;
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
  // New cover photo properties
  coverImageUrl?: string;
  coverPosition?: string;
}

export interface IPost extends Omit<INewPost, 'tags'> {
  $id: string;
  creator: IUser;
  imageUrl: string;
  likes: string[];
  tags: string[];
  comments: IComment[];
  save?: boolean;
  gifUrl?: string; // New field for GIF URL
  gifId?: string; // New field for GIF ID
}

// Message types
export type IMessage = {
  $id: string;
  sender: {
    $id: string;
    name?: string;
    username?: string;
    imageUrl?: string;
  };
  receiver: {
    $id: string;
    name?: string;
    username?: string;
    imageUrl?: string;
  };
  content: string;
  createdAt: string;
  isRead: boolean;
  attachmentUrl?: string | null;
  attachmentType?: string | null;
  // Add these properties for optimistic UI
  _isOptimistic?: boolean;
  _isError?: boolean;
};

export type INewMessage = {
  senderId: string;
  receiverId: string;
  content: string;
  attachmentUrl?: string | null;
  attachmentType?: string | null;
};

export type IConversation = {
  user: {
    $id?: string;
    id?: string;
    name: string;
    username: string;
    imageUrl?: string;
    bio?: string;
    email?: string;
    // New cover photo properties
    coverImageUrl?: string;
    coverPosition?: string;
  };
  lastMessage: IMessage;
  unreadCount: number;
};

// Socket.io related types
export interface IUserStatus {
  userId: string;
  status: 'online' | 'offline';
  timestamp: string;
}

export interface IOnlineUsers {
  users: string[];
  timestamp: string;
}
