import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { getCache, setCache } from "../resdiswarpper/rediswrapper.js";
import cacheKeys from "../resdiswarpper/rediskeys.js";

function hasToken(user, token) {
  return Boolean(user?.tokens?.some((item) => item.token === token));
}

const authUser = async (req, res, next) => {
  try {
    const header = req.header("Authorization");
    const token = header?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Bad Access" });
    }

    if (await getCache(cacheKeys.blacklistToken(token))) {
      return res.status(401).json({ error: "Please Authenticate" });
    }

    const decoded = jwt.verify(token, process.env.SECRETKEY);
    const userID = decoded._id;
    const cachedUser = await getCache(cacheKeys.user(userID));
    if (cachedUser && hasToken(cachedUser, token)) {
      req.user = User.hydrate(cachedUser);
      req.token = token;
      return next();
    }

    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });
    if (!user) {
      throw new Error("Please Authenticate");
    }
    const cached = user.toObject();
    delete cached.password;
    await setCache(cacheKeys.user(userID), 3600, cached);
    req.token = token;
    req.user = user;
    return next();
  } catch (e) {
    res.status(401).send({ error: e.message });
  }
};

export default authUser;
