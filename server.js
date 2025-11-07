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
    origin: ["http://localhost:5173", "https://acces-lens-deploy-frontend.vercel.app"],
    credentials: true,
  })
);



app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));


 
app.use(cookieParser());


// Start server after DB connection

await dbConnect();

app.use(express.static('public'));


// API routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);


// Health check
app.get("/", (req, res) => {
  res.send("✅ Backend redployed successfully!");
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));


