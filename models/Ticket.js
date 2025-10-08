
import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    required: true,
    lowercase: true
  },
  userEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  userName: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedAgentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedAgentName: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['open', 'inprogress', 'resolved', 'closed'],
    default: 'open',
    lowercase: true
  }
}, {
  timestamps: true 
});

// Index performance
ticketSchema.index({ status: 1, priority: 1, userId: 1, assignedAgentId: 1 });

export default mongoose.model('Ticket', ticketSchema);