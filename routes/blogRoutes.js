// routes/blogRoutes.js
import express from 'express';
import Blog from '../models/Blog.js';

const router = express.Router();

// CREATE BLOG
router.post('/blogs', async (req, res) => {
  try {
    const { title, excerpt, content, category, tags, imageUrl, authorName } = req.body;

    // Validate required fields
    if (!title || !excerpt || !content || !category) {
      return res.status(400).json({
        message: 'Title, excerpt, content, and category are required'
      });
    }

    // Normalize tags to a comma-separated string
    let normalizedTags = '';
    if (Array.isArray(tags)) {
      normalizedTags = tags
        .map(tag => tag.toString().trim())
        .filter(tag => tag !== '')
        .join(',');
    } else if (typeof tags === 'string') {
      normalizedTags = tags.trim();
    }
    // If tags is null/undefined/other, normalizedTags remains ''

    const blog = new Blog({
      title,
      excerpt,
      content,
      authorName,
      category: category.toLowerCase().trim(),
      tags: normalizedTags,
      imageUrl: imageUrl || ''
    });

    await blog.save();

    res.status(201).json({
      message: 'Blog created successfully',
      blog: {
        id: blog._id,
        title: blog.title,
        excerpt: blog.excerpt,
        content: blog.content,
        category: blog.category,
        tags: blog.tags,
        authorName: blog.authorName,
        imageUrl: blog.imageUrl,
        createdAt: blog.createdAt,
        updatedAt: blog.updatedAt
      }
    });
  } catch (error) {
    console.error('Blog creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// READ SINGLE BLOG
router.get('/blogs/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.json({
      blog: {
        id: blog._id,
        title: blog.title,
        excerpt: blog.excerpt,
        content: blog.content,
        category: blog.category,
        tags: blog.tags,
        authorName: blog.authorName,
        imageUrl: blog.imageUrl,
        createdAt: blog.createdAt,
        updatedAt: blog.updatedAt
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// READ ALL BLOGS (with filtering)
router.get('/blogs', async (req, res) => {
  try {
    const { category, title, tags, page = 1, limit = 10 } = req.query;

    // Build filter object
    const filter = {};

    // Category filter (exact match, case-insensitive)
    if (category) {
      filter.category = { $regex: new RegExp(category, 'i') };
    }

    // Title filter (partial match)
    if (title) {
      filter.title = { $regex: new RegExp(title, 'i') };
    }

    // Tags filter (comma-separated, partial match for any tag)
    if (tags) {
      // Split tags by comma and create regex for each
      const tagArray = tags.split(',').map(tag => tag.trim());
      const tagRegexes = tagArray.map(tag => new RegExp(tag, 'i'));
      filter.$or = tagRegexes.map(regex => ({ tags: { $regex: regex } }));
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const blogs = await Blog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination info
    const total = await Blog.countDocuments(filter);

    const formattedBlogs = blogs.map(blog => ({
      id: blog._id,
      title: blog.title,
      excerpt: blog.excerpt,
      content: blog.content,
      category: blog.category,
      tags: blog.tags,
      authorName: blog.authorName,
      imageUrl: blog.imageUrl,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt
    }));

    res.json({
      blogs: formattedBlogs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalBlogs: total,
        hasNext: parseInt(page) * parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// EDIT BLOG
router.put('/blogs/:id', async (req, res) => {
  try {
    const { title, excerpt, content, category, tags, imageUrl } = req.body;

    // Validate required fields
    if (title === undefined || excerpt === undefined || content === undefined || category === undefined) {
      return res.status(400).json({
        message: 'Title, excerpt, content, and category are required'
      });
    }

    // Normalize tags to a comma-separated string (if provided)
    let normalizedTags;
    if (tags !== undefined) {
      if (Array.isArray(tags)) {
        normalizedTags = tags
          .map(tag => tag.toString().trim())
          .filter(tag => tag !== '')
          .join(',');
      } else if (typeof tags === 'string') {
        normalizedTags = tags.trim();
      } else {
        // If tags is null, number, etc., treat as empty string
        normalizedTags = '';
      }
    }

    const updateFields = {
      title,
      excerpt,
      content,
      category: category.toLowerCase().trim(),
      imageUrl: imageUrl !== undefined ? imageUrl : undefined
    };

    // Only add tags if it was provided in the request
    if (tags !== undefined) {
      updateFields.tags = normalizedTags;
    }

    // Remove undefined fields (optional, but clean)
    Object.keys(updateFields).forEach(key => {
      if (updateFields[key] === undefined) {
        delete updateFields[key];
      }
    });

    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.json({
      message: 'Blog updated successfully',
      blog: {
        id: blog._id,
        title: blog.title,
        excerpt: blog.excerpt,
        content: blog.content,
        category: blog.category,
        tags: blog.tags,
        imageUrl: blog.imageUrl,
        createdAt: blog.createdAt,
        updatedAt: blog.updatedAt
        // Note: your Blog model doesn't have `authorName`, so remove if not needed
      }
    });
  } catch (error) {
    console.error('Blog update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE BLOG
router.delete('/blogs/:id', async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);

    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;