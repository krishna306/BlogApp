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

    const userID = decoded._id
    const cachedUser = await getCache(cacheKeys.user(userID));
    if (cachedUser) {
      // hydrate cached plain object into a mongoose document so routes can call document methods
      req.user = User.hydrate(cachedUser);
      req.token = token;
      return next();
    }
    const user = await User.findOne({ _id: decoded._id });
    if (!user) {
      throw new Error("Please Authenticate");
    }
    await setCache(
      cacheKeys.user(userID),
      3600,
      user.toObject()
    );
    req.token = token;
    req.user = user;
    return next();
  } catch (e) {
    res.status(401).send({ error: e.message });
  }
};

export default authUser;
