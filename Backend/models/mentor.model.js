const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const mentorSchema = new mongoose.Schema(
  {
    // =================================================
    // 1. IDENTITY & LOGIN
    // =================================================
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false }, // "select: false" hides it from queries by default

    avatar: {
      publicId: { type: String, default: null }, // Critical for generating signed links
      url: {
        type: String,
        default:
          "https://icon-library.com/images/default-user-icon/default-user-icon-8.jpg",
      },
    },

    // For SMS Notifications
    phone: { type: String },

    // =================================================
    // 2. PROFILE & BRANDING (Matches "General" & "Expertise" Tabs)
    // =================================================
    headline: { type: String }, // e.g., "Senior Engineer @ Google"
    bio: { type: String }, // e.g., "Passionate about system design..."

    company: { type: String, required: true },
    role: { type: String, required: true },
    yearsExperience: { type: Number, default: 0 },

    expertise: [String], // ["React", "Node.js", "System Design"]
    languages: [String], // ["English", "Hindi"]

    socialLinks: {
      linkedin: String,
      twitter: String,
      github: String,
      portfolio: String,
    },

    // =================================================
    // 3. ECONOMICS (Matches "Expertise & Rate" Tab)
    // =================================================
    pricePerSession: { type: Number, default: 0 }, // The amount student pays
    currency: { type: String, default: "INR" },

    // Real-time Earnings Tracker (Matches Dashboard Stats)
    earnings: {
      total: { type: Number, default: 0 }, // Lifetime earnings
      pending: { type: Number, default: 0 }, // Sessions done, money not yet sent
      available: { type: Number, default: 0 }, // Ready to withdraw
      withdrawn: { type: Number, default: 0 }, // Money sent to bank
    },

    // =================================================
    // 4. PAYOUT SETTINGS (Matches "Payouts" Tab)
    // =================================================
    payoutSettings: {
      method: { type: String, enum: ["upi", "bank"], default: "upi" },

      // UPI Details
      upiId: { type: String },
      upiMobile: { type: String },

      // Bank Details
      bankAccountName: { type: String },
      bankAccountNumber: { type: String }, // Consider encrypting this in production
      bankIfsc: { type: String },

      stripeConnected: { type: Boolean, default: false }, // If using Stripe later
      razorpayAccountId: { type: String }, // If using Razorpay Route
    },

    // =================================================
    // 5. NOTIFICATION PREFERENCES (Matches "Notifications" Tab)
    // =================================================
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false },
    },

    // =================================================
    // 6. AVAILABILITY (The Slots)
    // =================================================
    availability: [
      {
        date: { type: String, required: true }, // Format: "YYYY-MM-DD"
        day: { type: String }, // "Monday", "Tuesday"...
        slots: [
          {
            time: { type: String, required: true }, // "10:00 AM"
            isBooked: { type: Boolean, default: false },
            bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            bookingId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Interview",
            }, // Link to actual booking
          },
        ],
      },
    ],

    // =================================================
    // 7. METRICS & META
    // =================================================
    rating: { type: Number, default: 5.0 },
    reviewCount: { type: Number, default: 0 },
    sessionCount: { type: Number, default: 0 }, // Total sessions conducted

    isVerified: { type: Boolean, default: false }, // Admin verification
    isActive: { type: Boolean, default: true }, // Toggle to hide profile
  },
  { timestamps: true }
);

// ----------------------------------------------------
// METHODS & HOOKS
// ----------------------------------------------------

// 1. Match Password
mentorSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// 2. Encrypt Password before saving
mentorSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Mentor", mentorSchema);
