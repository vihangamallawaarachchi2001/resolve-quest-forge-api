
import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true,
    index: true 
  },
  messages: [
    {
      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      senderName: {
        type: String,
        required: true,
        trim: true
      },
      senderRole: {
        type: String,
        enum: ['customer', 'agent', 'admin'],
        required: true
      },
      message: {
        type: String,
        required: true,
        trim: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }
  ],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index performance
chatSchema.index({ ticketId: 1 });
chatSchema.index({ lastUpdated: -1 });

export default mongoose.model('Chat', chatSchema);