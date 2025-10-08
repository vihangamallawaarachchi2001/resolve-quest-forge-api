import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js'

const router = express.Router();

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

// SIGNUP (for both regular signup and admin-created users)
router.post('/signup', async (req, res) => {
  try {
    const { fullname, email, password, bio, role, avatarUrl } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      fullname,
      email,
      password: hashedPassword,
      bio: bio || '',
      role: role || 'customer',
      avatarUrl: avatarUrl || ''
    });

    await user.save();

    // Generate token (only for self-signup)
    const token = generateToken(user);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        bio: user.bio,
        role: user.role,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        bio: user.bio,
        role: user.role,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET PROFILE (current user)
router.get('/profile', async (req, res) => {
  try {
    const { email } = req.query; // Get email from query params

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        bio: user.bio,
        role: user.role,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// EDIT PROFILE
router.put('/profile', async (req, res) => {
  try {
    const { email } = req.query;
    const { fullname, bio, role, avatarUrl } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const updateFields = {};
    if (fullname !== undefined) updateFields.fullname = fullname;
    if (bio !== undefined) updateFields.bio = bio;
    if (role !== undefined) updateFields.role = role;
    if (avatarUrl !== undefined) updateFields.avatarUrl = avatarUrl;

    const user = await User.findOneAndUpdate(
      { email },
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        fullname: user.fullname,
        email: user.email,
        bio: user.bio,
        role: user.role,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE PROFILE
router.delete('/profile', async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOneAndDelete({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET ALL PROFILES
router.get('/profiles', async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude password field

    const formattedUsers = users.map(user => ({
      id: user._id,
      fullname: user.fullname,
      email: user.email,
      bio: user.bio,
      role: user.role,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));

    res.json({ users: formattedUsers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;