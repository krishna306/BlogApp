import mongoose from "mongoose";
import  "../connection.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { setCache } from "../resdiswarpper/rediswrapper.js";
import cacheKeys from "../resdiswarpper/rediskeys.js";
const userSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: [true, "Can't be blank"],
    index: true,
  },
  isVerified: Boolean,
  password: {
    type: String,
    required: [true, "Can't be blank"],
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
  articles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BlogPost",
    },
  ],
});
userSchema.pre("save", async function () {
  var salt = bcrypt.genSaltSync(10);
  if (this.password && this.isModified("password")) {
    this.password = bcrypt.hashSync(this.password, salt);
  }
});

userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.tokens;
  delete userObject.articles;
  return userObject;
};

userSchema.methods.generateAuthToken = async function () {
  let params = {
    _id: this._id,
    email: this.email,
  };
  const key = process.env.SECRETKEY;
  var tokenValue = jwt.sign(params, key);
  this.tokens = this.tokens.concat({ token: tokenValue });
  await this.save();
  try {
    await setCache(cacheKeys.user(this._id), 3600, this.toObject());
  } catch (err) {
    console.error("Failed to update user cache:", err.message);
  }
  return tokenValue;
};

userSchema.statics.findByCredentials = async function (email, password) {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid Email or Password");
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid Email or Password");
  }
  return user;
};

const User = mongoose.model("User", userSchema);
export default User;
