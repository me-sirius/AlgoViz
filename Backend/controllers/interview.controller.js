const Experience = require("../models/experience.model");
const User = require("../models/user.model");
const Mentor = require("../models/mentor.model");
const Interview = require("../models/interview.model");
const Transaction = require("../models/transaction.model");
const Upload = require("../models/upload.model");
const connectDB = require("../db/db");
const nodemailer = require("nodemailer");
const { generateMeetLink, generateDocLink } = require("../utils/googleService");
const {
  sendBookingEmails,
  sendLinkUpdateEmail,
} = require("../utils/emailService");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
// ===============================================================
// SECTION 1: INTERVIEW EXPERIENCES (Sharing Stories)
// ===============================================================
module.exports.createExperience = async (req, res) => {
  try {
    //await connectDB();
    const userId = req.user._id;

    // Destructure all possible fields
    const {
      company,
      role,
      batch,
      verdict,
      difficulty,
      rounds,
      tips,
      tags,
      location,
      experienceType, // "Internship" or "Placement"
      stipend, // Specific to Internship
      ctc, // Specific to Placement
      roleType, // e.g., "Summer Intern" or "FTE"
      college,
      department,
    } = req.body;

    // 1. Basic Validation
    if (
      !company ||
      !role ||
      !verdict ||
      !rounds ||
      rounds.length === 0 ||
      !experienceType
    ) {
      return res
        .status(400)
        .json({ message: "Please fill in all required fields." });
    }

    if (!batch || !batch.trim()) {
      return res.status(400).json({ message: "Batch year is required." });
    }

    // Filter out completely empty rounds, then validate remaining
    const validRounds = rounds.filter(
      (r) =>
        (r.roundName && r.roundName.trim()) ||
        (r.description && r.description.trim()),
    );

    if (validRounds.length === 0) {
      return res.status(400).json({
        message: "Please add at least one round with a title and description.",
      });
    }

    for (let i = 0; i < validRounds.length; i++) {
      if (!validRounds[i].roundName || !validRounds[i].roundName.trim()) {
        return res
          .status(400)
          .json({ message: `Round ${i + 1} is missing a title.` });
      }
      if (!validRounds[i].description || !validRounds[i].description.trim()) {
        return res
          .status(400)
          .json({ message: `Round ${i + 1} is missing a description.` });
      }
    }

    // 2. Construct the specific data objects
    let internshipData = {};
    let placementData = {};

    if (experienceType === "Internship") {
      internshipData = {
        roleType: roleType || "Internship",
        stipend: stipend || "Hidden",
      };
    } else if (experienceType === "Placement") {
      placementData = {
        roleType: roleType || "Full Time",
        ctc: ctc || "Hidden",
      };
    }

    // 3. Create the Experience
    const newExperience = await Experience.create({
      userId,
      company,
      role,
      batch: batch.trim(),
      verdict,
      difficulty,
      rounds: validRounds,
      tips,
      tags: tags ? tags.split(",").map((t) => t.trim()) : [],
      location: location || "Not Specified",
      experienceType,
      internship: internshipData,
      placement: placementData,
      status: "Pending",
      college,
      department,
    });
    const reviewLink = `${process.env.FRONTEND_URL}/admin`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL, // Your email address
      subject: `🚨 New Experience Submission: ${newExperience.company}`,
      html: `
        <h2>New Interview Experience Submitted</h2>
        <p><strong>Company:</strong> ${newExperience.company}</p>
        <p><strong>Role:</strong> ${newExperience.role}</p>
        <p><strong>User:</strong> ${req.user.name}</p>
        <br/>
        <p>Click below to review and approve/reject:</p>
        <a href="${reviewLink}" style="background:#2563EB;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Review Submission</a>
        <br/><br/>
        <p>Or copy link: ${reviewLink}</p>
      `,
    };
    transporter
      .sendMail(mailOptions)
      .catch((err) => console.error("Email failed:", err));
    res.status(201).json({
      success: true,
      message: `${experienceType} experience shared successfully!`,
      data: newExperience,
    });
  } catch (error) {
    console.error("Create Experience Error:", error);
    res.status(500).json({ message: "Failed to share experience" });
  }
};

