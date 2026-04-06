const jwt = require("jsonwebtoken");
const Mentor = require("../models/mentor.model");

module.exports.mentorAuth = async (req, res, next) => {
  let token;

  // 1. Check for token in 'Authorization: Bearer <token>' header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token string
      token = req.headers.authorization.split(" ")[1];
      // Decode token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Security Check: Ensure token belongs to a Mentor
      if (decoded.role !== "mentor") {
        return res
          .status(403)
          .json({ message: "Access denied. Mentors only." });
      }
      // Fetch Mentor from DB (excluding password) and attach to request
      req.user = await Mentor.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "Mentor not found" });
      }

      next(); // Proceed to controller
    } catch (error) {
      console.error("Auth Error:", error);
      res.status(401).json({ message: "Not authorized, invalid token" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};
