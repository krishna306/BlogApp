const mongoose = require("mongoose");
const dateOptions = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
};
const BlogPostSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content:{
      type :"string"
  },
  title: {
    type: "string",
    required: true,
  },
  image: {
    type: "string",
    required: true,
  },
  category: {
    type: "string",
    default: "other",
  },
  created_at: {
    type: "string",
    default: new Date().toLocaleDateString("en-IN", dateOptions),
  },
});
const BlogPost = mongoose.model("BlogPost", BlogPostSchema);
module.exports = BlogPost;
