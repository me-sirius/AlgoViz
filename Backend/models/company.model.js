const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Google"
  description: { type: String }, // e.g., "Frequently asked in CDC Internships"
  icon: { type: String }, // e.g., "G" or an SVG path
  color: { type: String }, // CSS Gradient for the UI card
  order: { type: Number, default: 0 },
  questions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
    },
  ],
});

module.exports = mongoose.model("Company", companySchema);
