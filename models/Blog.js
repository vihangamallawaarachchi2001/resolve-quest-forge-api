// models/Blog.js

import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  authorName: String,
  excerpt: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  tags: {
    type: String, // Comma-separated string as requested
    default: '',
    trim: true
  },
  imageUrl: {
    type: String,
    default: ''
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Index for search optimization
blogSchema.index({ title: 'text', excerpt: 'text', content: 'text', category: 1, tags: 1 });

export default mongoose.model('Blog', blogSchema);