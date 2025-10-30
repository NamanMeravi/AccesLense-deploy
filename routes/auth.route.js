import express from "express";
import { registerUser, Login, VerifyEmail, GetUser, Logout, ResendVerificationEmail } from "../controllers/user.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", Login);

router.post("/logout", Logout);

router.post("/verifyEmail", isAuthenticated, VerifyEmail);

router.post("/resendVerification", isAuthenticated, ResendVerificationEmail);

router.get("/getUser", isAuthenticated, GetUser);

export default router