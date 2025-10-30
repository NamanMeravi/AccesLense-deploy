import mongoose from "mongoose";

let isConnected = false; // track connection status

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
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
};

export default dbConnect;
