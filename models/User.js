// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
    trim: true
  },
  password:String,
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  bio: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['admin', 'agent', 'customer'],
    default: 'customer'
  },
  avatarUrl: {
    type: String,
    default: ''
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

export default mongoose.model('User', userSchema);