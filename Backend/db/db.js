const mongoose = require("mongoose");
const Question = require("../models/question.model");
const Experience = require("../models/experience.model");
const User = require("../models/experience.model");
// 1. Get the variable from .env
const MCQ = require("../models/mcq.model");
const Mentor = require("../models/mentor.model");
const Interview = require("../models/interview.model");
const url = process.env.MONGO_URL;

if (!url) {
  throw new Error(
    "Please define the MONGO_URL environment variable inside .env"
  );
}

// 2. Create a global cache (this saves the connection across Vercel hot reloads)
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// 3. The export function
const connectDB = async () => {
  console.log("Connecting to MongoDB...");
  const url = process.env.MONGO_URL;
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // CRITICAL: Stop buffering, fail fast if no connection
    };

    cached.promise = mongoose.connect(url, opts).then((mongoose) => {
      console.log("MongoDB Connected Successfully");
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
  return cached.conn;
};

module.exports = connectDB;
