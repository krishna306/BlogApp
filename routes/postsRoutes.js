const router = require("express").Router();
const BlogPost = require("../models/BlogPost");
const { authUser } = require("../middleware/auth");

router.post("/", authUser, async (req, res) => {
  try {
    const { title, content, image } = req.body;
    const article = await BlogPost.create({
      title,
      content,
      image,
      creator: req.user._id,
    });
    req.user.articles.push(article._id);
    await req.user.save();
    res.status(201).json(article);
  } catch (e) {
    res.status(400).json(e.message);
  }
});
router.get("/", async (req, res) => {
  try {
    const posts = await BlogPost.find();
    res.json(posts);
  } catch (error) {
    res.status(400).json(error.message);
  }
});
router.get("/me", authUser, async (req, res) => {
  try {
    const user = req.user;
    user.populate("articles").then(({ articles }) => res.json(articles));
  } catch (error) {
    console.log(error);
    res.status(400).json(e.message);
  }
});
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const article = await BlogPost.findById(id);
    article.populate("creator").then((result) => res.json(result));
  } catch (error) {
    res.status(400).json("Not Found");
  }
});

module.exports = router;
