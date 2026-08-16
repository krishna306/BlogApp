import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

function mongoUri() {
  return String(process.env.MongoURL || "")
    .trim()
    .replace(/^[`'"]+|[`'"]+$/g, "");
}

export async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  const uri = mongoUri();
  if (!uri) {
    throw new Error("MongoURL is missing");
  }
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 20000,
    maxPoolSize: 10,
  });
  return mongoose.connection;
}

mongoose.connection.on("connected", () => {
  console.log("Connected to Database");
});

mongoose.connection.on("disconnected", () => {
  console.error("MongoDB disconnected");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB error:", err.message);
});

export default mongoose;
