const cloudinary = require("../utils/cloudinary");
const Upload = require("../models/upload.model");

// Upload image to Cloudinary
module.exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const { folder = "general", name } = req.body;
        const userId = req.user?._id;

        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: `codemaze/${folder}`,
                    resource_type: "auto",
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(req.file.buffer);
        });

        // Save to database
        const upload = await Upload.create({
            url: result.secure_url,
            publicId: result.public_id,
            name: name || req.file.originalname || "Untitled",
            folder,
            fileType: result.resource_type,
            size: result.bytes,
            uploadedBy: userId,
        });

        res.status(201).json({
            success: true,
            message: "Upload successful",
            data: upload,
        });
    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ message: "Upload failed", error: error.message });
    }
};

// Get all uploads (with pagination)
module.exports.getAllUploads = async (req, res) => {
    try {
        const { page = 1, limit = 20, folder } = req.query;

        const query = {};
        if (folder && folder !== "all") {
            query.folder = folder;
        }

        const uploads = await Upload.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate("uploadedBy", "name email");

        const total = await Upload.countDocuments(query);

        res.status(200).json({
            success: true,
            data: uploads,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Get Uploads Error:", error);
        res.status(500).json({ message: "Failed to fetch uploads" });
    }
};

// Delete upload
module.exports.deleteUpload = async (req, res) => {
    try {
        const { id } = req.params;

        const upload = await Upload.findById(id);
        if (!upload) {
            return res.status(404).json({ message: "Upload not found" });
        }

        // Delete from Cloudinary
        await cloudinary.uploader.destroy(upload.publicId);

        // Delete from database
        await Upload.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Upload deleted successfully",
        });
    } catch (error) {
        console.error("Delete Upload Error:", error);
        res.status(500).json({ message: "Failed to delete upload" });
    }
};

// Sync Cloudinary resources to MongoDB
module.exports.syncCloudinary = async (req, res) => {
    try {
        const userId = req.user?._id;
        let nextCursor = null;
        let syncedCount = 0;
        let totalChecked = 0;

        do {
            const result = await cloudinary.api.resources({
                type: "upload",
                prefix: "codemaze/", // Only fetch files from codemaze folder
                max_results: 500,
                next_cursor: nextCursor,
            });

            const resources = result.resources;
            totalChecked += resources.length;

            for (const resource of resources) {
                // Check if already exists in DB
                const exists = await Upload.findOne({ publicId: resource.public_id });
                if (!exists) {
                    // Extract folder from public_id (e.g., "codemaze/mcq-images/xyz" -> "mcq-images")
                    const parts = resource.public_id.split("/");
                    let folder = "general";
                    if (parts.length > 1) {
                         // parts[0] is codemaze, parts[1] is subfolder
                         // If existing structure is codemaze/folder/id
                        folder = parts.length > 2 ? parts[1] : "general";
                    }

                    // Validate folder against enum
                    const allowedFolders = ["general", "questions", "blogs", "avatars", "misc", "resumes", "mcq-questions", "mcq-images"];
                    if (!allowedFolders.includes(folder)) {
                        folder = "misc"; // Fallback
                    }

                    await Upload.create({
                        url: resource.secure_url,
                        publicId: resource.public_id,
                        name: parts[parts.length - 1] || "Synced Image", // Use filename
                        folder: folder,
                        fileType: resource.resource_type,
                        size: resource.bytes,
                        uploadedBy: userId, // Associate with admin who ran sync
                    });
                    syncedCount++;
                }
            }

            nextCursor = result.next_cursor;
        } while (nextCursor);

        res.status(200).json({
            success: true,
            message: `Sync complete. ${syncedCount} new images added.`,
            data: { syncedCount, totalChecked },
        });

    } catch (error) {
        console.error("Sync Cloudinary Error:", error);
        res.status(500).json({ message: "Sync failed", error: error.message });
    }
};