module.exports.getAllExperiences = async (req, res) => {
  try {
    const {
      search,
      company,
      difficulty,
      verdict,
      sort,
      batch,
      location,
      department,
      experienceType,
      college,
      tags,
      page,
      limit,
    } = req.query;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 12;
    const skip = (pageNum - 1) * limitNum;

    // --- 1. Build Match Stage (Enhanced Filtering) ---
    let matchStage = { status: "Approved" };

    // ENHANCED: Search across ALL text fields
    if (search) {
      matchStage.$or = [
        { company: { $regex: search, $options: "i" } },
        { role: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { department: { $regex: search, $options: "i" } },
        { college: { $regex: search, $options: "i" } },
        { batch: { $regex: search, $options: "i" } },
        { tips: { $regex: search, $options: "i" } },
      ];
    }

    // Existing filters
    if (company && company !== "All")
      matchStage.company = { $regex: `^${company}$`, $options: "i" };
    if (difficulty) matchStage.difficulty = difficulty;
    if (verdict) matchStage.verdict = verdict;

    // NEW: Additional filters
    if (batch) matchStage.batch = batch;
    if (location && location !== "All")
      matchStage.location = { $regex: location, $options: "i" };
    if (department)
      matchStage.department = { $regex: department, $options: "i" };
    if (experienceType && experienceType !== "All")
      matchStage.experienceType = experienceType;
    if (college) matchStage.college = { $regex: college, $options: "i" };
    if (tags) matchStage.tags = { $in: [new RegExp(tags, "i")] };

    // --- 2. Build Sort Stage ---
    let sortStage = { createdAt: -1 }; // Default: Newest

    if (sort === "popular") sortStage = { upvotes: -1 };

    // Sort by unique view count
    if (sort === "views") sortStage = { viewCount: -1 };

    // --- 3. Run Aggregation Pipeline ---
    const experiences = await Experience.aggregate([
      // A. Filter Data
      { $match: matchStage },

      // B. Calculate unique view count from viewedBy array
      {
        $addFields: {
          viewCount: { $size: { $ifNull: ["$viewedBy", []] } },
        },
      },

      // C. Sort (Now works because viewCount exists)
      { $sort: sortStage },

      // D. Pagination
      { $skip: skip },
      { $limit: limitNum },

      // E. Populate 'userId' (Since aggregate doesn't use .populate)
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "authorDetails",
        },
      },

      // F. Unwind the author array (convert [obj] to obj)
      {
        $unwind: {
          path: "$authorDetails",
          preserveNullAndEmptyArrays: true,
        },
      },

      // G. Format Output - Now returns ALL stored fields
      {
        $project: {
          company: 1,
          role: 1,
          difficulty: 1,
          verdict: 1,
          tags: 1,
          createdAt: 1,
          upvotes: 1,
          rounds: 1,
          tips: 1,
          batch: 1,
          location: 1,
          department: 1,
          college: 1,
          experienceType: 1,
          internship: 1,
          placement: 1,
          isFeatured: 1,
          viewedBy: 1,
          viewCount: 1,
          userId: {
            _id: "$authorDetails._id",
            name: "$authorDetails.name",
            avatar: "$authorDetails.avatar",
            college: "$authorDetails.college",
          },
        },
      },
    ]);

    // Get total count for pagination
    const totalCount = await Experience.countDocuments(matchStage);

    res.status(200).json({
      success: true,
      count: experiences.length,
      total: totalCount,
      page: pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
      data: experiences,
    });
  } catch (error) {
    console.error("Get Experiences Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// @desc    Get single experience details
// @route   GET /api/interviews/experience/:id

module.exports.getExperienceById = async (req, res) => {
  try {
    const { id } = req.params;

    const experience = await Experience.findById(id)
      .populate("userId", "name avatar college socials")
      .populate("comments.userId", "name avatar college");

    if (!experience) {
      return res.status(404).json({ message: "Experience not found" });
    }

    res.status(200).json({ success: true, data: experience });
  } catch (error) {
    console.error("Get Experience Detail Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================================================
// SECTION 1.5: RELATED EXPERIENCES
// ===============================================================

// @desc    Get related experiences based on company, tags, or role
// @route   GET /api/interviews/experience/:id/related
module.exports.getRelatedExperiences = async (req, res) => {
  try {
    const { id } = req.params;

    const currentExperience = await Experience.findById(id);
    if (!currentExperience) {
      return res.status(404).json({ message: "Experience not found" });
    }

    const related = await Experience.find({
      _id: { $ne: id },
      status: "Approved",
      $or: [
        { company: currentExperience.company },
        { tags: { $in: currentExperience.tags || [] } },
        { role: { $regex: currentExperience.role, $options: "i" } },
      ],
    })
      .populate("userId", "name avatar college")
      .select(
        "company role verdict difficulty tags batch location experienceType createdAt upvotes viewedBy internship placement",
      )
      .limit(6)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: related.length,
      data: related,
    });
  } catch (error) {
    console.error("Get Related Experiences Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===============================================================
// SECTION 1.6: COMMENTS SYSTEM (with Admin Approval)
// ===============================================================

// @desc    Get approved comments for an experience
// @route   GET /api/interviews/experience/:id/comments
module.exports.getComments = async (req, res) => {
  try {
    const { id } = req.params;

    const experience = await Experience.findById(id)
      .select("comments")
      .populate("comments.userId", "name avatar college");

    if (!experience) {
      return res.status(404).json({ message: "Experience not found" });
    }

    const approvedComments = experience.comments.filter((c) => c.isApproved);

    res.status(200).json({
      success: true,
      count: approvedComments.length,
      data: approvedComments,
    });
  } catch (error) {
    console.error("Get Comments Error:", error);
    res.status(500).json({ message: "Failed to fetch comments" });
  }
};

// @desc    Add a comment to an experience (Pending by default)
// @route   POST /api/interviews/experience/:id/comment
module.exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    const experience = await Experience.findById(id);
    if (!experience) {
      return res.status(404).json({ message: "Experience not found" });
    }

    experience.comments.push({
      userId,
      text: text.trim(),
      isApproved: false,
      createdAt: new Date(),
    });

    await experience.save();

    res.status(201).json({
      success: true,
      message: "Comment submitted for approval",
    });
  } catch (error) {
    console.error("Add Comment Error:", error);
    res.status(500).json({ message: "Failed to add comment" });
  }
};

// @desc    Delete own comment
// @route   DELETE /api/interviews/experience/:experienceId/comment/:commentId
module.exports.deleteComment = async (req, res) => {
  try {
    const { experienceId, commentId } = req.params;
    const userId = req.user._id;

    const experience = await Experience.findById(experienceId);
    if (!experience) {
      return res.status(404).json({ message: "Experience not found" });
    }

    const comment = experience.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    comment.deleteOne();
    await experience.save();

    res.status(200).json({
      success: true,
      message: "Comment deleted",
    });
  } catch (error) {
    console.error("Delete Comment Error:", error);
    res.status(500).json({ message: "Failed to delete comment" });
  }
};

// =========================================================================
// SECTION 2: MOCK INTERVIEWS (Booking Mentors)
// =========================================================================

// @desc    Get list of verified mentors
// @route   GET /api/interviews/mentors
module.exports.getMentors = async (req, res) => {
  try {
    //await connectDB();
    const { company } = req.query;

    let query = {
      "mentorProfile.isMentor": true, // Check the flag we added to User model
      // "mentorProfile.isApproved": true // Uncomment if you add approval logic
    };

    if (company && company !== "All") {
      query["mentorProfile.company"] = company;
    }

    // Fetch users who are mentors
    const mentors = await User.find(query)
      .select("name avatar mentorProfile") // Only get necessary fields
      .lean(); // Convert to plain JS object for performance

    // Format data for frontend
    const formattedMentors = mentors.map((user) => ({
      id: user._id,
      name: user.name,
      avatar: user.avatar,
      ...user.mentorProfile,
    }));

    res.status(200).json({ success: true, data: formattedMentors });
  } catch (error) {
    console.error("Get Mentors Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Reserve a slot IMMEDIATELY (before payment)
// @route   POST /api/interviews/reserve-slot
module.exports.reserveSlot = async (req, res) => {
  console.log("🔒 [RESERVE SLOT] Function called");
  try {
    //await connectDB();
    const studentId = req.user._id;
    const {
      mentorId,
      date,
      timeSlot,
      resumePublicId,
      resumeUrl,
      topic,
      price,
    } = req.body;

    console.log("📝 [RESERVE SLOT] Request data:", {
      studentId: studentId.toString(),
      mentorId,
      date,
      timeSlot,
      topic,
      price,
    });

    // Validate required fields
    if (!mentorId || !date || !timeSlot || !resumePublicId || !resumeUrl) {
      console.log("❌ [RESERVE SLOT] Missing required fields");
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const dateString = new Date(date).toISOString().split("T")[0];
    console.log("📅 [RESERVE SLOT] Formatted date:", dateString);

    // --- STEP 1: ATOMIC SLOT LOCK ---
    console.log("🔐 [RESERVE SLOT] Attempting to lock slot atomically...");
    const updateResult = await Mentor.updateOne(
      {
        _id: mentorId,
        availability: {
          $elemMatch: {
            date: dateString,
            slots: {
              $elemMatch: {
                time: timeSlot,
                isBooked: false,
              },
            },
          },
        },
      },
      {
        $set: {
          "availability.$[d].slots.$[s].isBooked": true,
          "availability.$[d].slots.$[s].bookedBy": studentId,
        },
      },
      {
        arrayFilters: [{ "d.date": dateString }, { "s.time": timeSlot }],
      },
    );

    console.log("🔍 [RESERVE SLOT] Update result:", updateResult);

    // Race condition check
    if (updateResult.modifiedCount === 0) {
      console.log("⚠️ [RESERVE SLOT] Slot already booked (race condition)");
      return res.status(409).json({
        success: false,
        message:
          "This slot was just booked by someone else. Please choose another time.",
      });
    }

    console.log("✅ [RESERVE SLOT] Slot locked successfully!");

    // --- STEP 2: CREATE PENDING TRANSACTION ---
    console.log("💳 [RESERVE SLOT] Creating pending transaction...");
    const transaction = await Transaction.create({
      userId: studentId,
      amount: price,
      currency: "INR",
      category: "MOCK_INTERVIEW",
      description: `Mock Interview - ${topic || "SDE"} (Pending Payment)`,
      status: "PENDING",
      type: "DEBIT",
    });

    console.log(
      "✅ [RESERVE SLOT] Transaction created:",
      transaction._id.toString(),
    );

    // --- STEP 3: CREATE INTERVIEW WITH PENDING_PAYMENT STATUS ---
    // Set expiry time (15 minutes from now)
    const expiryTime = new Date(Date.now() + 15 * 60 * 1000);
    console.log("⏰ [RESERVE SLOT] Setting expiry time:", expiryTime);

    const newInterview = await Interview.create({
      studentId,
      mentorId,
      date,
      timeSlot,
      topic: topic || "Mock Interview",
      amount: price,
      transactionId: transaction._id,
      status: "PENDING_PAYMENT", // Key status!
      paymentExpiryTime: expiryTime,
      meetingLink: "",
      resume: {
        publicId: resumePublicId,
        url: resumeUrl,
      },
      googleDocLink: "",
    });

    console.log(
      "✅ [RESERVE SLOT] Interview created with PENDING_PAYMENT:",
      newInterview._id.toString(),
    );

    // Save resume to Upload model for Media Library
    if (resumePublicId && resumeUrl) {
      await Upload.create({
        url: resumeUrl,
        publicId: resumePublicId,
        name: `Resume_${studentId}_${Date.now()}`,
        folder: "resumes",
        fileType: "pdf",
        uploadedBy: studentId,
      }).catch((err) => console.log("Upload model save error:", err));
      console.log("📁 [RESERVE SLOT] Resume saved to Upload model");
    }

    // Success response
    console.log("🎉 [RESERVE SLOT] Slot reserved successfully!");
    return res.status(201).json({
      success: true,
      message:
        "Slot reserved successfully. Please complete payment within 15 minutes.",
      interviewId: newInterview._id,
      transactionId: transaction._id,
      expiryTime: expiryTime,
    });
  } catch (error) {
    console.error("❌ [RESERVE SLOT] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reserve slot",
      error: error.message,
    });
  }
};

// @desc    Book a mock interview
// @route   POST /api/interviews/book
module.exports.bookMockInterview = async (req, res) => {
  try {
    //await connectDB();

    // 1. Extract Data
    const studentId = req.user._id;
    const {
      mentorId,
      date,
      timeSlot,
      topic,
      price,
      resumePublicId,
      resumeUrl,
      googleDocLink,
    } = req.body;

    // Ensure date matches your DB format (Assuming YYYY-MM-DD string in DB)
    const dateString = new Date(date).toISOString().split("T")[0];

    // --- STEP 1: ATOMIC CHECK & LOCK ---
    // This is the "Gate". It attempts to find the specific nested slot
    // AND update it only if 'isBooked' is false.
    const updateResult = await Mentor.updateOne(
      {
        _id: mentorId,
        availability: {
          $elemMatch: {
            date: dateString,
            slots: {
              $elemMatch: {
                time: timeSlot,
                isBooked: false,
              },
            },
          },
        },
      },
      {
        $set: {
          "availability.$[d].slots.$[s].isBooked": true,
          "availability.$[d].slots.$[s].bookedBy": studentId,
        },
      },
      {
        arrayFilters: [{ "d.date": dateString }, { "s.time": timeSlot }],
      },
    );

    console.log("updatedResukt : ", updateResult);
    // 🚨 RACE CONDITION HANDLER
    // If matchedCount/modifiedCount is 0, it means the filter "s.isBooked": false failed.
    if (updateResult.modifiedCount === 0) {
      return res.status(409).json({
        success: false,
        message:
          "This slot has just been booked by someone else. Please choose another time.",
      });
    }

    // --- STEP 2: INCREMENT SESSION COUNT ---
    // Safe to do now because we own the slot.
    await Mentor.updateOne({ _id: mentorId }, { $inc: { sessionCount: 1 } });

    // --- STEP 3: RECORD TRANSACTION ---
    const transaction = await Transaction.create({
      userId: studentId,
      amount: price || 0,
      currency: "INR",
      category: "MOCK_INTERVIEW",
      description: `Mock Interview with Mentor ID: ${mentorId}`,
      status: "SUCCESS",
      type: "DEBIT",
    });
    const startDateTime = new Date(`${dateString} ${timeSlot}`);
    const startISO = startDateTime.toISOString();

    // const [meetLink, docLink] = await Promise.all([
    //   generateMeetLink(
    //     `Mock Interview: ${topic}`,
    //     `Session with Mentor ${mentorId}`,
    //     startISO
    //   ),
    //   generateDocLink(`Interview Notes: ${dateString}`),
    // ]);
    // console.log("meetimg : ", meetLink, " docLink : ", docLink);
    // --- STEP 4: CREATE INTERVIEW RECORD ---
    const newInterview = await Interview.create({
      studentId,
      mentorId,
      date,
      timeSlot,
      topic,
      amount: price,
      transactionId: transaction._id,
      status: "Scheduled",
      meetingLink: "", // You might generate this dynamically later
      resume: {
        publicId: resumePublicId || null,
        url: resumeUrl || null,
      },
      googleDocLink: "",
    });

    // Save resume to Upload model for Media Library
    if (resumePublicId && resumeUrl) {
      await Upload.create({
        url: resumeUrl,
        publicId: resumePublicId,
        name: `Resume_${studentId}_${Date.now()}`,
        folder: "resumes",
        fileType: "pdf",
        uploadedBy: studentId,
      }).catch((err) => console.log("Upload model save error:", err));
    }

    // --- STEP 5: UPDATE STUDENT HISTORY ---
    await User.findByIdAndUpdate(studentId, {
      $push: { upcomingInterviews: newInterview._id },
    });
    const student = await User.findById(studentId);
    const mentor = await Mentor.findById(mentorId);

    if (student && mentor) {
      // Don't await this if you want the API response to be fast
      sendBookingEmails(student, mentor, {
        date: dateString,
        time: timeSlot,
        topic,
        resumeUrl,
      });
    }
    // Success Response
    return res.status(201).json({
      success: true,
      message: "Interview booked successfully!",
      bookingId: newInterview._id,
    });
  } catch (error) {
    console.error("Booking Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to book interview",
      error: error.message,
    });
  }
};

// @desc    Update an existing experience
// @route   PUT /api/interviews/experience/:id
module.exports.updateExperience = async (req, res) => {
  try {
    //await connectDB();
    const { id } = req.params;
    const userId = req.user._id;
    const updates = req.body;

    // 1. Find the experience
    const experience = await Experience.findById(id);

    if (!experience) {
      return res.status(404).json({ message: "Experience not found" });
    }

    // 2. Security Check: Ensure only the Author can edit
    if (experience.userId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized: You can only edit your own posts" });
    }

    // 3. Sanitization: Prevent users from manually changing Stats/Owner
    // Even if they send these in the body, we delete them so they are ignored.
    delete updates._id;
    delete updates.userId;
    delete updates.upvotes; // Prevent manual vote hacking
    delete updates.views;
    delete updates.createdAt;
    delete updates.updatedAt;

    // 4. Perform the Update
    const updatedExperience = await Experience.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }, // Return the fresh object
    );

    res.status(200).json({
      success: true,
      message: "Experience updated successfully",
      data: updatedExperience,
    });
  } catch (error) {
    console.error("Update Experience Error:", error);
    res.status(500).json({ message: "Server error during update" });
  }
};
module.exports.upvoteExperience = async (req, res) => {
  console.log("upvote me aaya hu");
  try {
    connectDB();
    const experienceId = req.params.id;
    const userId = req.user._id;

    // 1. Fetch both Experience and User
    const experience = await Experience.findById(experienceId);
    const user = await User.findById(userId);

    if (!experience) {
      return res.status(404).json({ message: "Experience not found" });
    }

    // 2. Check if already upvoted
    // We can check either the user's array or the experience's array.
    // Checking the experience is usually safer for the count logic.
    const isUpvoted = experience.upvotes.includes(userId);

    if (isUpvoted) {
      // --- REMOVE VOTE (Toggle OFF) ---
      experience.upvotes.pull(userId); // Remove User ID from Experience
      user.upvotedExperiences.pull(experienceId); // Remove Exp ID from User
    } else {
      // --- ADD VOTE (Toggle ON) ---
      experience.upvotes.push(userId); // Add User ID to Experience
      user.upvotedExperiences.push(experienceId); // Add Exp ID to User
    }

    // 3. Save both documents in parallel for performance
    await Promise.all([experience.save(), user.save()]);

    // 4. Return the updated data
    res.status(200).json({
      message: isUpvoted ? "Upvote removed" : "Upvoted successfully",
      upvotes: experience.upvotes.length,
      isUpvoted: !isUpvoted, // status for frontend
      userUpvotedList: user.upvotedExperiences, // Optional: send back updated list
    });
  } catch (error) {
    console.error("Error in upvoteExperience:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports.viewsExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user._id;

    // $addToSet ensures no duplicates — unique views only
    const updatedExperience = await Experience.findByIdAndUpdate(
      id,
      { $addToSet: { viewedBy: currentUserId } },
      { new: true },
    );

    if (!updatedExperience) {
      return res.status(404).json({ message: "Experience not found" });
    }

    return res.status(200).json({
      success: true,
      views: updatedExperience.viewedBy.length,
    });
  } catch (error) {
    console.error("View Update Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// BOOKMARK EXPERIENCE (Toggle)
module.exports.bookmarkExperience = async (req, res) => {
  try {
    const experienceId = req.params.id;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isBookmarked = user.bookmarkedExperiences.includes(experienceId);

    if (isBookmarked) {
      user.bookmarkedExperiences.pull(experienceId);
    } else {
      user.bookmarkedExperiences.push(experienceId);
    }

    await user.save();

    res.status(200).json({
      success: true,
      bookmarked: !isBookmarked,
      message: isBookmarked ? "Bookmark removed" : "Bookmarked successfully",
    });
  } catch (error) {
    console.error("Bookmark error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// CHECK BOOKMARK STATUS
module.exports.getBookmarkStatus = async (req, res) => {
  try {
    const experienceId = req.params.id;
    const userId = req.user._id;

    const user = await User.findById(userId).select("bookmarkedExperiences");
    const bookmarked =
      user?.bookmarkedExperiences?.includes(experienceId) || false;

    res.status(200).json({ success: true, bookmarked });
  } catch (error) {
    console.error("Bookmark status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET ALL BOOKMARKED EXPERIENCES
module.exports.getBookmarkedExperiences = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId)
      .select("bookmarkedExperiences")
      .populate({
        path: "bookmarkedExperiences",
        match: { status: "Approved" },
        populate: { path: "userId", select: "name avatar college" },
      });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const experiences = (user.bookmarkedExperiences || []).filter(Boolean);

    res.status(200).json({ success: true, data: experiences });
  } catch (error) {
    console.error("Get bookmarks error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET ALL PENDING (For Admin Dashboard)
module.exports.getPendingExperiences = async (req, res) => {
  try {
    //await connectDB();
    const experiences = await Experience.find({ status: "Pending" })
      .populate("userId", "name avatar")
      .sort({ createdAt: -1 }); // Oldest first? Or Newest?

    res.status(200).json({ success: true, data: experiences });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// DECISION (Approve/Reject)
module.exports.updateExperienceStatus = async (req, res) => {
  try {
    //await connectDB();
    const { id } = req.params;
    const { status } = req.body; // "Approved" or "Rejected"

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const experience = await Experience.findByIdAndUpdate(
      id,
      { status: status },
      { new: true },
    );

    res.status(200).json({ success: true, message: `Experience ${status}` });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 1. Get Signature (Protects your Cloudinary from hackers)
module.exports.getUploadSignature = (req, res) => {
  console.log("secret banane aaye hai");
  const timestamp = Math.round(new Date().getTime() / 1000);

  // We sign the parameters we want to enforce
  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp: timestamp,
      folder: "resumes", // Force uploads to this folder
    },
    process.env.CLOUDINARY_API_SECRET,
  );

  res.json({ timestamp, signature });
};

// 2. Delete File (For Cleanup if payment fails)
module.exports.deleteResume = async (req, res) => {
  try {
    console.log("delete hone aaye ji");
    const { publicId } = req.body;
    if (!publicId) return res.status(400).send("No ID provided");

    // Authenticated delete (Only backend can do this)
    await cloudinary.uploader.destroy(publicId);

    res.status(200).send("Cleanup successful");
  } catch (error) {
    console.error("Cleanup failed:", error);
    res.status(500).send("Error deleting file");
  }
};

module.exports.updateSessionLinks = async (req, res) => {
  try {
    const { interviewId, meetingLink, googleDocLink } = req.body;

    // 1. Find and Update
    const interview = await Interview.findByIdAndUpdate(
      interviewId,
      {
        meetingLink: meetingLink,
        googleDocLink: googleDocLink,
      },
      { new: true }, // Return the updated document
    ).populate("studentId"); // Get student info to send email

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    // 2. (Optional) Notify Student that links are ready
    if (interview.studentId && interview.studentId.email) {
      await sendLinkUpdateEmail(interview.studentId, interview);
    }

    res.status(200).json({ success: true, interview });
  } catch (error) {
    console.error("Update Links Error:", error);
    res.status(500).json({ message: "Failed to update links" });
  }
};

// @desc    Release slot (when payment fails or is cancelled)
// @route   POST /api/interviews/release-slot
module.exports.releaseSlot = async (req, res) => {
  console.log("🔓 [RELEASE SLOT] Function called");
  try {
    //await connectDB();
    const { interviewId } = req.body;

    console.log("📝 [RELEASE SLOT] Interview ID:", interviewId);

    // Find the interview
    const interview = await Interview.findById(interviewId);

    if (!interview) {
      console.log("❌ [RELEASE SLOT] Interview not found");
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    console.log("📊 [RELEASE SLOT] Interview status:", interview.status);

    // Only release if status is PENDING_PAYMENT
    if (interview.status !== "PENDING_PAYMENT") {
      console.log("⚠️ [RELEASE SLOT] Interview not in PENDING_PAYMENT status");
      return res.status(400).json({
        success: false,
        message: "Can only release pending payment bookings",
      });
    }

    const dateString = new Date(interview.date).toISOString().split("T")[0];
    console.log("🔓 [RELEASE SLOT] Unlocking slot...");

    // Unlock the slot
    await Mentor.updateOne(
      {
        _id: interview.mentorId,
        availability: {
          $elemMatch: {
            date: dateString,
            slots: {
              $elemMatch: {
                time: interview.timeSlot,
              },
            },
          },
        },
      },
      {
        $set: {
          "availability.$[d].slots.$[s].isBooked": false,
          "availability.$[d].slots.$[s].bookedBy": null,
        },
      },
      {
        arrayFilters: [
          { "d.date": dateString },
          { "s.time": interview.timeSlot },
        ],
      },
    );

    console.log("✅ [RELEASE SLOT] Slot unlocked");

    // Update transaction to CANCELLED
    await Transaction.findByIdAndUpdate(interview.transactionId, {
      status: "CANCELLED",
    });

    console.log("✅ [RELEASE SLOT] Transaction marked as CANCELLED");

    // Delete the interview
    await Interview.findByIdAndDelete(interviewId);

    console.log("✅ [RELEASE SLOT] Interview deleted");

    // Cleanup resume from Cloudinary
    if (interview.resume?.publicId) {
      console.log("🗑️ [RELEASE SLOT] Cleaning up resume from Cloudinary");
      await cloudinary.uploader.destroy(interview.resume.publicId);
    }

    console.log("🎉 [RELEASE SLOT] Slot released successfully!");

    return res.status(200).json({
      success: true,
      message: "Slot released successfully",
    });
  } catch (error) {
    console.error("❌ [RELEASE SLOT] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to release slot",
      error: error.message,
    });
  }
};

// @desc    Cleanup expired pending bookings (called by cron or manually)
// @route   POST /api/interviews/cleanup-expired
module.exports.cleanupExpiredBookings = async (req, res) => {
  console.log("🧹 [CLEANUP] Starting cleanup of expired bookings...");
  try {
    //await connectDB();

    const now = new Date();
    console.log("⏰ [CLEANUP] Current time:", now);

    // Find all expired PENDING_PAYMENT interviews
    const expiredInterviews = await Interview.find({
      status: "PENDING_PAYMENT",
      paymentExpiryTime: { $lt: now },
    });

    console.log(
      `📋 [CLEANUP] Found ${expiredInterviews.length} expired bookings`,
    );

    let cleanedCount = 0;

    for (const interview of expiredInterviews) {
      try {
        console.log(
          `🔄 [CLEANUP] Processing interview ${interview._id.toString()}`,
        );

        const dateString = new Date(interview.date).toISOString().split("T")[0];

        // Unlock the slot
        await Mentor.updateOne(
          {
            _id: interview.mentorId,
            availability: {
              $elemMatch: {
                date: dateString,
                slots: {
                  $elemMatch: {
                    time: interview.timeSlot,
                  },
                },
              },
            },
          },
          {
            $set: {
              "availability.$[d].slots.$[s].isBooked": false,
              "availability.$[d].slots.$[s].bookedBy": null,
            },
          },
          {
            arrayFilters: [
              { "d.date": dateString },
              { "s.time": interview.timeSlot },
            ],
          },
        );

        // Update transaction to EXPIRED
        await Transaction.findByIdAndUpdate(interview.transactionId, {
          status: "EXPIRED",
        });

        // Delete interview
        await Interview.findByIdAndDelete(interview._id);

        // Cleanup resume
        if (interview.resume?.publicId) {
          await cloudinary.uploader
            .destroy(interview.resume.publicId)
            .catch((err) => console.log("Resume cleanup failed:", err));
        }

        cleanedCount++;
        console.log(
          `✅ [CLEANUP] Cleaned up interview ${interview._id.toString()}`,
        );
      } catch (err) {
        console.error(
          `❌ [CLEANUP] Error cleaning interview ${interview._id}:`,
          err,
        );
      }
    }

    console.log(
      `🎉 [CLEANUP] Cleanup complete! Cleaned ${cleanedCount} bookings`,
    );

    return res.status(200).json({
      success: true,
      message: `Cleaned up ${cleanedCount} expired bookings`,
      cleanedCount,
    });
  } catch (error) {
    console.error("❌ [CLEANUP] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Cleanup failed",
      error: error.message,
    });
  }
};
