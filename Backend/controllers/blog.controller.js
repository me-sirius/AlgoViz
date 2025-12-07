const Blog = require("../models/blog.model");
// const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

module.exports.fetchAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ isPublished: true })
      .populate("author", "name email avatar")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, blogs });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ success: false, message: "Error fetching blogs" });
  }
};
