import { ID, Query, Models } from 'appwrite';

import { appwriteConfig, account, databases, storage, avatars } from './config';
import { IUpdatePost, INewPost, INewUser, IUpdateUser } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../react-query/queryKeys';

// ============================================================
// AUTH
// ============================================================

// ============================== SIGN UP
export async function createUserAccount(user: INewUser) {
  try {
    const newAccount = await account.create(
      ID.unique(),
      user.email,
      user.password,
      user.name
    );

    if (!newAccount) throw Error;

    const avatarUrl = avatars.getInitials(user.name);

    const newUser = await saveUserToDB({
      accountId: newAccount.$id,
      name: newAccount.name,
      email: newAccount.email,
      username: user.username,
      imageUrl: avatarUrl,
    });

    return newUser;
  } catch (error) {
    console.log(error);
    return error;
  }
}

// ============================== SAVE USER TO DB
export async function saveUserToDB(user: {
  accountId: string;
  email: string;
  name: string;
  imageUrl: URL;
  username?: string;
}) {
  try {
    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      user
    );

    return newUser;
  } catch (error) {
    console.log(error);
  }
}

// ============================== SIGN IN
export async function signInAccount(user: { email: string; password: string }) {
  try {
    // Add delay between attempts
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    try {
      // First try to delete existing session
      await account.deleteSession('current');
      // Add small delay after session deletion
      await delay(500);
    } catch (error) {
      // Ignore error if no session exists
    }

    // Then create new session
    const session = await account.createEmailSession(user.email, user.password);
    return session;
  } catch (error: any) {
    // Handle rate limiting specifically
    if (error.message?.includes('Rate limit')) {
      throw new Error('Too many attempts. Please wait a moment and try again.');
    }
    console.error('SignIn error:', error);
    throw error;
  }
}

