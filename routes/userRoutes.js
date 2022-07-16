const router = require("express").Router();

const User = require("../models/User");
const { authUser } = require("../middleware/auth");
// User creation
router.post("/", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.create({ email, password });
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (error) {
    let msg;
    if (error.code == 11000) {
      msg = "Email already exists";
    } else {
      msg = error.message;
    }
    res.status(400).json(msg);
  }
});

// Login User
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findByCredentials(email, password);
    const token = await user.generateAuthToken();
    res.json({ user, token });
  } catch (error) {
    console.log(error);
    res.status(400).json(error.message);
  }
});

// Logout User
router.delete("/logout", authUser, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((tokenObj) => {
      return tokenObj.token !== req.token;
    });
    await req.user.save();
    res.status(200).send();
  } catch (e) {
    res.status(400).json(e.message);
  }
});

module.exports = router;
