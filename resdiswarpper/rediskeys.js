const cacheKeys = {
  user: (id) => `user:${id}`,
  postsPage: (page, limit, category = "all") =>
    `posts:page:${page}:${limit}:${category}`,
  postById: (id) => `posts:${id}`,
  postsByUserPage: (id, page, limit) => `posts:user:${id}:${page}:${limit}`,
  blacklistToken: (token) => `blacklist:${token}`,
};

export default cacheKeys;
