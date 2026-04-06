const Blog = require("../models/blog.model");

// Get all blogs with author populated
module.exports.getAllBlogs = async (req, res) => {
  try {
    const { tag, search, page = 1, limit = 12 } = req.query;
    const filter = {};

    if (tag) {
      filter.tags = { $regex: tag, $options: "i" };
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Blog.countDocuments(filter);

    const blogs = await Blog.find(filter)
      .populate("author", "name avatar college")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      blogs,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ success: false, message: "Error fetching blogs" });
  }
};

// Get single blog by ID
module.exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate("author", "name avatar college")
      .populate("comments.user", "name avatar");

    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    res.status(200).json({ success: true, blog });
  } catch (error) {
    console.error("Error fetching blog:", error);
    res.status(500).json({ success: false, message: "Error fetching blog" });
  }
};

// Create blog
module.exports.createBlog = async (req, res) => {
  try {
    const { title, content, author, tags, excerpt } = req.body;

    if (!title || !title.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Title is required" });
    }
    if (!content || !content.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Content is required" });
    }

    // Calculate reading time
    const words = content.trim().split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(words / 200));

    const newBlog = new Blog({
      title: title.trim(),
      content,
      author,
      tags: tags || [],
      excerpt: excerpt || content.substring(0, 200),
      readTime,
      publishedAt: new Date(),
    });

    await newBlog.save();

    const populated = await Blog.findById(newBlog._id).populate(
      "author",
      "name avatar college",
    );

    res.status(201).json({ success: true, blog: populated });
  } catch (error) {
    console.error("Error creating blog:", error);
    res.status(500).json({ success: false, message: "Error creating blog" });
  }
};

// Update blog
module.exports.updateBlog = async (req, res) => {
  try {
    const { title, content, tags, excerpt } = req.body;

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    if (title) blog.title = title.trim();
    if (content) {
      blog.content = content;
      blog.readTime = Math.max(
        1,
        Math.ceil(content.trim().split(/\s+/).length / 200),
      );
    }
    if (tags) blog.tags = tags;
    if (excerpt) blog.excerpt = excerpt;

    await blog.save();

    const populated = await Blog.findById(blog._id).populate(
      "author",
      "name avatar college",
    );

    res.status(200).json({ success: true, blog: populated });
  } catch (error) {
    console.error("Error updating blog:", error);
    res.status(500).json({ success: false, message: "Error updating blog" });
  }
};

// Delete blog
module.exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    await Blog.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Blog deleted" });
  } catch (error) {
    console.error("Error deleting blog:", error);
    res.status(500).json({ success: false, message: "Error deleting blog" });
  }
};

// Toggle like on blog
module.exports.likeBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    const userId = req.body.userId;
    const index = blog.likes.indexOf(userId);

    if (index === -1) {
      blog.likes.push(userId);
    } else {
      blog.likes.splice(index, 1);
    }

    await blog.save();
    res.status(200).json({
      success: true,
      isLiked: index === -1,
      likeCount: blog.likes.length,
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ success: false, message: "Error toggling like" });
  }
};

// Increment views
module.exports.incrementViews = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true },
    );
    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }
    res.status(200).json({ success: true, views: blog.views });
  } catch (error) {
    console.error("Error incrementing views:", error);
    res
      .status(500)
      .json({ success: false, message: "Error incrementing views" });
  }
};

// Add comment
module.exports.addComment = async (req, res) => {
  try {
    const { userId, text } = req.body;
    if (!text || !text.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Comment text is required" });
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    blog.comments.push({ user: userId, text: text.trim() });
    await blog.save();

    const updated = await Blog.findById(blog._id).populate(
      "comments.user",
      "name avatar",
    );

    res.status(201).json({ success: true, comments: updated.comments });
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ success: false, message: "Error adding comment" });
  }
};

// Delete comment
module.exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    blog.comments = blog.comments.filter((c) => c._id.toString() !== commentId);
    await blog.save();

    res.status(200).json({ success: true, message: "Comment deleted" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ success: false, message: "Error deleting comment" });
  }
};
