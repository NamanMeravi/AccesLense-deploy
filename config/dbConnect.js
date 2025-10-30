import mongoose from "mongoose";

let isConnected = false;

const dbConnect = async () => {
  if (isConnected) {
    console.log("⚡ Already connected to MongoDB");
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "AccessLense",
    });
    isConnected = true;
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

export default dbConnect;
