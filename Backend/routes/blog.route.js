const express = require("express");
const router = express.Router();
const {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  likeBlog,
  incrementViews,
  addComment,
  deleteComment,
} = require("../controllers/blog.controller");

router.get("/", getAllBlogs);
router.get("/:id", getBlogById);
router.post("/create", createBlog);
router.put("/:id", updateBlog);
router.delete("/:id", deleteBlog);
router.put("/:id/like", likeBlog);
router.put("/:id/views", incrementViews);
router.post("/:id/comments", addComment);
router.delete("/:id/comments/:commentId", deleteComment);

module.exports = router;
