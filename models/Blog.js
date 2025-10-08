
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
    type: String,
    default: '',
    trim: true
  },
  imageUrl: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index  optimization
blogSchema.index({ title: 'text', excerpt: 'text', content: 'text', category: 1, tags: 1 });

export default mongoose.model('Blog', blogSchema);