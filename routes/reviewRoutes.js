
import express from 'express';
import Review from '../models/Review.js';

const router = express.Router();

// CREATE REVIEW
router.post('/reviews', async (req, res) => {
  try {
    const { username, description, ticketTitle, ratingNumber , ticketId} = req.body;

    if (!username || !description || !ticketTitle || ratingNumber === undefined) {
      return res.status(400).json({
        message: 'Username, description, ticketTitle, and ratingNumber are required'
      });
    }

    if (ratingNumber < 1 || ratingNumber > 5) {
      return res.status(400).json({
        message: 'Rating number must be between 1 and 5'
      });
    }

    const review = new Review({
      username: username.trim(),
      description: description.trim(),
      ticketTitle: ticketTitle.trim(),
      ratingNumber: Number(ratingNumber),
      ticketId
    });

    await review.save();

    res.status(201).json({
      message: 'Review created successfully',
      review: {
        id: review._id,
        username: review.username,
        description: review.description,
        ticketTitle: review.ticketTitle,
        ratingNumber: review.ratingNumber,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        ticketId: review.ticketId
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET SINGLE REVIEW
router.get('/reviews/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json({
      review: {
        id: review._id,
        username: review.username,
        description: review.description,
        ticketTitle: review.ticketTitle,
        ratingNumber: review.ratingNumber,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        ticketId: review.ticketId
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET ALL CUSTOMER REVIEW
router.get('/reviews/c/:id', async (req, res) => {
  try {
    const review = await Review.find({ticketId : req.params.id});

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json({
      review: review});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// EDIT REVIEW
router.put('/reviews/:id', async (req, res) => {
  try {
    const { username, description, ticketTitle, ratingNumber } = req.body;

    if (username === undefined || description === undefined ||
        ticketTitle === undefined || ratingNumber === undefined) {
      return res.status(400).json({
        message: 'Username, description, ticketTitle, and ratingNumber are required'
      });
    }

    if (ratingNumber < 1 || ratingNumber > 5) {
      return res.status(400).json({
        message: 'Rating number must be between 1 and 5'
      });
    }

    const updateFields = {
      username: username.trim(),
      description: description.trim(),
      ticketTitle: ticketTitle.trim(),
      ratingNumber: Number(ratingNumber)
    };

    console.log(req.params.id)
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json({
      message: 'Review updated successfully',
      review: {
        id: review._id,
        username: review.username,
        description: review.description,
        ticketTitle: review.ticketTitle,
        ratingNumber: review.ratingNumber,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


// GET ALL REVIEWS (with optional filtering)
router.get('/reviews', async (req, res) => {
  try {
    const { username, ticketTitle, ratingNumber, page = 1, limit = 10 } = req.query;

    const filter = {};

    if (username) {
      filter.username = { $regex: new RegExp(username, 'i') };
    }

    if (ticketTitle) {
      filter.ticketTitle = { $regex: new RegExp(ticketTitle, 'i') };
    }

    if (ratingNumber) {
      const rating = Number(ratingNumber);
      if (rating >= 1 && rating <= 5) {
        filter.ratingNumber = rating;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments(filter);

    const formattedReviews = reviews.map(review => ({
      id: review._id,
      username: review.username,
      description: review.description,
      ticketTitle: review.ticketTitle,
      ratingNumber: review.ratingNumber,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt
    }));

    res.json({
      reviews: formattedReviews,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalReviews: total,
        hasNext: parseInt(page) * parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});



// DELETE REVIEW
router.delete('/reviews/:id', async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;