// ============================== GET ACCOUNT
export async function getAccount() {
  try {
    const currentAccount = await account.get();

    return currentAccount;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET USER
export async function getCurrentUser() {
  try {
    const currentAccount = await getAccount();

    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal('accountId', currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
    return null;
  }
}

// ============================== SIGN OUT
export async function signOutAccount() {
  try {
    const session = await account.deleteSession('current');
    return session;
  } catch (error) {
    console.error('SignOut error:', error);
  }
}

// ============================================================
// POSTS
// ============================================================

// ============================== CREATE POST
export async function createPost(post: INewPost) {
  try {
    // Upload file to appwrite storage
    const uploadedFile = await uploadFile(post.file[0]);

    if (!uploadedFile) throw Error;

    // Get file url
    const fileUrl = getFilePreview(uploadedFile.$id);
    if (!fileUrl) {
      await deleteFile(uploadedFile.$id);
      throw Error;
    }

    // Convert tags into array
    const tags = post.tags?.replace(/ /g, '').split(',') || [];

    // Create post
    const newPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      ID.unique(),
      {
        creator: post.userId,
        caption: post.caption,
        imageUrl: fileUrl,
        imageId: uploadedFile.$id,
        location: post.location,
        tags: tags,
      }
    );

    if (!newPost) {
      await deleteFile(uploadedFile.$id);
      throw Error;
    }

    return newPost;
  } catch (error) {
    console.log(error);
  }
}

// ============================== UPLOAD FILE
export async function uploadFile(file: File) {
  try {
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      file
    );

    return uploadedFile;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET FILE URL
export function getFilePreview(fileId: string) {
  try {
    const fileUrl = storage.getFilePreview(
      appwriteConfig.storageId,
      fileId,
      2000,
      2000,
      'top',
      100
    );

    if (!fileUrl) throw Error;

    return fileUrl;
  } catch (error) {
    console.log(error);
  }
}

// ============================== DELETE FILE
export async function deleteFile(fileId: string) {
  try {
    await storage.deleteFile(appwriteConfig.storageId, fileId);

    return { status: 'ok' };
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET POSTS
export async function searchPosts(searchTerm: string) {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.search('caption', searchTerm)]
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}

export async function getInfinitePosts({ pageParam }: { pageParam: number }) {
  const queries: any[] = [Query.orderDesc('$updatedAt'), Query.limit(9)];

  if (pageParam) {
    queries.push(Query.cursorAfter(pageParam.toString()));
  }

  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      queries
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET POST BY ID
export async function getPostById(postId?: string) {
  if (!postId) throw Error;

  try {
    const post = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    if (!post) throw Error;

    return post;
  } catch (error) {
    console.log(error);
  }
}

// ============================== UPDATE POST
export async function updatePost(post: IUpdatePost) {
  const hasFileToUpdate = post.file.length > 0;

  try {
    let image = {
      imageUrl: post.imageUrl,
      imageId: post.imageId,
    };

    if (hasFileToUpdate) {
      // Upload new file to appwrite storage
      const uploadedFile = await uploadFile(post.file[0]);
      if (!uploadedFile) throw Error;

      // Get new file url
      const fileUrl = getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    // Convert tags into array
    const tags = post.tags?.replace(/ /g, '').split(',') || [];

    //  Update post
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      post.postId,
      {
        caption: post.caption,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
        location: post.location,
        tags: tags,
      }
    );

    // Failed to update
    if (!updatedPost) {
      // Delete new file that has been recently uploaded
      if (hasFileToUpdate) {
        await deleteFile(image.imageId);
      }

      // If no new file uploaded, just throw error
      throw Error;
    }

    // Safely delete old file after successful update
    if (hasFileToUpdate) {
      await deleteFile(post.imageId);
    }

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

// ============================== DELETE POST
export async function deletePost(postId?: string, imageId?: string) {
  if (!postId || !imageId) return;

  try {
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    if (!statusCode) throw Error;

    await deleteFile(imageId);

    return { status: 'Ok' };
  } catch (error) {
    console.log(error);
  }
}

// ============================== LIKE / UNLIKE POST
export async function likePost(postId: string, likesArray: string[]) {
  try {
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId,
      {
        likes: likesArray,
      }
    );

    if (!updatedPost) throw Error;

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

// ============================== SAVE POST
export async function savePost(userId: string, postId: string) {
  try {
    const updatedPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      ID.unique(),
      {
        user: userId,
        post: postId,
      }
    );

    if (!updatedPost) throw Error;

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET SAVED POST
export async function getSavedPosts(userId?: string) {
  if (!userId) return;

  try {
    const saves = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      [Query.equal('user', userId), Query.orderDesc('$createdAt')]
    );

    if (!saves) throw Error;

    // Get the detailed post data for each saved post
    const posts = await Promise.all(
      saves.documents.map(async (save) => {
        const post = await databases.getDocument(
          appwriteConfig.databaseId,
          appwriteConfig.postCollectionId,
          save.post.$id
        );
        return post;
      })
    );

    return posts;
  } catch (error) {
    console.log(error);
  }
}

// ============================== DELETE SAVED POST
export async function deleteSavedPost(savedRecordId: string) {
  try {
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      savedRecordId
    );

    if (!statusCode) throw Error;

    return { status: 'Ok' };
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET USER'S POST
export async function getUserPosts(userId?: string) {
  if (!userId) return;

  try {
    const post = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.equal('creator', userId), Query.orderDesc('$createdAt')]
    );

    if (!post) throw Error;

    return post;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET POPULAR POSTS (BY HIGHEST LIKE COUNT)
export async function getRecentPosts() {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.orderDesc('$createdAt'), Query.limit(20)]
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}

// ============================================================
// USER
// ============================================================

// ============================== GET USERS
export async function getUsers(limit?: number) {
  const queries: any[] = [Query.orderDesc('$createdAt')];

  if (limit) {
    queries.push(Query.limit(limit));
  }

  try {
    const users = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      queries
    );

    if (!users) throw Error;

    return users;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET USER BY ID
export async function getUserById(userId: string) {
  try {
    const user = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId
    );

    if (!user) throw Error;

    return user;
  } catch (error) {
    console.log(error);
  }
}

// ============================== UPDATE USER
export async function updateUser(user: IUpdateUser) {
  try {
    let image = {
      imageUrl: user.imageUrl,
      imageId: user.imageId,
    };

    if (user.file.length > 0) {
      // Upload new file
      const uploadedFile = await uploadFile(user.file[0]);
      if (!uploadedFile) throw Error;

      // Get file URL
      const fileUrl = getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    // Update user document
    const updatedUser = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      user.userId,
      {
        name: user.name,
        bio: user.bio || '', // Provide empty string if undefined
        imageUrl: image.imageUrl,
        imageId: image.imageId,
      }
    );

    // Failed to update
    if (!updatedUser) {
      // Delete new file that was recently uploaded
      if (user.file.length > 0) {
        await deleteFile(image.imageId);
      }
      throw Error;
    }

    // Delete old file if it exists and was replaced
    if (user.imageId && user.file.length > 0) {
      await deleteFile(user.imageId);
    }

    return updatedUser;
  } catch (error) {
    console.log(error);
    return null;
  }
}

// ============================================================
// FOLLOW RELATIONSHIPS
// ============================================================

export async function followUser(followerId: string, followingId: string) {
  try {
    const followRecord = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.followsCollectionId,
      ID.unique(),
      {
        follower: followerId,
        following: followingId,
        createdAt: new Date().toISOString(),
      }
    );

    if (!followRecord) throw Error;

    return followRecord;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function unfollowUser(followerId: string, followingId: string) {
  try {
    // First, find the follow relationship record
    const follows = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.followsCollectionId,
      [
        Query.equal('follower', followerId),
        Query.equal('following', followingId),
      ]
    );

    if (!follows || follows.documents.length === 0) throw Error;

    // Delete the follow relationship
    const status = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.followsCollectionId,
      follows.documents[0].$id
    );

    return { status: 'Ok' };
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function getFollowers(userId: string): Promise<Models.Document[]> {
  try {
    const followers = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.followsCollectionId,
      [Query.equal('following', userId)]
    );

    if (!followers) throw Error;

    // Get detailed user information for each follower
    const followerUsers = await Promise.all(
      followers.documents.map(async (follow) => {
        const user = await getUserById(follow.follower);
        return user;
      })
    );

    return followerUsers.filter(
      (user): user is Models.Document => user !== null && user !== undefined
    );
  } catch (error) {
    console.log(error);
    return []; // Return empty array instead of null
  }
}

export async function getFollowing(userId: string): Promise<Models.Document[]> {
  try {
    const following = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.followsCollectionId,
      [Query.equal('follower', userId)]
    );

    if (!following) throw Error;

    // Get detailed user information for each following
    const followingUsers = await Promise.all(
      following.documents.map(async (follow) => {
        const user = await getUserById(follow.following);
        return user;
      })
    );

    return followingUsers.filter(
      (user): user is Models.Document => user !== null && user !== undefined
    );
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function isFollowing(followerId: string, followingId: string) {
  try {
    const follows = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.followsCollectionId,
      [
        Query.equal('follower', followerId),
        Query.equal('following', followingId),
      ]
    );

    return follows.documents.length > 0;
  } catch (error) {
    console.log(error);
    return false;
  }
}

// src/lib/react-query/queries.ts
// Add these query hooks to your existing queries.ts file

export const useFollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      followerId,
      followingId,
    }: {
      followerId: string;
      followingId: string;
    }) => followUser(followerId, followingId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_FOLLOWERS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_FOLLOWING],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
    },
  });
};

export const useUnfollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      followerId,
      followingId,
    }: {
      followerId: string;
      followingId: string;
    }) => unfollowUser(followerId, followingId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_FOLLOWERS],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_USER_FOLLOWING],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
      });
    },
  });
};

