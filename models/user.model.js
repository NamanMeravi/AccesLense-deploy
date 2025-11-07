import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const  UserSchema= new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    verificationcode: {
        type: String,
    },
    verificationcodeExpiry: {
        type: Date,
    },
    profilePic: { type: String }
   
   
}, { timestamps: true });

// Pre-save middleware to hash password
UserSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Instance methods
UserSchema.methods.generateToken = function(){
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        console.error("❌ JWT_SECRET is not defined in environment variables");
        throw new Error("JWT_SECRET is required but not found in environment variables");
    }
    return jwt.sign({ id: this._id, email: this.email }, jwtSecret, { expiresIn: "1d" });
}

UserSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password, this.password);
}

// Create and export the model
const User = mongoose.model("User", UserSchema);


export default User;