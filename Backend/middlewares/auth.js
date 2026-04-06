const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const connectDB = require("../db/db");
// const { v4: uuidv4 } = require('uuid'); // Not needed if we remove session rotation below

module.exports.authUser = async (req, res, next) => {
  // 1. Get tokens
  const headerToken = req.headers.authorization?.split(" ")[1];
  console.log("headerTOken : ", headerToken);
  // const cookieToken = req.cookies.token;
  // console.log(headerToken === cookieToken);
  // // 2. Security: Double Key Check
  // if (!headerToken || !cookieToken) {
  //   return res
  //     .status(401)
  //     .json({ message: "Unauthorized: Missing secure session cookie." });
  // }
  // if (headerToken !== cookieToken) {
  //   return res.status(403).json({ message: "Security Alert: Token mismatch." });
  // }

  const token = headerToken;
  try {
    // await connectDB();

    // 3. Verify Signature
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("decoded : ", decoded);
    // 4. Find User
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }
    // 5. SECURITY CHECK: Session ID Pattern ONLY
    // We removed the old (token !== user.currentSessionToken) check to avoid conflicts.
    // This assumes your User model and Login controller use 'currentSessionId'
    if (!decoded.sessionId || decoded.sessionId !== user.currentSessionId) {
      return res.status(401).json({
        message: "Session expired. You have logged in from another device.",
      });
    }

    // ---------------------------------------------------------
    // 6. PREMIUM CHECK (Fixed: No Session Rotation)
    // ---------------------------------------------------------
    if (user.isPremium && user.premiumExpiryDate) {
      const currentDate = new Date();

      if (currentDate > user.premiumExpiryDate) {
        console.log(`User ${user._id} premium expired. Downgrading...`);

        // A. Downgrade status
        user.isPremium = false;
        user.premiumExpiryDate = null;

        // B. SAVE ONLY (Do not change session ID)
        // This keeps the user logged in, but they are now a "free" user.
        await user.save();
      }
    }
    // ---------------------------------------------------------

    req.user = user;
    return next();
  } catch (error) {
    console.log("Auth Error:", error.message);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};
