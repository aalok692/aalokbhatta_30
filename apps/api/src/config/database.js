import mongoose from "mongoose";

export default async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is required to start the API.");
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  console.info("Connected to MongoDB.");
}
