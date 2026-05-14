import jwt  from "jsonwebtoken";
import User from "../models/User.js";
import { getCache, setCache } from "../resdiswarpper/rediswrapper.js";
import cacheKeys  from "../resdiswarpper/rediskeys.js";
const authUser = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Bad Access" });
    }
    const decoded = jwt.verify(token, process.env.SECRETKEY);

    const userID = decoded.id
    const cachedUser = await getCache(cacheKeys.user(userID));
    if (cachedUser) {
      req.user = JSON.parse(cachedUser);
      return next();
    }
    const user = await User.findOne({ _id: decoded.id });
    if (!user) {
      throw new Error("Please Authenticate");
    }
    await setCache(
      cacheKeys.user(userID),
      3600,
      JSON.stringify(user)
    );
    req.token = token;
    req.user = user;
    next();
  } catch (e) {
    res.status(401).send({ error: e.message });
  }
};

export default authUser;
