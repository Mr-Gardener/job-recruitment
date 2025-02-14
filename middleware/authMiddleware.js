const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (req, res, next) => {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ msg: "Unauthorized: No valid token provided" });
    }

    const token = authHeader.split(" ")[1];

    console.log("🔍 Received Token:", token ? "Token received" : "No token"); // Avoid logging actual token

    if (!process.env.JWT_SECRET) {
        console.error("❌ JWT_SECRET is not set in environment variables!");
        return res.status(500).json({ msg: "Internal server error" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
        req.user = decoded.user;
        next();
    } catch (err) {
        console.error("❌ JWT verification failed:", err.message);
        return res.status(401).json({ msg: "Invalid or expired token" });
    }
};
