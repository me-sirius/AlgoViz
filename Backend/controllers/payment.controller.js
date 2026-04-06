const Razorpay = require("razorpay");
const crypto = require("crypto");
const mongoose = require("mongoose");
const Interview = require("../models/interview.model");
const Mentor = require("../models/mentor.model");
// Import your Models and Constants
const User = require("../models/user.model"); // Adjust path to your User model
const Transaction = require("../models/transaction.model"); // Adjust path to your Transaction model
const { SUBSCRIPTION_PLANS } = require("../utils/constants"); // Adjust path to constants file
const connectDB = require("../db/db");
// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports.createOrder = async (req, res) => {
  //await connectDB();
  try {
    // 1. Extract data from request body
    // "id" here corresponds to the planId (e.g., "standard", "premium")
    const { planId: planId, userId, details } = req.body;

    // 2. Find the User
    const user = req.user;
    if (!user) {
      console.log("User not found with ID:", userId); // Debug log
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // 3. Check if user already has an active premium plan
    // ADJUST THIS: Change 'isPremium' to whatever field you use (e.g., 'subscriptionStatus' === 'active')
    if (user.isPremium) {
      console.log("User already has an active subscription:", userId); // Debug log
      return res.status(400).json({
        success: false,
        message: "You already have an active subscription plan.",
      });
    }

    // 4. Find the Plan details from your CONSTANTS
    // We search through the values of SUBSCRIPTION_PLANS to match the 'id' sent from frontend
    const selectedPlan = Object.values(SUBSCRIPTION_PLANS).find(
      (plan) => plan.id === planId
    );

    if (!selectedPlan) {
      console.log("Invalid Plan ID received:", planId); // Debug log
      return res
        .status(400)
        .json({ success: false, message: "Invalid Plan ID" });
    }

    // 5. Check if the plan is FREE (No payment needed)
    if (selectedPlan.price === 0) {
      // Handle free plan logic directly here (update user immediately)
      console.log("User attempting to subscribe to free plan:", userId); // Debug log
      return res.json({
        success: false,
        message: "You already have a free plan.",
      });
    }

    // 6. Create Razorpay Order
    // We use the price from the CONSTANT, not from the frontend (Security)
    const options = {
      amount: selectedPlan.price * 100, // Convert Rupees to Paise
      currency: "INR",
      receipt: `receipt_${Date.now()}_${userId.slice(-4)}`, // Short unique receipt ID
      notes: {
        userName: user.name,
        planId: planId,
        ...details, // Add any extra details passed in body
      },
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      console.log("Razorpay order creation failed for user:", userId); // Debug log
      return res
        .status(500)
        .json({ success: false, message: "Razorpay Error" });
    }

    // 7. Create a PENDING Transaction in your Database
    // This allows you to track attempted payments even if they fail later
    const newTransaction = new Transaction({
      userId: userId,
      amount: selectedPlan.price,
      currency: "INR",
      type: "DEBIT",
      category: "PREMIUM_SUBSCRIPTION",
      description: `Subscription for ${selectedPlan.name}`,
      status: "PENDING",
      paymentId: null, // Will be filled after verification
      relatedEntityId: null, // Optional: Link to a specific subscription doc if you have one
      // You might want to store the Razorpay Order ID to link them later
      // Make sure your schema has a field for this, or put it in 'description' or 'paymentId' temporarily
      razorpayOrderId: order.id,
    });

    await newTransaction.save();

    // 8. Send Response to Frontend
    console.log("Razorpay order created successfully for user:", userId); // Debug log
    return res.status(200).json({
      success: true,
      order, // Contains order_id, amount, currency
      transactionId: newTransaction._id, // Send this so frontend can send it back during verification
      key_id: process.env.RAZORPAY_KEY_ID, // Useful to send key if frontend doesn't have it
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating the order.",
      error: error.message,
    });
  }
};

