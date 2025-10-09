import express from 'express';
import Chat from '../models/Chat.js';
import Ticket from '../models/Ticket.js';
import User from '../models/User.js';

const router = express.Router();

// GET CHAT FOR A TICKET
router.get('/chats/ticket/:ticketId', async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    let chat = await Chat.findOne({ ticketId });

    if (!chat) {
      chat = new Chat({
        ticketId: ticket._id,
        messages: []
      });
      await chat.save();
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

// SEND MESSAGE TO CHAT (POST)
router.post('/chats/ticket/:ticketId/message', async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { senderId, senderName, senderRole, message } = req.body;

    if (!senderId || !senderName || !senderRole || !message) {
      return res.status(400).json({
        message: 'senderId, senderName, senderRole, and message are required'
      });
    }

    const validRoles = ['customer', 'agent', 'admin'];
    if (!validRoles.includes(senderRole)) {
      return res.status(400).json({
        message: `senderRole must be one of: ${validRoles.join(', ')}`
      });
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    let chat = await Chat.findOne({ ticketId });

    if (!chat) {
      chat = new Chat({
        ticketId: ticket._id,
        messages: []
      });
    }

    chat.messages.push({
      senderId,
      senderName,
      senderRole,
      message: message.trim(),
      timestamp: new Date()
    });

    chat.lastUpdated = new Date();

    await chat.save();

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

// GET NEW MESSAGES SINCE LAST POLL
router.get('/chats/ticket/:ticketId/new-messages', async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { lastSeenTimestamp } = req.query;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const chat = await Chat.findOne({ ticketId });
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found for this ticket' });
    }

    let sinceDate = null;
    if (lastSeenTimestamp) {
      sinceDate = new Date(lastSeenTimestamp);
      if (isNaN(sinceDate.getTime())) {
        return res.status(400).json({ message: 'Invalid lastSeenTimestamp format' });
      }
    }

    let newMessages = [];
    if (sinceDate) {
      newMessages = chat.messages.filter(msg => msg.timestamp > sinceDate);
    } else {
      newMessages = [...chat.messages];
    }

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

// GET ALL MESSAGES FOR CHAT
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

    if (!message) {
      return res.status(400).json({
        message: 'Message content is required'
      });
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    const chat = await Chat.findOne({ ticketId });
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found for this ticket' });
    }

    const messageIndex = chat.messages.findIndex(msg => msg._id.toString() === messageId);
    if (messageIndex === -1) {
      return res.status(404).json({ message: 'Message not found' });
    }

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (chat.messages[messageIndex].senderId.toString() !== userId) {
      return res.status(403).json({ message: 'You can only edit your own messages' });
    }

    chat.messages[messageIndex].message = message.trim();
    chat.messages[messageIndex].edited = true;
    chat.messages[messageIndex].editedAt = new Date();

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

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Find chat and message
    const chat = await Chat.findOne({ ticketId });
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found for this ticket' });
    }

    const messageIndex = chat.messages.findIndex(msg => msg._id.toString() === messageId);
    if (messageIndex === -1) {
      return res.status(404).json({ message: 'Message not found' });
    }

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (chat.messages[messageIndex].senderId.toString() !== userId) {
      return res.status(403).json({ message: 'You can only delete your own messages' });
    }

    chat.messages.splice(messageIndex, 1);

    chat.lastUpdated = new Date();

    await chat.save();

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;