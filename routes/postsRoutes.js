import express from "express";
import BlogPost from "../models/BlogPost.js";
import User from "../models/User.js";
import authUser from "../middleware/auth.js";
import { delCache, delCachePattern, getCache, setCache } from "../resdiswarpper/rediswrapper.js";
import cacheKeys from "../resdiswarpper/rediskeys.js";
const router = express.Router();

const LIST_TTL = 600;
const LIST_FIELDS = "title image category creator created_at content";

const ALLOWED_CATEGORIES = [
  "technology",
  "travel",
  "web-design",
  "programming",
  "ai",
  "other",
];

function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(20, Math.max(1, parseInt(query.limit, 10) || 9));
  return { page, limit, skip: (page - 1) * limit };
}

function parseCategory(query) {
  const value = typeof query.category === "string" ? query.category.trim() : "";
  if (!value || value === "all") return null;
  return ALLOWED_CATEGORIES.includes(value) ? value : null;
}

function toListItem(post) {
  const { content, ...rest } = post;
  return {
    ...rest,
    content: typeof content === "string" ? content.slice(0, 120) : "",
  };
}

function paginatedPayload({ docs, total, page, limit, skip }) {
  return {
    posts: docs.map(toListItem),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
    hasNext: skip + docs.length < total,
    hasPrev: page > 1,
  };
}

async function invalidatePostListCaches(userId) {
  await Promise.all([
    delCachePattern("posts:page:*"),
    userId ? delCachePattern(`posts:user:${userId}:*`) : Promise.resolve(),
  ]);
}

router.post("/", authUser, async (req, res) => {
  try {
    const { title, content, image, category } = req.body;
    const article = await BlogPost.create({
      title,
      content,
      image,
      category: ALLOWED_CATEGORIES.includes(category) ? category : "other",
      creator: req.user._id,
    });
    const user = await User.findById(req.user._id);
    user.articles.push(article._id);
    await user.save();
    await invalidatePostListCaches(req.user._id);
    res.status(201).json(article);
  } catch (e) {
    res.status(400).json(e.message);
  }
});
router.get("/", async (req, res) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const category = parseCategory(req.query);
    const cacheKey = cacheKeys.postsPage(page, limit, category || "all");
    const cached = await getCache(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }
    const filter = category ? { category } : {};
    const [docs, total] = await Promise.all([
      BlogPost.find(filter)
        .select(LIST_FIELDS)
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      BlogPost.countDocuments(filter),
    ]);
    const payload = paginatedPayload({ docs, total, page, limit, skip });
    await setCache(cacheKey, LIST_TTL, payload);
    res.json(payload);
  } catch (error) {
    res.status(400).json(error.message);
  }
});
router.get("/me", authUser, async (req, res) => {
  try {
    const user = req.user;
    const { page, limit, skip } = parsePagination(req.query);
    const cacheKey = cacheKeys.postsByUserPage(user._id, page, limit);
    const cached = await getCache(cacheKey);
    if (cached) {
      res.json(cached);
      return;
    }
    const filter = { creator: user._id };
    const [docs, total] = await Promise.all([
      BlogPost.find(filter)
        .select(LIST_FIELDS)
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      BlogPost.countDocuments(filter),
    ]);
    const payload = paginatedPayload({ docs, total, page, limit, skip });
    await setCache(cacheKey, LIST_TTL, payload);
    res.json(payload);
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
    if (!article) {
      res.status(404).json("Not Found");
      return;
    }
    await setCache(cacheKeys.postById(id), 600, article);
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
      await Promise.all([
        delCache(cacheKeys.postById(id)),
        invalidatePostListCaches(req.user._id),
      ]);
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
  const { title, content, category } = req.body;
  try {
    const update = { title, content };
    if (ALLOWED_CATEGORIES.includes(category)) {
      update.category = category;
    }
    const article = await BlogPost.findByIdAndUpdate(id, update);
    await Promise.all([
      delCache(cacheKeys.postById(id)),
      invalidatePostListCaches(req.user._id),
    ]);
    res.status(200).json("update with success");
  } catch (e) {
    res.status(401).send(e.message);
  }
});
export default router
