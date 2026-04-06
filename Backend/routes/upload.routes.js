const express = require("express");
const router = express.Router();
const multer = require("multer");
const { adminAuth } = require("../middlewares/adminAuth");
const uploadController = require("../controllers/upload.controller");

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept images only
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed!"), false);
        }
    },
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
                success: false,
                message: "File is too large! Maximum size is 5MB.",
                errorCode: "FILE_TOO_LARGE"
            });
        }
        return res.status(400).json({
            success: false,
            message: err.message,
            errorCode: err.code
        });
    } else if (err) {
        return res.status(400).json({
            success: false,
            message: err.message || "Upload failed",
            errorCode: "UPLOAD_ERROR"
        });
    }
    next();
};

// Routes (admin protected)
router.post("/upload", adminAuth, upload.single("file"), handleMulterError, uploadController.uploadImage);
router.post("/sync", adminAuth, uploadController.syncCloudinary);
router.get("/uploads", adminAuth, uploadController.getAllUploads);
router.delete("/upload/:id", adminAuth, uploadController.deleteUpload);

module.exports = router;