export const useGetFollowers = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USER_FOLLOWERS, userId],
    queryFn: () => getFollowers(userId),
    enabled: !!userId,
  });
};

export const useGetFollowing = (userId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USER_FOLLOWING, userId],
    queryFn: () => getFollowing(userId),
    enabled: !!userId,
  });
};

export const useIsFollowing = (followerId: string, followingId: string) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_USER_FOLLOWERS, followerId, followingId],
    queryFn: () => isFollowing(followerId, followingId),
    enabled: !!followerId && !!followingId,
  });
};

// Top Creators Condition
export async function getTopCreators(limit: number = 6) {
  try {
    // First get all follows to count followers for each user
    const follows = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.followsCollectionId,
      [Query.orderDesc('$createdAt')]
    );

    // Count followers for each user
    const followerCount: { [key: string]: number } = {};
    follows.documents.forEach((follow) => {
      const followingId = follow.following;
      followerCount[followingId] = (followerCount[followingId] || 0) + 1;
    });

    // Get all users
    const users = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId
    );

    // Add follower count to users and sort
    const usersWithFollowers = users.documents.map((user) => ({
      ...user,
      followerCount: followerCount[user.$id] || 0,
    }));

    // Sort by follower count and get top N
    const topUsers = usersWithFollowers
      .sort((a, b) => b.followerCount - a.followerCount)
      .slice(0, limit);

    return topUsers;
  } catch (error) {
    console.log(error);
    return [];
  }
}

// ======================
export async function createComment(comment: {
  postId: string;
  userId: string;
  content: string;
}) {
  try {
    // Create the comment
    const newComment = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      ID.unique(),
      {
        postId: comment.postId,
        userId: comment.userId,
        content: comment.content,
        createdAt: new Date().toISOString(),
        likes: [],
      }
    );

    // Get the user data
    const userData = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      comment.userId
    );

    // Return comment with user data
    return {
      ...newComment,
      user: userData,
    };
  } catch (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
}

// Get comments for a post
export async function getPostComments(postId: string) {
  try {
    // First get the comments
    const comments = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      [Query.equal('postId', postId), Query.orderDesc('$createdAt')]
    );

    // If there are no comments, return early
    if (!comments || comments.documents.length === 0) {
      return comments;
    }

    // Get all unique user IDs from comments
    const userIds = [
      ...new Set(comments.documents.map((comment) => comment.userId)),
    ];

    // Fetch all users in one batch
    const userPromises = userIds.map((userId) =>
      databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        userId
      )
    );

    // Wait for all user data to be fetched
    const users = await Promise.all(userPromises);

    // Create a map of userId to user data for easy lookup
    const userMap: Record<string, Models.Document> = users.reduce(
      (map: Record<string, Models.Document>, user) => {
        map[user.$id] = user;
        return map;
      },
      {}
    );

    // Enhance comments with user data
    const enhancedComments = comments.documents.map((comment) => ({
      ...comment,
      user: userMap[comment.userId],
    }));

    // Return the enhanced comments
    return {
      ...comments,
      documents: enhancedComments,
    };
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
}

// Delete comment
export async function deleteComment(commentId: string) {
  try {
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      commentId
    );
    return { status: 'ok' };
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
}

// Like/Unlike comment
export async function likeComment(commentId: string, likesArray: string[]) {
  try {
    const updatedComment = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.commentsCollectionId,
      commentId,
      {
        likes: likesArray,
      }
    );

    return updatedComment;
  } catch (error) {
    console.error('Error updating comment likes:', error);
    throw error;
  }
}
