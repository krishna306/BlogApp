import express from "express";
import User from  "../models/User.js";
import authUser from "../middleware/auth.js";
import { delCache } from "../resdiswarpper/rediswrapper.js";
import cacheKeys from "../resdiswarpper/rediskeys.js";
// User creation
const router = express.Router();
router.post("/", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.create({ email, password });
    const token = await user.generateAuthToken();
    await delCache(cacheKeys.user(req.user._id));
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
    await delCache(cacheKeys.user(req.user._id));
    res.status(200).send();
  } catch (e) {
    res.status(400).json(e.message);
  }
});

export default router;
