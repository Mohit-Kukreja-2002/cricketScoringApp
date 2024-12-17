import { dirname } from 'path';
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import path from "path";
import ejs from "ejs";
import fs from "fs";
import ms from "ms";
import bcrypt from "bcrypt";

import User from "../model/user.model.js";
import sendMail from "../sendMail.js";

import dotenv from 'dotenv';
dotenv.config();

const accessTokenExpire = process.env.ACCESS_TOKEN_EXPIRY || '1d';
const refreshTokenExpire = process.env.REFRESH_TOKEN_EXPIRY || '10d';
const expiresInMs = ms(accessTokenExpire);
const expiresInMsRefresh = ms(refreshTokenExpire);

export const accessTokenOptions = {
    expires: new Date(Date.now() + expiresInMs),
    maxAge: expiresInMs,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV !== 'development'
};

export const refreshTokenOptions = {
    expires: new Date(Date.now() + expiresInMsRefresh),
    maxAge: expiresInMsRefresh,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV !== 'development'
};

export const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) throw new Error("User not found");

        const accessToken = user.generateAccessToken();  // Using model method
        const refreshToken = user.generateRefreshToken();  // Using model method

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken, success: true };

    } catch (error) {
        console.error("Error generating tokens:", error);
        return { accessToken: "", refreshToken: "", success: false };
    }
};

export const registerUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password || email.trim() === "" || password.trim() === "") {
            return res.status(400).json({ success: false, error: "All fields are required" });
        }

        if (password.length < 8) {
            return res.status(400).json({ success: false, error: "Password must be at least 8 characters" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, error: "This email is already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = { email, password: hashedPassword };
        const activationToken = createActivationToken(user);

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);

        const mailTemplatePath = path.resolve(__dirname, "../mails/activation-mail.ejs").toString();

        const html = await ejs.renderFile(mailTemplatePath, { activationCode: activationToken.activationCode });

        await sendMail({ email, subject: "Account Activation Mail", template : "activation-mail.ejs", data: { activationCode: activationToken.activationCode } });

        res.status(200).json({ success: true, message: `Please check your email: ${email} to activate your account`, activationToken: activationToken.token });

    } catch (error) {
        console.error("Error in registerUser:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

export const createActivationToken = (user) => {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
    const token = jwt.sign({ user, activationCode }, process.env.ACTIVATION_SECRET, { expiresIn: "5m" });
    return { token, activationCode };
};

export const activateUser = async (req, res) => {
    try {
        const { activation_token, activation_code } = req.body;

        const decoded = jwt.verify(activation_token, process.env.ACTIVATION_SECRET);

        if (decoded.activationCode !== activation_code) {
            return res.status(400).json({ success: false, error: "Incorrect activation code" });
        }

        const { email, password } = decoded.user;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, error: "This email is already registered" });
        }

        await User.create({ email, password });
        res.status(200).json({ success: true, message: "Account activated successfully" });

    } catch (error) {
        console.error("Error in activateUser:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: "All fields are required" });
        }

        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(400).json({ success: false, error: "Invalid credentials" });
        }

        const isPasswordMatch = await user.comparePassword(password.trim());
        if (!isPasswordMatch) {
            return res.status(400).json({ success: false, error: "Invalid credentials" });
        }

        const { accessToken, refreshToken, success } = await generateAccessAndRefreshTokens(user._id);
        if (!success) {
            return res.status(500).json({ success: false, error: "Failed to generate tokens" });
        }

        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

        res.status(200)
            .cookie("accessToken", accessToken, accessTokenOptions)
            .cookie("refreshToken", refreshToken, refreshTokenOptions)
            .json({ success: true, user: loggedInUser, message: "Logged in successfully" });

    } catch (error) {
        console.error("Error in loginUser:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

export const logoutUser = async (req, res) => {
    try {
        const userId = req.user._id;

        await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });

        res.cookie("accessToken", "", { maxAge: 0 });
        res.cookie("refreshToken", "", { maxAge: 0 });

        res.status(200).json({ success: true, message: "Logged out successfully" });

    } catch (error) {
        console.error("Error in logoutUser:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

export const getUser = async (req, res) => {
    try {
        res.status(200).json({ success: true, role: req.user.role});

    } catch (error) {
        console.error("Error in getUser:", error);
        res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};
