const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema({
  // 1. The Date (Primary Key for the day)
  // We store "2025-12-14" so we can easily find today's record
  date: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },

  // 2. High-Level Stats
  totalVisits: { type: Number, default: 0 }, // Total hits (Page loads)
  uniqueVisitors: { type: Number, default: 0 }, // Distinct people

  // 3. Technical Data (Helps you optimize UI)
  devices: {
    desktop: { type: Number, default: 0 },
    mobile: { type: Number, default: 0 },
    tablet: { type: Number, default: 0 },
    other: { type: Number, default: 0 }, // Bots, smart TVs, etc.
  },

  // 4. Where traffic comes from (Marketing)
  sources: {
    direct: { type: Number, default: 0 }, // Typed URL directly
    google: { type: Number, default: 0 }, // Organic Search
    linkedin: { type: Number, default: 0 }, // Social
    github: { type: Number, default: 0 },
    other: { type: Number, default: 0 },
  },

  // 5. User Behavior (Content Strategy)
  // We store an array of pages to see which is most popular
  // Example: [{ page: "/home", count: 50 }, { page: "/signin", count: 10 }]
  pageViews: [
    {
      page: { type: String },
      count: { type: Number, default: 0 },
    },
  ],

  // 6. Internal Tracking (Privacy)
  // We store IPs temporarily to calculate 'uniqueVisitors'
  // You won't show this in UI, it's just for math.
  visitorIPs: [{ type: String }],
});

module.exports = mongoose.model("Analytics", analyticsSchema);
