import express from "express";
import User from "../models/User.js";
import BlogPost from "../models/BlogPost.js";
import authUser from "../middleware/auth.js";
import requireAdmin from "../middleware/admin.js";

const router = express.Router();

router.get("/overview", authUser, requireAdmin, async (req, res) => {
  try {
    const [users, posts] = await Promise.all([
      User.find().select("email firstname lastname").sort({ email: 1 }).lean(),
      BlogPost.find()
        .select("title category created_at creator image")
        .sort({ _id: -1 })
        .lean(),
    ]);

    const postsByUser = new Map();
    for (const post of posts) {
      const key = String(post.creator);
      if (!postsByUser.has(key)) postsByUser.set(key, []);
      postsByUser.get(key).push({
        _id: post._id,
        title: post.title,
        category: post.category,
        created_at: post.created_at,
        image: post.image,
      });
    }

    const payload = {
      totalUsers: users.length,
      totalPosts: posts.length,
      users: users.map((user) => {
        const list = postsByUser.get(String(user._id)) || [];
        return {
          _id: user._id,
          email: user.email,
          name: [user.firstname, user.lastname].filter(Boolean).join(" "),
          postCount: list.length,
          posts: list,
        };
      }),
    };

    res.json(payload);
  } catch (error) {
    res.status(400).json(error.message);
  }
});

export default router;
