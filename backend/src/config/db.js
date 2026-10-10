import mongoose from "mongoose";

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing. Add it to backend/.env.");
  }

  mongoose.set("strictQuery", true);

  const conn = await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || 10000)
  });
  console.log(`MongoDB connected: ${conn.connection.host}`);
};

export default connectDB;
