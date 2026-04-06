const mongoose = require("mongoose");

const uploadSchema = new mongoose.Schema(
    {
        url: {
            type: String,
            required: true,
        },
        publicId: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            default: "Untitled",
        },
        folder: {
            type: String,
            default: "general",
            enum: ["general", "questions", "blogs", "avatars", "misc", "resumes", "mcq-questions", "mcq-images"],
        },
        fileType: {
            type: String,
            default: "image",
        },
        size: {
            type: Number,
            default: 0,
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Upload", uploadSchema);
