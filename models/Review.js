// models/Review.js

import mongoose from "mongoose";


const reviewSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  ticketId: String,
  description: {
    type: String,
    required: true,
    trim: true
  },
  ticketTitle: {
    type: String,
    required: true,
    trim: true
  },
  ratingNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt
});

// Index for search optimization
reviewSchema.index({ username: 1, ticketTitle: 1, ratingNumber: 1 });

export default mongoose.model('Review', reviewSchema);