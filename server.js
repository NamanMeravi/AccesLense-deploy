import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import dbConnect from "./config/dbConnect.js";
import authRoutes from "./routes/auth.route.js";
import projectRoutes from "./routes/project.route.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;
// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "https://your-frontend-domain.com"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// Start server after DB connection
await dbConnect();



// API routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);


// Health check
app.get("/", (req, res) => {
  res.send("✅ Backend redployed successfully!");
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


