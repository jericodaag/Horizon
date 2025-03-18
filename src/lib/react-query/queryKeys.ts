export enum QUERY_KEYS {
  // AUTH KEYS
  CREATE_USER_ACCOUNT = 'createUserAccount',

  // USER KEYS
  GET_CURRENT_USER = 'getCurrentUser',
  GET_USERS = 'getUsers',
  GET_USER_BY_ID = 'getUserById',

  // POST KEYS
  GET_POSTS = 'getPosts',
  GET_INFINITE_POSTS = 'getInfinitePosts',
  GET_RECENT_POSTS = 'getRecentPosts',
  GET_POST_BY_ID = 'getPostById',
  GET_USER_POSTS = 'getUserPosts',
  GET_FILE_PREVIEW = 'getFilePreview',
  GET_LIKED_POSTS = 'getLikedPosts',
  GET_SAVED_POSTS = 'getSavedPosts',
  GET_USER_FOLLOWERS = 'getUserFollowers',
  GET_USER_FOLLOWING = 'getUserFollowing',
  GET_TOP_CREATORS = 'getTopCreators',
  GET_POST_COMMENTS = 'getPostComments',

  //  SEARCH KEYS
  SEARCH_POSTS = 'getSearchPosts',

  // MESSAGE KEYS
  GET_CONVERSATION = 'getConversation',
  GET_USER_CONVERSATIONS = 'getUserConversations',
}
