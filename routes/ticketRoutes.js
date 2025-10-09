
import express from 'express';
import Ticket from '../models/Ticket.js';
import User from '../models/User.js';

const router = express.Router();

const getRandomAgent = async () => {
  try {
    const agents = await User.find({ role: 'agent' }).select('_id fullname');
    if (agents.length === 0) {
      return null;
    }
    const randomIndex = Math.floor(Math.random() * agents.length);
    return agents[randomIndex];
  } catch (error) {
    console.error('Error fetching random agent:', error);
    return null;
  }
};

// CREATE TICKET
router.post('/tickets', async (req, res) => {
  try {
    const { title, description, priority, userEmail, userName, userId } = req.body;

    if (!title || !description || !priority || !userEmail || !userName || !userId) {
      return res.status(400).json({
        message: 'All fields (title, description, priority, userEmail, userName, userId) are required'
      });
    }

    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (!validPriorities.includes(priority.toLowerCase())) {
      return res.status(400).json({
        message: 'Priority must be one of: low, medium, high, urgent'
      });
    }

    const randomAgent = await getRandomAgent();

    const ticketData = {
      title: title.trim(),
      description: description.trim(),
      priority: priority.toLowerCase(),
      userEmail: userEmail.toLowerCase().trim(),
      userName: userName.trim(),
      userId: userId
    };

    if (randomAgent) {
      ticketData.assignedAgentId = randomAgent._id;
      ticketData.assignedAgentName = randomAgent.fullname;
    }

    const ticket = new Ticket(ticketData);
    await ticket.save();

    res.status(201).json({
      message: 'Ticket created successfully',
      ticket: {
        id: ticket._id,
        title: ticket.title,
        description: ticket.description,
        priority: ticket.priority,
        userEmail: ticket.userEmail,
        userName: ticket.userName,
        userId: ticket.userId,
        assignedAgentId: ticket.assignedAgentId,
        assignedAgentName: ticket.assignedAgentName,
        status: ticket.status,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET SINGLE TICKET
router.get('/tickets/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.json({
      ticket: {
        id: ticket._id,
        title: ticket.title,
        description: ticket.description,
        priority: ticket.priority,
        userEmail: ticket.userEmail,
        userName: ticket.userName,
        userId: ticket.userId,
        assignedAgentId: ticket.assignedAgentId,
        assignedAgentName: ticket.assignedAgentName,
        status: ticket.status,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET ALL TICKETS
router.get('/tickets', async (req, res) => {
  try {
    const {
      status,
      priority,
      userEmail,
      userId,
      assignedAgentId,
      page = 1,
      limit = 10
    } = req.query;

    const filter = {};

    if (status) {
      filter.status = status.toLowerCase();
    }

    if (priority) {
      filter.priority = priority.toLowerCase();
    }

    if (userEmail) {
      filter.userEmail = { $regex: new RegExp(userEmail, 'i') };
    }

    if (userId) {
      filter.userId = userId;
    }

    if (assignedAgentId) {
      filter.assignedAgentId = assignedAgentId;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const tickets = await Ticket.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Ticket.countDocuments(filter);

    const formattedTickets = tickets.map(ticket => ({
      id: ticket._id,
      title: ticket.title,
      description: ticket.description,
      priority: ticket.priority,
      userEmail: ticket.userEmail,
      userName: ticket.userName,
      userId: ticket.userId,
      assignedAgentId: ticket.assignedAgentId,
      assignedAgentName: ticket.assignedAgentName,
      status: ticket.status,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt
    }));

    res.json({
      tickets: formattedTickets,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalTickets: total,
        hasNext: parseInt(page) * parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// EDIT TICKET
router.put('/tickets/:id', async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      userEmail,
      userName,
      userId,
      assignedAgentId,
      assignedAgentName,
      status
    } = req.body;

    const updateFields = {};

    if (title !== undefined) updateFields.title = title.trim();
    if (description !== undefined) updateFields.description = description.trim();
    if (priority !== undefined) {
      const validPriorities = ['low', 'medium', 'high', 'urgent'];
      if (!validPriorities.includes(priority.toLowerCase())) {
        return res.status(400).json({
          message: 'Priority must be one of: low, medium, high, urgent'
        });
      }
      updateFields.priority = priority.toLowerCase();
    }
    if (userEmail !== undefined) updateFields.userEmail = userEmail.toLowerCase().trim();
    if (userName !== undefined) updateFields.userName = userName.trim();
    if (userId !== undefined) updateFields.userId = userId;
    if (assignedAgentId !== undefined) updateFields.assignedAgentId = assignedAgentId;
    if (assignedAgentName !== undefined) updateFields.assignedAgentName = assignedAgentName;
    if (status !== undefined) {
      const validStatuses = ['open', 'inprogress', 'resolved', 'closed'];
      if (!validStatuses.includes(status.toLowerCase())) {
        return res.status(400).json({
          message: 'Status must be one of: open, inprogress, resolved, closed'
        });
      }
      updateFields.status = status.toLowerCase();
    }

    const ticket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.json({
      message: 'Ticket updated successfully',
      ticket: {
        id: ticket._id,
        title: ticket.title,
        description: ticket.description,
        priority: ticket.priority,
        userEmail: ticket.userEmail,
        userName: ticket.userName,
        userId: ticket.userId,
        assignedAgentId: ticket.assignedAgentId,
        assignedAgentName: ticket.assignedAgentName,
        status: ticket.status,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE TICKET
router.delete('/tickets/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;