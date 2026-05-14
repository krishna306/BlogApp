import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// mongoose connection for local database
// mongoose.connect("mongodb://localhost:27017/blogpost")
// .then(console.log("connected to Database"))
// .catch((err) => console.log(err));
// Database connection for mongodb atlas
const uri = process.env.MongoURL;
mongoose.connect(uri)
  .then(() => {
    console.log("Connected to Database");
  })
  .catch((err) => console.log(err));

export default mongoose;