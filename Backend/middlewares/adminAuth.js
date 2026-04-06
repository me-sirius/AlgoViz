// middleware/adminAuth.js

module.exports.adminAuth = (req, res, next) => {
  try {
    // 1. Get the secret from the headers
    // We use a custom header name like 'x-admin-secret'
    const requestSecret = req.headers["x-admin-secret"];
    console.log(requestSecret, process.env.ADMIN_SECRET);
    // 2. Check if it matches your Backend Environment Variable
    // Make sure ADMIN_SECRET is defined in your .env file
    if (!requestSecret || requestSecret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({
        success: false,
        message: "Access Denied: Invalid Admin Credentials",
      });
    }

    // 3. If match, allow the request to proceed
    next();
  } catch (error) {
    console.error("Admin Auth Error:", error);
    res.status(500).json({ message: "Server Error during Admin Auth" });
  }
};
