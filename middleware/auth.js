const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authUser = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.SECRETKEY);
    const user = await User.findOne({ _id: decoded._id });
    if (!user) {
      throw new Error("Please Authenticate");
    }
    req.token = token;
    req.user = user;
    next();
  } catch (e) {
    res.status(401).send({ error: e.message });
  }
};

module.exports = { authUser };
