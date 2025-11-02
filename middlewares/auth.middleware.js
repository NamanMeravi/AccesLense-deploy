import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const isAuthenticated = async (req, res, next) => {
    try {
        // Get token from cookies or Authorization header
        const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.replace('Bearer ', ''));
        
        if (!token) {
            console.log("No token found. Cookies:", req.cookies);
            return res.status(401).json({ message: "Access denied. No token provided." });
        }

        // Verify token
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error("❌ JWT_SECRET is not defined in environment variables");
            return res.status(500).json({ message: "Server configuration error" });
        }

        const decoded = jwt.verify(token, jwtSecret);
        
        // Get user from database
        const user = await User.findById(decoded.id).select("-password");
        
        if (!user) {
            return res.status(401).json({ message: "Invalid token. User not found." });
        }

        // Attach user to request object
        req.user = user;
        next();
    } catch (error) {
        console.log("Authentication error:", error.message);
        
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired. Please login again." });
        }
        
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid token." });
        }
        
        return res.status(500).json({ message: error.message });
    }
};