module.exports.verifyPayment = async (req, res) => {
  try {
    //await connectDB();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
      transactionId, // We passed this to frontend in step 1, now getting it back
      id: planId, // The plan user was trying to buy
    } = req.body;

    // 1. Create the expected signature
    // Formula: HMAC_SHA256(order_id + "|" + payment_id, secret)
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    // 2. Compare Signatures
    const isAuthentic = expectedSignature === razorpay_signature;
    console.log(
      "Payment verification for transaction",
      transactionId,
      "isAuthentic:",
      isAuthentic
    ); // Debug log

    if (isAuthentic) {
      // --- SUCCESS FLOW ---

      // A. Update the Transaction status to SUCCESS
      const transaction = await Transaction.findByIdAndUpdate(
        transactionId,
        {
          status: "SUCCESS",
          paymentId: razorpay_payment_id,
        },
        { new: true }
      );

      // B. Find the plan details again to calculate expiry (optional)
      const selectedPlan = Object.values(SUBSCRIPTION_PLANS).find(
        (p) => p.id === planId
      );

      // C. Update the User's Subscription Status
      // ADJUST THIS: Update 'planExpiry', 'currentPlan', etc. based on your User Schema
      await User.findByIdAndUpdate(userId, {
        isPremium: true,
        // planId: selectedPlan.id, // e.g., "standard"
        // planName: selectedPlan.name, // e.g., "Coder"
        // Example: Set expiry to 30 days from now
        premiumExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
      console.log("User subscription updated to premium for user:", userId); // Debug log
      return res.status(200).json({
        success: true,
        message: "Payment verified successfully. Subscription activated.",
      });
    } else {
      // --- FAILURE FLOW ---

      // A. Mark transaction as FAILED
      console.log(
        "Payment verification failed for transaction:",
        transactionId
      ); // Debug log
      await Transaction.findByIdAndUpdate(transactionId, {
        status: "FAILED",
      });

      return res.status(400).json({
        success: false,
        message: "Payment verification failed. Invalid signature.",
      });
    }
  } catch (error) {
    console.error("Verify Payment Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error during verification",
      error: error.message,
    });
  }
};

module.exports.allTransaction = async (req, res) => {
  try {
    //await connectDB();
    // 1. Get the User ID from the URL parameters
    // Matches route: /payment/history/:userId
    const { userId } = req.params;
    console.log("transaction fetch krne aaye hai : ", userId);
    // 2. Fetch transactions for this specific user
    // .sort({ createdAt: -1 }) puts the newest transactions at the top
    const transactions = await Transaction.find({ userId: userId }).sort({
      createdAt: -1,
    });

    // 3. Return success response
    return res.status(200).json({
      success: true,
      count: transactions.length,
      transactions: transactions,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error: Could not fetch transaction history.",
    });
  }
};

// ===============================================================
// INTERVIEW PAYMENT ENDPOINTS
// ===============================================================

// Create Razorpay Order for Interview Booking
module.exports.createInterviewOrder = async (req, res) => {
  console.log("💳 [CREATE ORDER] Function called");
  try {
    //await connectDB();
    const userId = req.user._id;
    const { interviewId } = req.body;

    console.log("📝 [CREATE ORDER] User ID:", userId.toString());
    console.log("📝 [CREATE ORDER] Interview ID:", interviewId);

    if (!interviewId) {
      console.log("❌ [CREATE ORDER] Missing interviewId");
      return res.status(400).json({
        success: false,
        message: "Interview ID is required",
      });
    }
    // Find the interview
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      console.log("❌ [CREATE ORDER] Interview not found");
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    console.log("📊 [CREATE ORDER] Interview status:", interview.status);

    // Verify interview belongs to user
    if (interview.studentId.toString() !== userId.toString()) {
      console.log("❌ [CREATE ORDER] Interview doesn't belong to user");
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Verify interview is in PENDING_PAYMENT status
    if (interview.status !== "PENDING_PAYMENT") {
      console.log("❌ [CREATE ORDER] Interview not in PENDING_PAYMENT status");
      return res.status(400).json({
        success: false,
        message: "Interview must be in pending payment status",
      });
    }

    // Check if expired
    if (
      interview.paymentExpiryTime &&
      new Date() > interview.paymentExpiryTime
    ) {
      console.log("❌ [CREATE ORDER] Interview payment has expired");
      return res.status(400).json({
        success: false,
        message: "Payment window has expired. Please book again.",
      });
    }

    console.log(
      "💰 [CREATE ORDER] Creating Razorpay order for amount:",
      interview.amount
    );

    // Create Razorpay Order
    const options = {
      amount: interview.amount * 100, // Convert to paise
      currency: "INR",
      receipt: `interview_${Date.now()}_${userId.toString().slice(-4)}`,
      notes: {
        userId: userId.toString(),
        interviewId: interviewId,
        mentorId: interview.mentorId.toString(),
        date: interview.date,
        timeSlot: interview.timeSlot,
      },
    };
    const order = await razorpay.orders.create(options);
    if (!order) {
      console.log("❌ [CREATE ORDER] Razorpay order creation failed");
      return res.status(500).json({
        success: false,
        message: "Failed to create payment order",
      });
    }

    console.log("✅ [CREATE ORDER] Razorpay order created:", order.id);

    // Update transaction with order ID
    await Transaction.findByIdAndUpdate(interview.transactionId, {
      razorpayOrderId: order.id,
    });

    console.log("✅ [CREATE ORDER] Transaction updated with order ID");
    console.log("🎉 [CREATE ORDER] Order creation successful!");

    return res.status(200).json({
      success: true,
      order,
      transactionId: interview.transactionId,
      key_id: process.env.RAZORPAY_KEY_ID,
      interviewId: interview._id,
    });
  } catch (error) {
    console.error("❌ [CREATE ORDER] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create payment order",
      error: error.message,
    });
  }
};

