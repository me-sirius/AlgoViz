const express = require("express");
const router = express.Router();
const { getAllBlogs, createBlog } = require("../controllers/blog.controller");
router.get("/", getAllBlogs);
router.post("/create", createBlog);
module.exports = router;
