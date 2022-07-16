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
router.delete("/:id", authUser, async (req, res) => {
  const { id } = req.params;
  try {
    const article = await BlogPost.findById(id);
    if (article.creator.toString() === req.user._id.toString()) {
      await article.remove();
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
    res.status(200).json("update with success");
  } catch (e) {
    res.status(401).send(e.message);
  }
});

module.exports = router;