// Verify Interview Payment and Complete Booking
module.exports.verifyInterviewPayment = async (req, res) => {
  console.log("✅ [VERIFY PAYMENT] Function called");
  try {
    //await connectDB();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      transactionId,
      interviewId,
    } = req.body;

    const userId = req.user._id;

    console.log("📝 [VERIFY PAYMENT] Request data:", {
      userId: userId.toString(),
      razorpay_order_id,
      razorpay_payment_id,
      transactionId,
      interviewId,
    });

    // Verify signature
    console.log("🔐 [VERIFY PAYMENT] Verifying signature...");
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;
    console.log("🔍 [VERIFY PAYMENT] Signature valid:", isAuthentic);

    if (!isAuthentic) {
      console.log("❌ [VERIFY PAYMENT] Invalid signature!");
      // Update transaction to FAILED
      await Transaction.findByIdAndUpdate(transactionId, {
        status: "FAILED",
      });

      return res.status(400).json({
        success: false,
        message: "Payment verification failed. Invalid signature.",
      });
    }

    console.log("✅ [VERIFY PAYMENT] Signature verified successfully!");

    // Find the interview
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      console.log("❌ [VERIFY PAYMENT] Interview not found");
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    console.log(
      "📊 [VERIFY PAYMENT] Current interview status:",
      interview.status
    );

    // Verify it's in PENDING_PAYMENT status
    if (interview.status !== "PENDING_PAYMENT") {
      console.log(
        "⚠️ [VERIFY PAYMENT] Interview not in PENDING_PAYMENT status"
      );
      return res.status(400).json({
        success: false,
        message: "Interview is not in pending payment status",
      });
    }

    console.log(
      "🔄 [VERIFY PAYMENT] Updating interview to SCHEDULED status..."
    );

    // Update interview status to SCHEDULED
    interview.status = "Scheduled";
    interview.paymentExpiryTime = null; // Clear expiry time
    await interview.save();
    console.log("✅ [VERIFY PAYMENT] Interview status updated to SCHEDULED");
    // Increment mentor session count
    await Mentor.updateOne(
      { _id: interview.mentorId },
      { $inc: { sessionCount: 1 } }
    );
    console.log("✅ [VERIFY PAYMENT] Mentor session count incremented");
    // Update transaction to SUCCESS
    await Transaction.findByIdAndUpdate(transactionId, {
      status: "SUCCESS",
      paymentId: razorpay_payment_id,
    });
    console.log("✅ [VERIFY PAYMENT] Transaction marked as SUCCESS");
    // Add interview to student's upcoming interviews
    await User.findByIdAndUpdate(userId, {
      $push: { upcomingInterviews: interview._id },
    });
    console.log("✅ [VERIFY PAYMENT] Added to student's upcoming interviews");
    // Send confirmation emails
    const student = await User.findById(userId);
    const mentor = await Mentor.findById(interview.mentorId);

    if (student && mentor) {
      console.log("📧 [VERIFY PAYMENT] Sending confirmation emails...");
      const { sendBookingEmails } = require("../utils/emailService");
      const dateString = new Date(interview.date).toISOString().split("T")[0];

      sendBookingEmails(student, mentor, {
        date: dateString,
        time: interview.timeSlot,
        topic: interview.topic,
        resumeUrl: interview.resume?.url,
      }).catch((err) => console.error("Email sending failed:", err));
    }
    console.log("🎉 [VERIFY PAYMENT] Payment verification successful!");
    return res.status(200).json({
      success: true,
      message: "Payment verified and interview booked successfully!",
      bookingId: interview._id,
    });
  } catch (error) {
    console.error("❌ [VERIFY PAYMENT] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message,
    });
  }
};
