const cacheKeys = {
  user: (id) => `user:${id}`,
  postsAll: () => "posts:all",
  postsPage: (page, limit, category = "all") =>
    `posts:page:${page}:${limit}:${category}`,
  postById: (id) => `posts:${id}`,
  postsByUser: (id) => `posts:user:${id}`,
  postsByUserPage: (id, page, limit) => `posts:user:${id}:${page}:${limit}`,
  blacklistToken: (token) => `blacklist:${token}`,
};


export default cacheKeys;