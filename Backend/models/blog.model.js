const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    content: {
      type: String,
      required: true,
    },
    excerpt: {
      type: String,
      maxlength: 300,
    },
    coverImage: {
      type: String,
      default: null,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    publishedAt: {
      type: Date,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        text: {
          type: String,
          required: true,
          maxlength: 500,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    readTime: {
      type: Number, // in minutes
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);
// Virtual for like count
blogSchema.virtual("likeCount").get(function () {
  return this.likes.length;
});

// Virtual for comment count
blogSchema.virtual("commentCount").get(function () {
  return this.comments.length;
});

// Method to increment views
blogSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save();
};

// Method to toggle like
blogSchema.methods.toggleLike = function (userId) {
  const likeIndex = this.likes.indexOf(userId);

  if (likeIndex === -1) {
    this.likes.push(userId);
  } else {
    this.likes.splice(likeIndex, 1);
  }

  return this.save();
};

// Method to add comment
blogSchema.methods.addComment = function (userId, text) {
  this.comments.push({
    user: userId,
    text: text,
    createdAt: new Date(),
  });
  return this.save();
};

// Method to delete comment
blogSchema.methods.deleteComment = function (commentId) {
  this.comments = this.comments.filter(
    (comment) => comment._id.toString() !== commentId.toString()
  );
  return this.save();
};

// Static method to get blogs by author
blogSchema.statics.getByAuthor = function (authorId, isPublished = true) {
  return this.find({ author: authorId, isPublished })
    .populate("author", "name email avatar")
    .sort({ createdAt: -1 });
};

// Static method to get popular blogs
blogSchema.statics.getPopular = function (limit = 10) {
  return this.find({ isPublished: true })
    .populate("author", "name email avatar")
    .sort({ views: -1, likes: -1 })
    .limit(limit);
};

// Static method to get recent blogs
blogSchema.statics.getRecent = function (limit = 10) {
  return this.find({ isPublished: true })
    .populate("author", "name email avatar")
    .sort({ publishedAt: -1 })
    .limit(limit);
};

// Index for better query performance
blogSchema.index({ slug: 1 });
blogSchema.index({ author: 1 });
blogSchema.index({ isPublished: 1, publishedAt: -1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ category: 1 });

const Blog = mongoose.model("Blog", blogSchema);
module.exports = Blog;
