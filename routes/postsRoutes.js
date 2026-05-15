import express from "express";
import BlogPost from "../models/BlogPost.js";
import User from "../models/User.js";
import authUser from "../middleware/auth.js";
import { delCache, getCache, setCache } from "../resdiswarpper/rediswrapper.js";
import cacheKeys from "../resdiswarpper/rediskeys.js";
const router = express.Router();
router.post("/", authUser, async (req, res) => {
  try {
    const { title, content, image } = req.body;
    const article = await BlogPost.create({
      title,
      content,
      image,
      creator: req.user._id,
    });
    const user = await User.findById(req.user._id);
    user.articles.push(article._id);
    await user.save();
    await delCache(cacheKeys.postsAll());
    await delCache(cacheKeys.user(user._id));
    res.status(201).json(article);
  } catch (e) {
    res.status(400).json(e.message);
  }
});
router.get("/", async (req, res) => {
  try {
    const allpost = await getCache(cacheKeys.postsAll());
    if (allpost) {
      res.json(allpost);
      return;
    }
    const posts = await BlogPost.find().lean();
    await setCache(cacheKeys.postsAll(),600,posts);
    res.json(posts);
  } catch (error) {
    res.status(400).json(error.message);
  }
});
router.get("/me", authUser, async (req, res) => {
  try {
    const user = req.user;
    const allArticles = await getCache(cacheKeys.postsByUser(user._id));
    if(allArticles){
      res.json(allArticles);
      return;
    }
    // await user.populate("articles")
    const articles = await BlogPost.find({creator : user._id}).lean();
    await setCache(cacheKeys.postsByUser(user._id), 600, articles);
    res.json(articles);
    // });
  } catch (error) {
    console.log(error);
    res.status(400).json(error.message);
  }
});
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const postbyid = await getCache(cacheKeys.postById(id));
    if(postbyid){
      res.json(postbyid);
      return;
    }
    const article = await BlogPost.findById(id).populate("creator");
    await setCache(cacheKeys.postById(id),600,article);
    res.json(article);
  } catch (error) {
    res.status(400).json("Not Found");
  }
});
router.delete("/:id", authUser, async (req, res) => {
  const { id } = req.params;
  try {
    const article = await BlogPost.findById(id);
    if (article.creator.toString() === req.user._id.toString()) {
      await BlogPost.findByIdAndDelete(id);
      await delCache(cacheKeys.postsAll())
      await delCache(cacheKeys.postById(id))
      await delCache(cacheKeys.postsByUser(req.user._id))
      res.status(200).json("Removed Successfully");
    } else {
      res.status(401).json("You are not authorized to delete");
    }
  } catch (e) {
    res.status(400).send(e.message);
  }
});

router.patch("/:id", authUser, async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  try {
    const article = await BlogPost.findByIdAndUpdate(id, { title, content });
    await delCache(cacheKeys.postsAll());
    await delCache(cacheKeys.postById(id));
    res.status(200).json("update with success");
  } catch (e) {
    res.status(401).send(e.message);
  }
});
export default router
