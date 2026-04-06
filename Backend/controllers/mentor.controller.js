const Mentor = require("../models/mentor.model"); // <--- USING MENTOR MODEL
const jwt = require("jsonwebtoken");
const Interview = require("../models/interview.model");
const connectDB = require("../db/db");
const cloudinary = require("../utils/cloudinary");
module.exports.login = async (req, res) => {
  try {
    //await connectDB();
    const { email, password } = req.body;

    // 1. Validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    // 2. Find MENTOR (Not User)
    // We explicitly select the password because it's usually hidden in the schema
    const mentor = await Mentor.findOne({ email }).select("+password");

    // 3. Check if Mentor exists
    if (!mentor) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 5. Generate Mentor-Specific Token
    const token = jwt.sign(
      {
        id: mentor._id,
        role: "mentor", // <--- IMPORTANT: Mark them as a mentor in the token
        email: mentor.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    console.log(mentor.availability);
    // 6. Send Response
    res.status(200).json({
      success: true,
      message: "Mentor login successful",
      token,
      mentor: {
        id: mentor._id,
        name: mentor.name,
        email: mentor.email,
        company: mentor.company,
        role: "mentor",
        availability: mentor.availability,
      },
    });
  } catch (error) {
    console.error("Mentor Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const toDateString = (dateInput) => {
  try {
    if (!dateInput) return null;
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().split("T")[0];
  } catch (err) {
    return null;
  }
};

// Helper: Get Day Name (e.g. "Mon", "Tue") from date
const getDayName = (dateInput) => {
  const d = new Date(dateInput);
  return d.toLocaleDateString("en-US", { weekday: "short" }); // Returns "Mon", "Tue", etc.
};

module.exports.updateAvailability = async (req, res) => {
  try {
    //await connectDB();
    const { availability } = req.body;
    // console.log("Incoming Payload:", availability);
    const mentorId = req.user._id;
    console.log(mentorId, " ", availability);
    const mentor = await Mentor.findById(mentorId);
    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    // 2. Smart Merge Logic
    const updatedAvailability = availability.map((newDay) => {
      // Get safe date string
      const newDateStr = toDateString(newDay.date);

      if (!newDateStr) {
        console.warn("Skipping invalid date:", newDay.date);
        return null;
      }

      // --- FIX: Auto-calculate 'day' if missing ---
      const dayName = newDay.day || getDayName(newDay.date);
      // --------------------------------------------

      // Find if this date exists in DB
      const existingDay = mentor.availability.find((dbDay) => {
        const dbDateStr = toDateString(dbDay.date);
        return dbDateStr === newDateStr;
      });

      if (existingDay) {
        // Merge slots (preserve bookings)
        const mergedSlots = newDay.slots.map((newSlot) => {
          const existingSlot = existingDay.slots.find(
            (s) => s.time === newSlot.time
          );

          // Force keep booked slots
          if (existingSlot && existingSlot.isBooked) {
            return existingSlot;
          }
          return newSlot;
        });

        // Restore booked slots that were missing in payload
        existingDay.slots.forEach((oldSlot) => {
          if (
            oldSlot.isBooked &&
            !mergedSlots.find((s) => s.time === oldSlot.time)
          ) {
            mergedSlots.push(oldSlot);
          }
        });

        return {
          date: newDay.date,
          day: dayName, // <--- Using the auto-calculated day
          slots: mergedSlots,
        };
      } else {
        // New Entry: Ensure 'day' is present
        return {
          ...newDay,
          day: dayName, // <--- Using the auto-calculated day
        };
      }
    });

    // Filter nulls
    mentor.availability = updatedAvailability.filter((day) => day !== null);

    await mentor.save({ validateModifiedOnly: true });
    console.log("mentor : ", mentor);
    res.status(200).json({
      success: true,
      message: "Schedule updated successfully",
      availability: mentor.availability,
    });
  } catch (error) {
    console.error("Update Availability Error:", error);
    // Show validation errors clearly
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports.getUpcomingSessions = async (req, res) => {
  try {
    //await connectDB();
    const mentorId = req.user._id;

    // 1. Fetch Sessions
    // We populate 'studentId' but exclude sensitive fields like password, salt, etc.
    let sessions = await Interview.find({
      mentorId: mentorId,
      status: { $ne: "Cancelled" }, // Exclude Cancelled, show Scheduled & Completed
    })
      .populate("studentId", "-password -otp -resetPasswordToken -__v") // ✅ Requirement 1: Safe Data
      .lean(); // Converts Mongoose objects to plain JSON for easier modification

    // 2. Process Data for Priority & Calendar
    sessions = sessions.map((session) => {
      // Check if links are missing
      const hasMeetLink =
        session.meetingLink && session.meetingLink.trim() !== "";
      const isScheduled = session.status === "Scheduled";

      // ✅ Requirement 2: Flag for Priority
      // If it's scheduled but has no link, it needs immediate attention
      const actionRequired = isScheduled && !hasMeetLink;

      return {
        ...session,
        actionRequired, // Frontend can use this to show a "🔴 Update Link" badge

        // ✅ Requirement 3: Calendar Helper
        // Combine Date + TimeSlot into a format Calendar libs (like FullCalendar) love
        start: new Date(session.date).toISOString(),
        title: `${session.studentId?.name || "Student"} - ${session.topic}`,
      };
    });

    // 3. Sort: "Action Required" first, then by Date
    sessions.sort((a, b) => {
      // First, prioritize those needing action
      if (a.actionRequired && !b.actionRequired) return -1;
      if (!a.actionRequired && b.actionRequired) return 1;

      // If both need action (or neither does), sort by Date (Soonest first)
      return new Date(a.date) - new Date(b.date);
    });

    return res.status(200).json({ success: true, sessions });
  } catch (error) {
    console.error("Fetch Sessions Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

module.exports.getSessionResume = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const interview = await Interview.findById(interviewId);

    if (!interview || !interview.resume) {
      return res.status(404).json({ message: "Resume not found" });
    }
    const resume = interview.resume;

    // 1. Extract Version (This works, keep it)
    let fileVersion = undefined;
    if (resume.url) {
      const versionMatch = resume.url.match(/v(\d+)/);
      if (versionMatch) fileVersion = versionMatch[1];
    }

    // 2. Generate Link
    const signedUrl = cloudinary.url(resume.publicId, {
      resource_type: "image",
      type: "upload", // <--- Confirmed by your 'testConnection' JSON
      sign_url: true, // Required because file is 'Blocked'
      format: "pdf",
      version: fileVersion,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    });

    return res.json({ success: true, url: signedUrl });
  } catch (error) {
    console.error("Resume Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};
// GET /api/mentor/all
module.exports.getAllMentors = async (req, res) => {
  try {
    // 1. Fetch all mentors
    const mentors = await Mentor.find({})
      .select("-password -email -__v -notifications -payoutSettings") // Exclude private settings too
      .sort({ rating: -1 })
      .lean(); // Faster for read-only data

    res.status(200).json({
      success: true,
      count: mentors.length,
      mentors,
    });
  } catch (error) {
    console.error("Fetch All Mentors Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
module.exports.testConnection = async (req, res) => {
  try {
    // This asks Cloudinary: "Do you have this file?"
    // If your API Secret is wrong, this will crash with "Invalid Signature" or "Unauthorized"
    const result = await cloudinary.api.resource(
      "resumes/ylrzo9lsrrw2p27luinr",
      {
        resource_type: "image",
      }
    );

    res.json({
      status: "SUCCESS",
      message: "✅ Backend is connected! Keys are perfect.",
      fileDetails: result,
    });
  } catch (error) {
    res.status(500).json({
      status: "FAILED",
      message: "❌ Backend cannot talk to Cloudinary. API Secret is WRONG.",
      error: error.message,
    });
  }
};

// ============ SUBMIT INTERVIEW FEEDBACK ============
module.exports.submitSessionFeedback = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const mentorId = req.user._id; // From auth middleware

    // 1. Get Data from Body
    const {
      overallScore,
      summary,
      metrics, // Object { communication: 8, ... }
      strengths, // Array [ "Good code style", ... ]
      improvements, // Array [ "Speak louder", ... ]
      recommendation, // "Strong Hire", etc.
      privateNotes,
      codeNotes, // Code and notes from the session
    } = req.body;

    // 2. Validation - Minimum 60 words for summary
    if (!summary || summary.trim().split(/\s+/).length < 60) {
      return res.status(400).json({
        message: "Summary must be at least 60 words. Please provide detailed feedback.",
      });
    }

    // 3. Find the Session - Ensure this mentor owns this session
    const session = await Interview.findOne({
      _id: sessionId,
      mentorId: mentorId,
    });

    if (!session) {
      return res
        .status(404)
        .json({ message: "Session not found or unauthorized" });
    }

    // 4. Construct Feedback Object
    const feedbackData = {
      isSubmitted: true,
      submittedAt: new Date(),
      overallScore,
      summary,
      metrics,
      strengths,
      improvements,
      recommendation,
      privateNotes,
      codeNotes,
    };

    // 5. Update the Session
    session.mentorFeedback = feedbackData;
    session.status = "Completed";

    await session.save();

    // 6. (Optional) Send Notification to Student
    // sendEmail(session.studentId, "Your interview feedback is ready!");

    res.status(200).json({
      success: true,
      message: "Feedback submitted successfully",
      feedback: feedbackData,
    });
  } catch (error) {
    console.error("Feedback Submission Error:", error);
    res.status(500).json({ message: "Failed to submit feedback" });
  }
};

// ============ GET SESSIONS PENDING FEEDBACK ============
module.exports.getSessionsPendingFeedback = async (req, res) => {
  try {
    //await connectDB();
    const mentorId = req.user._id;

    // Find interviews that don't have feedback submitted yet
    const sessions = await Interview.find({
      mentorId: mentorId,
      $or: [
        { "mentorReview.isSubmitted": { $ne: true } },
        { mentorReview: { $exists: false } },
      ],
    }).populate("studentId", "name email avatar");

    return res.status(200).json({ success: true, sessions });
  } catch (error) {
    console.error("Fetch Pending Feedback Sessions Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

module.exports.getUploadSignature = async (req, res) => {
  try {
    //await connectDB();
    console.log("signature banane aaya hi");
    const timestamp = Math.round(new Date().getTime() / 1000);

    // THE SECRET SAUCE: type: "authenticated" makes it PRIVATE
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp: timestamp,
        folder: "algoviz_avatars_private", // Separate folder for private pics
        type: "authenticated", // <--- THIS LOCKS THE FILE
      },
      process.env.CLOUDINARY_API_SECRET
    );

    res.status(200).json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
    });
  } catch (error) {
    console.error("Signature Error:", error);
    res.status(500).json({ message: "Could not generate signature" });
  }
};

// 2. UPDATE PROFILE (Save the Private ID)
module.exports.updateProfile = async (req, res) => {
  try {
    const mentorId = req.user._id;
    const {
      displayName,
      headline,
      bio,
      hourlyRate,
      skills,
      payoutMethod,
      upiId,
      upiMobile,
      bankAccountName,
      bankAccountNumber,
      bankIfsc,
      notifications,
      socialLinks,

      // Avatar Data from Frontend
      avatarPublicId,
      avatarUrl,
    } = req.body;

    const updateData = {};

    // Save Avatar Data
    if (avatarPublicId && avatarUrl) {
      updateData.avatar = {
        publicId: avatarPublicId,
        url: avatarUrl,
      };
    }

    if (displayName) updateData.name = displayName;
    if (headline) updateData.headline = headline;
    if (bio) updateData.bio = bio;
    if (hourlyRate) updateData.pricePerSession = Number(hourlyRate);
    if (skills) updateData.expertise = skills;
    if (notifications) updateData.notifications = notifications;
    if (socialLinks) updateData.socialLinks = socialLinks;

    // Payouts
    updateData.payoutSettings = {
      method: payoutMethod || "upi",
      upiId: upiId || "",
      upiMobile: upiMobile || "",
      bankAccountName: bankAccountName || "",
      bankAccountNumber: bankAccountNumber || "",
      bankIfsc: bankIfsc || "",
    };

    await Mentor.findByIdAndUpdate(
      mentorId,
      { $set: updateData },
      { new: true }
    );

    // Return success
    res.status(200).json({ success: true, message: "Profile updated" });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};

// 3. GET PROFILE (Generate Temporary Link)
module.exports.getMentorProfile = async (req, res) => {
  try {
    //await connectDB();
    const mentor = await Mentor.findById(req.user._id); // Or req.params.id
    if (!mentor) return res.status(404).json({ message: "Mentor not found" });

    let signedAvatarUrl = mentor.avatar.url; // Default to stored URL

    // IF Private Image exists, generate a temporary Signed URL (Valid 1 Hour)
    if (mentor.avatar && mentor.avatar.publicId) {
      signedAvatarUrl = cloudinary.url(mentor.avatar.publicId, {
        secure: true,
        sign_url: true, // <--- Generates the token
        type: "authenticated", // <--- matches the upload type
        expires_at: Math.round(new Date().getTime() / 1000) + 3600, // 1 hour expiration
      });
    }

    // Send the temporary URL to the frontend
    const mentorData = mentor.toObject();
    mentorData.avatar.url = signedAvatarUrl;

    res.status(200).json({ success: true, mentor: mentorData });
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports.getMentorProfileById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find Mentor by ID (Exclude sensitive data like password/email/earnings)
    // We assume 'availability' is already in the document or needs to be calculated
    const mentor = await Mentor.findById(id)
      .select("-password -email -earnings -payoutSettings -notifications")
      .lean(); // .lean() converts Mongoose doc to plain JS object

    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    // 2. GENERATE SIGNED URL FOR AVATAR (If it is private)
    // If the avatar has a publicId, we generate a temp link valid for 1 hour
    if (mentor.avatar && mentor.avatar.publicId) {
      mentor.avatar = cloudinary.url(mentor.avatar.publicId, {
        secure: true,
        sign_url: true,
        type: "authenticated", // Matches your upload type
        expires_at: Math.round(new Date().getTime() / 1000) + 3600, // 1 hour validity
      });
    } else if (mentor.avatar && mentor.avatar.url) {
      // Fallback if publicId isn't there but url is
      mentor.avatar = mentor.avatar.url;
    }

    // 3. Filter Past Availability (Optional Clean up)
    // This removes slots from yesterday so the payload is smaller
    if (mentor.availability) {
      const todayStr = new Date().toISOString().split("T")[0];
      mentor.availability = mentor.availability.filter(
        (day) => day.date >= todayStr
      );
    }

    res.status(200).json({
      success: true,
      mentor,
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
