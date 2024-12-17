
const isAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, error: "Access Denied. User not authenticated." });
        }
        const { role } = req.user;

        if (role !== "admin") {
            return res.status(403).json({ success: false, error: "Access Denied. Admins only." });
        }
        next();
    } catch (error) {
        console.error("Error in isAdmin middleware:", error);

        return res.status(500).json({ success: false, error: "Internal Server Error" });
    }
};

export default isAdmin;
