import jwt from "jsonwebtoken";
import User from "../model/user.model.js";

const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ success: false, error: "Access Denied. No token provided." });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decoded._id);

        if (!user) {
            return res.status(404).json({ success: false, error: "User not found." });
        }
        req.user = user;

        next();
    } catch (error) {
        console.error("Error in isAuthenticated middleware:", error);

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ success: false, error: "Token expired. Please log in again." });
        }
        console.log(error)
        return res.status(401).json({ success: false, error: "Invalid token. Please log in again." });
    }
};

export default isAuthenticated;
