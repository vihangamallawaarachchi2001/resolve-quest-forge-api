import express from 'express';
import Chat from '../models/Chat.js';
import Ticket from '../models/Ticket.js';
import User from '../models/User.js';

const router = express.Router();

// GET CHAT FOR A TICKET (or create if doesn't exist)
router.get('/chats/ticket/:ticketId', async (req, res) => {
  try {
    const { ticketId } = req.params;

    // Validate ticket exists
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Find or create chat for this ticket
    let chat = await Chat.findOne({ ticketId });

    if (!chat) {
      // Create new chat for this ticket
      chat = new Chat({
        ticketId: ticket._id,
        messages: []
      });
      await chat.save();
    }

    // Format response - handle MongoDB $oid format
    const formattedMessages = chat.messages.map(msg => ({
      _id: msg._id.toString(),
      senderId: msg.senderId.toString(),
      senderName: msg.senderName,
      senderRole: msg.senderRole,
      message: msg.message,
      timestamp: msg.timestamp.toISOString()
    }));

    res.json({
      chatId: chat._id.toString(),
      ticketId: chat.ticketId.toString(),
      messages: formattedMessages,
      lastUpdated: chat.lastUpdated.toISOString(),
      createdAt: chat.createdAt.toISOString(),
      updatedAt: chat.updatedAt.toISOString()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// SEND MESSAGE TO CHAT (POST)
router.post('/chats/ticket/:ticketId/message', async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { senderId, senderName, senderRole, message } = req.body;

    // Validate required fields
    if (!senderId || !senderName || !senderRole || !message) {
      return res.status(400).json({
        message: 'senderId, senderName, senderRole, and message are required'
      });
    }

    // Validate sender role
    const validRoles = ['customer', 'agent', 'admin'];
    if (!validRoles.includes(senderRole)) {
      return res.status(400).json({
        message: `senderRole must be one of: ${validRoles.join(', ')}`
      });
    }

    // Validate ticket exists
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Find or create chat
    let chat = await Chat.findOne({ ticketId });

    if (!chat) {
      chat = new Chat({
        ticketId: ticket._id,
        messages: []
      });
    }

    // Add new message
    chat.messages.push({
      senderId,
      senderName,
      senderRole,
      message: message.trim(),
      timestamp: new Date()
    });

    // Update last updated
    chat.lastUpdated = new Date();

    await chat.save();

    // Return just the new message for UI update
    const newMessage = chat.messages[chat.messages.length - 1];

    res.status(201).json({
      message: 'Message sent successfully',
      messageId: chat._id.toString(),
      message: {
        _id: newMessage._id.toString(),
        senderId: newMessage.senderId.toString(),
        senderName: newMessage.senderName,
        senderRole: newMessage.senderRole,
        message: newMessage.message,
        timestamp: newMessage.timestamp.toISOString()
      },
      chatId: chat._id.toString(),
      ticketId: chat.ticketId.toString()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET NEW MESSAGES SINCE LAST POLL (for polling mechanism)
router.get('/chats/ticket/:ticketId/new-messages', async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { lastSeenTimestamp } = req.query; // Client sends their last seen time

    // Validate ticket exists
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Find chat
    const chat = await Chat.findOne({ ticketId });
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found for this ticket' });
    }

    // Parse last seen timestamp
    let sinceDate = null;
    if (lastSeenTimestamp) {
      sinceDate = new Date(lastSeenTimestamp);
      if (isNaN(sinceDate.getTime())) {
        return res.status(400).json({ message: 'Invalid lastSeenTimestamp format' });
      }
    }

    // Get new messages
    let newMessages = [];
    if (sinceDate) {
      newMessages = chat.messages.filter(msg => msg.timestamp > sinceDate);
    } else {
      // If no timestamp provided, return all messages (initial load)
      newMessages = [...chat.messages];
    }

    // Format messages
    const formattedMessages = newMessages.map(msg => ({
      _id: msg._id.toString(),
      senderId: msg.senderId.toString(),
      senderName: msg.senderName,
      senderRole: msg.senderRole,
      message: msg.message,
      timestamp: msg.timestamp.toISOString()
    }));

    res.json({
      chatId: chat._id.toString(),
      ticketId: chat.ticketId.toString(),
      newMessages: formattedMessages,
      totalNew: newMessages.length,
      lastUpdated: chat.lastUpdated.toISOString()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET ALL MESSAGES FOR CHAT (alternative to above, for full history)
router.get('/chats/:chatId/messages', async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    const formattedMessages = chat.messages.map(msg => ({
      _id: msg._id.toString(),
      senderId: msg.senderId.toString(),
      senderName: msg.senderName,
      senderRole: msg.senderRole,
      message: msg.message,
      timestamp: msg.timestamp.toISOString()
    }));

    res.json({
      chatId: chat._id.toString(),
      ticketId: chat.ticketId.toString(),
      messages: formattedMessages,
      lastUpdated: chat.lastUpdated.toISOString(),
      createdAt: chat.createdAt.toISOString(),
      updatedAt: chat.updatedAt.toISOString()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// EDIT MESSAGE IN CHAT (PUT)
router.put('/chats/ticket/:ticketId/message/:messageId', async (req, res) => {
  try {
    const { ticketId, messageId } = req.params;
    const { message, userId } = req.body;

    // Validate required fields
    if (!message) {
      return res.status(400).json({
        message: 'Message content is required'
      });
    }

    // Validate ticket exists
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Find chat and message
    const chat = await Chat.findOne({ ticketId });
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found for this ticket' });
    }

    // Find message index
    const messageIndex = chat.messages.findIndex(msg => msg._id.toString() === messageId);
    if (messageIndex === -1) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is authorized to edit (must be the sender)
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Verify the user is the sender
    if (chat.messages[messageIndex].senderId.toString() !== userId) {
      return res.status(403).json({ message: 'You can only edit your own messages' });
    }

    // Update message
    chat.messages[messageIndex].message = message.trim();
    chat.messages[messageIndex].edited = true;
    chat.messages[messageIndex].editedAt = new Date();

    // Update last updated
    chat.lastUpdated = new Date();

    await chat.save();

    res.json({
      message: 'Message updated successfully',
      updatedMessage: {
        _id: chat.messages[messageIndex]._id.toString(),
        senderId: chat.messages[messageIndex].senderId.toString(),
        senderName: chat.messages[messageIndex].senderName,
        senderRole: chat.messages[messageIndex].senderRole,
        message: chat.messages[messageIndex].message,
        timestamp: chat.messages[messageIndex].timestamp.toISOString(),
        edited: chat.messages[messageIndex].edited
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE MESSAGE FROM CHAT (DELETE)
router.delete('/chats/ticket/:ticketId/message/:messageId/:userId', async (req, res) => {
  try {
    const { ticketId, messageId, userId } = req.params;

    // Validate ticket exists
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Find chat and message
    const chat = await Chat.findOne({ ticketId });
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found for this ticket' });
    }

    // Find message index
    const messageIndex = chat.messages.findIndex(msg => msg._id.toString() === messageId);
    if (messageIndex === -1) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is authorized to delete (must be the sender)
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Verify the user is the sender
    if (chat.messages[messageIndex].senderId.toString() !== userId) {
      return res.status(403).json({ message: 'You can only delete your own messages' });
    }

    // Remove message
    chat.messages.splice(messageIndex, 1);

    // Update last updated
    chat.lastUpdated = new Date();

    await chat.save();

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;