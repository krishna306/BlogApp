import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { connectDB } from "./connection.js";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postsRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

await connectDB();

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ extended: true }));

app.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json("Database unavailable");
    return;
  }
  next();
});

app.get("/", (req, res) => {
  res.send("Running");
});
app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/admin", adminRoutes);

const port = process.env.PORT || 8080;
if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server Running on Port ${port}`);
  });
}

export default app;
