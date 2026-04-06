const Analytics = require("../models/analytics.model");
const connectDB = require("../db/db");
// @desc    Record a visit (Daily Aggregation)
// @route   POST /api/analytics/visit
exports.recordVisit = async (req, res) => {
  try {
    //await connectDB();
    const { path, visitorId, deviceType, referrer } = req.body;
    const today = new Date().toISOString().split("T")[0];

    // Determine Source key (google, direct, etc.)
    let sourceKey = "direct";
    if (referrer) {
      if (referrer.includes("google")) sourceKey = "google";
      else if (referrer.includes("linkedin")) sourceKey = "linkedin";
      else if (referrer.includes("github")) sourceKey = "github";
      else sourceKey = "other";
    }

    // --- REVISED LOGIC START ---

    // 1. Try to find the document for today
    let dailyRecord = await Analytics.findOne({ date: today });

    if (!dailyRecord) {
      try {
        // 2. If not found, try to CREATE it
        dailyRecord = await Analytics.create({ date: today });
      } catch (error) {
        // 3. RACE CONDITION HANDLING
        // If error code is 11000, it means another request just created it.
        // So we ignore the error and fetch that newly created document.
        if (error.code === 11000) {
          dailyRecord = await Analytics.findOne({ date: today });
        } else {
          throw error; // If it's another error, crash properly
        }
      }
    }

    // 4. Now we are GUARANTEED to have a document. Update stats.
    dailyRecord.totalVisits += 1;

    // Device Count
    if (dailyRecord.devices[deviceType] !== undefined) {
      dailyRecord.devices[deviceType] += 1;
    } else {
      dailyRecord.devices.other += 1;
    }

    // Source Count
    if (dailyRecord.sources[sourceKey] !== undefined) {
      dailyRecord.sources[sourceKey] += 1;
    }

    // Page Views Logic
    const pageIndex = dailyRecord.pageViews.findIndex((p) => p.page === path);
    if (pageIndex > -1) {
      dailyRecord.pageViews[pageIndex].count += 1;
    } else {
      dailyRecord.pageViews.push({ page: path, count: 1 });
    }

    // Unique Visitor Logic
    if (!dailyRecord.visitorIPs.includes(visitorId)) {
      dailyRecord.visitorIPs.push(visitorId);
      dailyRecord.uniqueVisitors += 1;
    }

    // 5. Save the updates
    await dailyRecord.save();

    res.status(200).json({ success: true });
    // --- REVISED LOGIC END ---
  } catch (error) {
    console.error("Tracking Error:", error.message);
    // Don't return 500 to frontend, just log it. Tracking shouldn't break the app.
    res.status(200).json({ success: false });
  }
};
