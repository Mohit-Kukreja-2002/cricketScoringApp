import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const User = new Schema({
    email: {
        type: String,
        required: [true, "Please enter your email"],
        unique: true,
        index: true,
    },

    password: {
        type: String,
        required: [true, "Please enter your password"],
        minlength: [8, "Password must be atleast 8 characters"],
    },

    refreshToken: {
        type: String,
    },

    role: { 
        type: String, 
        default: "viewer"
    },

}, { timestamps: true });

// Compare password method
User.methods.comparePassword = function(password) {
    return bcrypt.compareSync(password, this.password);
}

User.methods.generateAccessToken = function () {
    return jwt.sign(
        { _id: this._id, email: this.email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
}

User.methods.generateRefreshToken = function () {
    return jwt.sign(
        { _id: this._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
}

export default mongoose.models.User || mongoose.model('User', User);
