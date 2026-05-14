const cacheKeys = {
  user: (id) => `user:${id}`,
  postsAll: () => "posts:all",
  postById: (id) => `posts:${id}`,
  postsByUser: (id) => `posts:user:${id}`,
  blacklistToken: (token) => `blacklist:${token}`,
};


export default cacheKeys;