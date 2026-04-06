const Bug = require("../models/bug.model");
const connectDB = require("../db/db");
module.exports.createBugReport = async (req, res) => {
  try {
    // connectDB();
    console.log("create Bug");
    const { title, category, description, pageUrl, userAgent } = req.body;

    // Validation
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and Description are required",
      });
    }

    // Create the bug object
    const bugData = {
      title,
      category,
      description,
      pageUrl,
      userAgent,
    };

    // If the user is logged in (and you have auth middleware setting req.user)
    if (req.user && req.user._id) {
      bugData.reportedBy = req.user._id;
    }

    const newBug = await Bug.create(bugData);

    res.status(201).json({
      success: true,
      message: "Bug reported successfully",
      data: newBug,
    });
  } catch (error) {
    console.error("Bug Report Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

module.exports.getAllBugs = async (req, res) => {
  try {
    // connectDB();
    // Sort by newest first
    const bugs = await Bug.find()
      .sort({ createdAt: -1 })
      .populate("reportedBy", "username email");

    res.status(200).json({
      success: true,
      count: bugs.length,
      data: bugs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
// @desc    Get ONLY open/active bugs (Not fixed ones)
// @route   GET /api/bugs
exports.getOpenBugs = async (req, res) => {
  try {
    // connectDB();
    console.log("aaya hu open bug nikalne");
    // 1. Filter: Find bugs where status is NOT "resolved" and NOT "closed"
    // $nin means "Not In"
    const bugs = await Bug.find({
      status: { $nin: ["resolved", "closed"] },
    })
      .sort({ createdAt: -1 }) // Newest first
      .populate("reportedBy", "username email"); // Optional: if you linked users

    res.status(200).json({
      success: true,
      count: bugs.length,
      data: bugs,
    });
  } catch (error) {
    console.error("Fetch Bugs Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
module.exports.resolveBug = async (req, res) => {
  try {
    // connectDB();
    const bugId = req.params.id;

    // Find the bug and update its status
    const updatedBug = await Bug.findByIdAndUpdate(
      bugId,
      { status: "resolved" },
      { new: true } // Returns the updated document
    );

    if (!updatedBug) {
      return res.status(404).json({
        success: false,
        message: "Bug not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Bug marked as resolved",
      data: updatedBug,
    });
  } catch (error) {
    console.error("Resolve Bug Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
