const Experience = require("../models/experience.model"); // Adjust path if needed
const User = require("../models/user.model"); // Adjust path if needed
const MCQ = require("../models/mcq.model");
const mongoose = require("mongoose");
const os = require("os");
const connectDB = require("../db/db");
// 1. GET ALL PENDING EXPERIENCES
// This fetches the list for your "Verification Queue"
const Analytics = require("../models/analytics.model");
const Question = require("../models/question.model");
const Notification = require("../models/notification.model");
const Interview = require("../models/interview.model");
const Mentor = require("../models/mentor.model");
module.exports.getPendingExperiences = async (req, res) => {
  try {
    //await connectDB();
    // Fetch all posts where status is "Pending"
    // .populate() pulls in the Author's Name so you know who posted it
    const pending = await Experience.find({ status: "Pending" })
      .populate("userId", "name email")
      .sort({ createdAt: -1 }); // Newest first

    res.status(200).json({
      success: true,
      count: pending.length,
      data: pending,
    });
  } catch (error) {
    console.error("Admin Fetch Error:", error);
    res.status(500).json({ message: "Failed to fetch pending queue" });
  }
};

// 2. UPDATE STATUS (Approve / Reject)
// This handles the buttons in your Admin Dashboard

module.exports.updateExperienceStatus = async (req, res) => {
  try {
    //await connectDB();
    const { id } = req.params;
    const { status } = req.body; // Expecting: "Approved" or "Rejected"

    // 1. Validate Input
    const validStatuses = ["Approved", "Rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Use 'Approved' or 'Rejected'.",
      });
    }

    // 2. Find and Update
    const updatedExperience = await Experience.findByIdAndUpdate(
      id,
      { status: status },
      { new: true }, // Return the updated document
    );

    if (!updatedExperience) {
      return res.status(404).json({ message: "Experience not found" });
    }

    // 3. Success Response
    res.status(200).json({
      success: true,
      message: `Experience successfully ${status}`,
      data: updatedExperience,
    });
  } catch (error) {
    console.error("Update Status Error:", error);
    res.status(500).json({ message: "Server error during status update" });
  }
};
module.exports.getAllUserList = async (req, res) => {
  try {
    //await connectDB();
    console.log("user List nikalne aaya hu");
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.log("error", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports.updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const updateData = req.body; // The fields you want to change

    const user = await User.findByIdAndUpdate(
      id, // 1. Who to find
      updateData, // 2. What to update
      { new: true, runValidators: true }, // 3. Options (Important!)
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ success: true, message: "Update successful", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports.deleteUser = async (req, res) => {
  try {
    //await connectDB();
    const { id } = req.params;

    // 1. Delete the user
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. OPTIONAL: Delete all experiences posted by this user (Cleanup)
    await Experience.deleteMany({ userId: id });

    res.status(200).json({
      success: true,
      message: "User and their data removed successfully",
    });
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
};

module.exports.getSystemHealth = async (req, res) => {
  try {
    //await connectDB();
    console.log("systemHealthme aaya hu");
    // 1. Calculate Uptime (Seconds -> H h M m)
    const uptimeSeconds = process.uptime();
    const days = Math.floor(uptimeSeconds / (3600 * 24));
    const hours = Math.floor((uptimeSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const uptimeString = `${days}d ${hours}h ${minutes}m`;

    // 2. Memory Usage (Heap Used in MB)
    const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024;

    // 3. Database Latency Check
    const start = Date.now();
    let dbStatus = "Disconnected";
    if (mongoose.connection.readyState === 1) {
      dbStatus = "Connected";
      // Simple ping to DB to measure response time
      await mongoose.connection.db.admin().ping();
    }
    const latency = Date.now() - start;

    res.status(200).json({
      success: true,
      data: {
        database: {
          status: dbStatus,
          latency: `${latency}ms`,
        },
        server: {
          uptime: uptimeString,
          memory: `${Math.round(memoryUsage)} MB`,
          platform: `${os.type()} ${os.release()}`, // e.g., Linux 5.4 or Darwin 21.6
        },
      },
    });
  } catch (error) {
    console.error("Health Check Error:", error);
    res.status(500).json({ message: "System check failed" });
  }
};

module.exports.trackVisit = async (req, res) => {
  try {
    //await connectDB();
    // 1. Identify the Date
    const today = new Date().toISOString().split("T")[0]; // "2025-12-14"

    // 2. Extract Visitor Details
    const ip =
      req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const userAgent = req.headers["user-agent"] || "";
    const referrer = req.body.referrer || "direct"; // You send this from frontend
    const page = req.body.page || "/"; // You send this from frontend

    // 3. Determine Device Type
    let deviceType = "desktop";
    if (/mobile/i.test(userAgent)) deviceType = "mobile";
    if (/tablet/i.test(userAgent)) deviceType = "tablet";

    // 4. Find Today's Record (or create it)
    let analytics = await Analytics.findOne({ date: today });

    if (!analytics) {
      analytics = new Analytics({ date: today });
    }

    // 5. Update Counters
    analytics.totalVisits += 1;

    // Check Uniqueness
    if (!analytics.visitorIPs.includes(ip)) {
      analytics.uniqueVisitors += 1;
      analytics.visitorIPs.push(ip);
    }

    // Update Device Stats
    if (analytics.devices[deviceType] !== undefined) {
      analytics.devices[deviceType] += 1;
    } else {
      analytics.devices.other += 1;
    }

    // Update Source
    // Simple check: does referrer contain "google", "linkedin", etc?
    let source = "other";
    if (
      !referrer ||
      referrer === "direct" ||
      referrer.includes(process.env.CLIENT_URL)
    )
      source = "direct";
    else if (referrer.includes("google")) source = "google";
    else if (referrer.includes("linkedin")) source = "linkedin";
    else if (referrer.includes("github")) source = "github";

    if (analytics.sources[source] !== undefined) {
      analytics.sources[source] += 1;
    } else {
      analytics.sources.other += 1;
    }

    // Update Page View
    const pageIndex = analytics.pageViews.findIndex((p) => p.page === page);
    if (pageIndex > -1) {
      analytics.pageViews[pageIndex].count += 1;
    } else {
      analytics.pageViews.push({ page: page, count: 1 });
    }

    await analytics.save();

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Tracking Error:", error);
    // Don't crash the user's experience if stats fail
    res.status(200).send();
  }
};

module.exports.getStats = async (req, res) => {
  try {
    //await connectDB();

    // Run all independent queries in parallel for faster response time
    const [userCount, expCount, pendingCount, analyticsAgg] = await Promise.all(
      [
        User.countDocuments(),
        Experience.countDocuments(),
        Experience.countDocuments({ status: "Pending" }),

        // Use MongoDB Aggregation to sum everything in one go (High Performance)
        Analytics.aggregate([
          {
            $group: {
              _id: null,
              totalVisits: { $sum: "$totalVisits" },
              uniqueVisitors: { $sum: "$uniqueVisitors" },
              // Devices
              desktop: { $sum: "$devices.desktop" },
              mobile: { $sum: "$devices.mobile" },
              tablet: { $sum: "$devices.tablet" },
              otherDevices: { $sum: "$devices.other" },
              // Sources
              direct: { $sum: "$sources.direct" },
              google: { $sum: "$sources.google" },
              linkedin: { $sum: "$sources.linkedin" },
              github: { $sum: "$sources.github" },
              otherSources: { $sum: "$sources.other" },
            },
          },
        ]),
      ],
    );

    // Handle case where analytics collection is empty
    const data = analyticsAgg[0] || {
      totalVisits: 0,
      uniqueVisitors: 0,
      desktop: 0,
      mobile: 0,
      tablet: 0,
      otherDevices: 0,
      direct: 0,
      google: 0,
      linkedin: 0,
      github: 0,
      otherSources: 0,
    };

    // Reshape data to match your Frontend structure
    res.status(200).json({
      users: userCount,
      experiences: expCount,
      pending: pendingCount,
      analytics: {
        totalVisits: data.totalVisits,
        uniqueVisitors: data.uniqueVisitors,
        devices: {
          desktop: data.desktop,
          mobile: data.mobile,
          tablet: data.tablet,
          other: data.otherDevices,
        },
        sources: {
          direct: data.direct,
          google: data.google,
          linkedin: data.linkedin,
          github: data.github,
          other: data.otherSources,
        },
      },
    });
  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({ message: "Error fetching dashboard stats" });
  }
};
module.exports.createQuestion = async (req, res) => {
  try {
    //await connectDB();
    const data = req.body;

    // 1. GENERATE SLUG (Essential!)
    let slug = data.title
      .toLowerCase()
      .trim()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");

    // 2. CHECK FOR DUPLICATES & FIX
    // If "two-sum" exists, change it to "two-sum-1715629" automatically
    // const existing = await Question.findOne({ slug });
    // if (existing) {
    //   slug = `${slug}-${Date.now()}`;
    // }

    // 3. Create Object (Uncomment slug!)
    const newQuestion = new Question({
      ...data,
      slug: slug, // <--- UNCOMMENT THIS
    });

    await newQuestion.save();

    res.status(201).json({
      success: true,
      message: "Question added successfully",
      data: newQuestion,
    });
  } catch (error) {
    console.error("Create Question Error:", error);
    res.status(500).json({ message: "Failed to add question" });
  }
};

module.exports.createMCQ = async (req, res) => {
  try {
    //await connectDB();
    const {
      question,
      options,
      correctOption,
      category,
      difficulty,
      explanation,
      tags,
      companies,
      yearAsked,
      questionType,
      opportunityType,
    } = req.body;
    console.log(opportunityType);
    // Basic Validation
    if (!question || !options || options.length < 2) {
      return res.status(400).json({ message: "Invalid question format" });
    }

    const newMCQ = new MCQ({
      question,
      options,
      correctOption, // Index (0-3)
      category,
      difficulty,
      explanation,
      tags,
      companies: companies
        ? companies
            .split(",")
            .map((c) => c.trim())
            .filter(Boolean)
        : [],
      yearAsked: yearAsked || new Date().getFullYear(),
      questionType: questionType || "Practice",
      opportunityType,
    });

    await newMCQ.save();

    res.status(201).json({
      success: true,
      message: "MCQ added successfully",
      data: newMCQ,
    });
  } catch (error) {
    console.error("Create MCQ Error:", error);
    res.status(500).json({ message: "Failed to add MCQ" });
  }
};

module.exports.sendAdminNotification = async (req, res) => {
  try {
    //await connectDB();
    const { targetUserId, title, message, type, sendViaEmail } = req.body;

    // 1. Determine Recipients
    let recipients = [];
    if (targetUserId === "ALL") {
      // Get all user IDs (and emails if sending email)
      recipients = await User.find({}, "_id email name");
    } else {
      const user = await User.findById(targetUserId);
      if (!user)
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      recipients = [user];
    }

    // 2. Create In-App Notifications (Bulk Insert for performance)
    const notifications = recipients.map((user) => ({
      recipient: user._id,
      type: type || "SYSTEM", // 'SYSTEM', 'STREAK_WARNING', 'INFO'
      message: message,
      title: title || "Admin Notification",
      isRead: false,
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    // 3. Handle Email Sending (Optional)
    if (sendViaEmail) {
      console.log(`Simulating sending emails to ${recipients.length} users...`);
      // recipients.forEach(user => sendEmail(user.email, title, message));
    }

    res.status(200).json({
      success: true,
      message: `Sent to ${recipients.length} user(s).`,
    });
  } catch (error) {
    console.error("Notification Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// =============================================================================
// GET PENDING PAYMENTS - Fetch completed interviews for admin to pay mentors
// =============================================================================

module.exports.getPendingPayments = async (req, res) => {
  try {
    //await connectDB();

    // Fetch all completed interviews (feedback submitted)
    // where mentorPaid is false or doesn't exist
    const pendingPayments = await Interview.find({
      status: "Completed",
      mentorPaid: { $ne: true }, // Not yet paid
    })
      .populate(
        "mentorId",
        "name email avatar company role payoutSettings pricePerSession",
      )
      .populate("studentId", "name email")
      .sort({ "mentorFeedback.submittedAt": -1 });

    res.status(200).json({
      success: true,
      count: pendingPayments.length,
      data: pendingPayments,
    });
  } catch (error) {
    console.error("Pending Payments Error:", error);
    res.status(500).json({ message: "Failed to fetch pending payments" });
  }
};

// Mark interview as paid
module.exports.markAsPaid = async (req, res) => {
  try {
    //await connectDB();
    const { id } = req.params;
    const { paymentNote } = req.body;

    const interview = await Interview.findByIdAndUpdate(
      id,
      {
        mentorPaid: true,
        mentorPaidAt: new Date(),
        paymentNote: paymentNote || "",
      },
      { new: true },
    );

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    res.status(200).json({
      success: true,
      message: "Marked as paid",
      data: interview,
    });
  } catch (error) {
    console.error("Mark Paid Error:", error);
    res.status(500).json({ message: "Failed to mark as paid" });
  }
};

// =============================================================================
// QUESTION MANAGEMENT - CRUD Operations for Admin
// =============================================================================

const ADMIN_SECRET_PIN = "1462"; // Secret PIN for sensitive operations

// GET ALL QUESTIONS (with search, filter, pagination)
module.exports.getAllQuestions = async (req, res) => {
  try {
    //await connectDB();

    const {
      search = "",
      company = "",
      difficulty = "",
      page = 1,
      limit = 20,
    } = req.query;

    // Build filter
    const filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    if (company) {
      filter.companies = { $in: [new RegExp(company, "i")] };
    }

    if (difficulty && difficulty !== "all") {
      filter.difficulty = difficulty;
    }

    // Get total count for pagination
    const total = await Question.countDocuments(filter);

    // Fetch questions with pagination
    const questions = await Question.find(filter)
      .select(
        "title difficulty tags companies timeLimit memoryLimit createdAt slug yearAsked opportunityType",
      )
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: questions,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error("Get All Questions Error:", error);
    res.status(500).json({ message: "Failed to fetch questions" });
  }
};

// UPDATE QUESTION (with PIN validation)
module.exports.updateQuestion = async (req, res) => {
  try {
    //await connectDB();
    const { id } = req.params;
    const { secretPin, ...updateData } = req.body;

    // 1. Validate PIN
    if (!secretPin || secretPin !== ADMIN_SECRET_PIN) {
      return res.status(403).json({
        success: false,
        message: "Invalid security PIN",
      });
    }

    // 2. If title is being updated, regenerate slug
    if (updateData.title) {
      updateData.slug = updateData.title
        .toLowerCase()
        .trim()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");
    }

    // 3. Find and Update
    const updatedQuestion = await Question.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.status(200).json({
      success: true,
      message: "Question updated successfully",
      data: updatedQuestion,
    });
  } catch (error) {
    console.error("Update Question Error:", error);
    res.status(500).json({ message: "Failed to update question" });
  }
};

// DELETE QUESTION (with PIN validation)
module.exports.deleteQuestion = async (req, res) => {
  try {
    //await connectDB();
    const { id } = req.params;
    const { secretPin } = req.body;

    // 1. Validate PIN
    if (!secretPin || secretPin !== ADMIN_SECRET_PIN) {
      return res.status(403).json({
        success: false,
        message: "Invalid security PIN",
      });
    }

    // 2. Delete Question
    const deletedQuestion = await Question.findByIdAndDelete(id);

    if (!deletedQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.status(200).json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    console.error("Delete Question Error:", error);
    res.status(500).json({ message: "Failed to delete question" });
  }
};

// GET QUESTION BY ID (for admin - no JWT required, just admin secret)
module.exports.getQuestionById = async (req, res) => {
  try {
    //await connectDB();
    const { id } = req.params;

    const question = await Question.findById(id).lean();

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.status(200).json({
      success: true,
      data: question,
    });
  } catch (error) {
    console.error("Get Question By ID Error:", error);
    res.status(500).json({ message: "Failed to fetch question" });
  }
};

// ===============================================================
// COMMENT APPROVAL SYSTEM
// ===============================================================

module.exports.getPendingComments = async (req, res) => {
  try {
    const experiences = await Experience.find({
      "comments.isApproved": false,
    })
      .select("company role comments")
      .populate("comments.userId", "name email avatar");

    const pendingComments = [];
    experiences.forEach((exp) => {
      exp.comments
        .filter((c) => !c.isApproved)
        .forEach((comment) => {
          pendingComments.push({
            experienceId: exp._id,
            experienceTitle: `${exp.company} - ${exp.role}`,
            commentId: comment._id,
            text: comment.text,
            author: comment.userId,
            createdAt: comment.createdAt,
          });
        });
    });

    res.status(200).json({
      success: true,
      count: pendingComments.length,
      data: pendingComments,
    });
  } catch (error) {
    console.error("Get Pending Comments Error:", error);
    res.status(500).json({ message: "Failed to fetch pending comments" });
  }
};

module.exports.approveComment = async (req, res) => {
  try {
    const { experienceId, commentId } = req.params;

    const experience = await Experience.findById(experienceId);
    if (!experience) {
      return res.status(404).json({ message: "Experience not found" });
    }

    const comment = experience.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    comment.isApproved = true;
    await experience.save();

    res.status(200).json({
      success: true,
      message: "Comment approved",
    });
  } catch (error) {
    console.error("Approve Comment Error:", error);
    res.status(500).json({ message: "Failed to approve comment" });
  }
};

module.exports.deleteCommentAsAdmin = async (req, res) => {
  try {
    const { experienceId, commentId } = req.params;

    const experience = await Experience.findById(experienceId);
    if (!experience) {
      return res.status(404).json({ message: "Experience not found" });
    }

    const comment = experience.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    comment.deleteOne();
    await experience.save();

    res.status(200).json({
      success: true,
      message: "Comment deleted by admin",
    });
  } catch (error) {
    console.error("Delete Comment As Admin Error:", error);
    res.status(500).json({ message: "Failed to delete comment" });
  }
};
