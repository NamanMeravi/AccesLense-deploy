import User from "../models/user.model.js";
import { SendVerificationEmail } from "../middleware/Email.js";

export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }   
        const UserExist = await User.findOne({ email });

        if (UserExist) {
            return res.status(400).json({ message: "User already exists, Please Login" });
        }

        const verificationCode = Math.floor(100000 + Math.random() * 900000);
        const verificationCodeExpiry = Date.now() + 3600000; // 1 hour

        const user = await User.create({ 
            name, 
            email, 
            password, 
            verificationcode: verificationCode, 
            verificationcodeExpiry: verificationCodeExpiry 
        });

        const token = user.generateToken();

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite:  "none",
            maxAge: 1 * 24 * 60 * 60 * 1000,
        });

        // Send verification email
        await SendVerificationEmail(user.email, verificationCode);

        return res.status(201).json({ 
            message: "User created successfully. Please check your email for verification code.", 
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isVerified: user.isVerified
            }, 
            token 
        });

         
    } catch (error) {
            console.log(error.message);
        res.status(500).json({ message: error.message });
    }
}

export const Login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Find user by email
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Compare password
        const isPasswordValid = await user.comparePassword(password);
        
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Generate token
        const token = user.generateToken();

        // Set cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite:  "none",
            maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
        });

        // Return success response
        return res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isVerified: user.isVerified
            },
            token
        });

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message });
    }
}

export const VerifyEmail = async (req, res) => {
    try {
        const { verificationCode } = req.body;
        
        if (!verificationCode) {
            return res.status(400).json({ message: "Verification code is required" });
        }

        // Get user from token if authenticated, otherwise find by verification code
        let user;
        if (req.user) {
            // If authenticated, verify the code belongs to this user
            user = await User.findById(req.user._id);
            if (!user || user.verificationcode !== verificationCode) {
                return res.status(400).json({ message: "Invalid verification code" });
            }
        } else {
            // Find user by verification code
            user = await User.findOne({ verificationcode: verificationCode });
            if (!user) {
                return res.status(400).json({ message: "Invalid verification code" });
            }
        }

        // Check if verification code is expired
        if (Date.now() > user.verificationcodeExpiry) {
            return res.status(400).json({ message: "Verification code has expired" });
        }

        // Check if user is already verified
        if (user.isVerified) {
            return res.status(400).json({ message: "Email is already verified" });
        }

        // Update user verification status and clear verification code
        user.isVerified = true;
        user.verificationcode = undefined;
        user.verificationcodeExpiry = undefined;
        
        await user.save();

        return res.status(200).json({ 
            message: "Email verified successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isVerified: user.isVerified
            }
        });
        
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message });
    }
}

export const ResendVerificationEmail = async (req, res) => {
    try {
        // Get authenticated user
        if (!req.user) {
            return res.status(401).json({ message: "User not authenticated" });
        }

        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if user is already verified
        if (user.isVerified) {
            return res.status(400).json({ message: "Email is already verified" });
        }

        // Generate new verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000);
        const verificationCodeExpiry = Date.now() + 3600000; // 1 hour

        // Update user with new verification code
        user.verificationcode = verificationCode;
        user.verificationcodeExpiry = verificationCodeExpiry;
        await user.save();

        // Send verification email
        await SendVerificationEmail(user.email, verificationCode);

        return res.status(200).json({ 
            message: "Verification email sent successfully. Please check your inbox."
        });
        
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message });
    }
}

export const GetUser = async (req, res) => {
    try {
        // User is already attached to req by the authentication middleware
        return res.status(200).json({
            message: "User data retrieved successfully",
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                isVerified: req.user.isVerified,
                createdAt: req.user.createdAt,
                updatedAt: req.user.updatedAt
            }
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message });
    }
}


export const Logout = async(req,res)=>{
    try {
        // Clear the cookie by setting it with an empty value and immediate expiry
        res.cookie("token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 0, // Immediately expire the cookie
        });

        return res.status(200).json({ 
            message: "Logged out successfully" 
        });
        
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message });
    }
}

