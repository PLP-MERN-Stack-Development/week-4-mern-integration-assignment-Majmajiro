import express from 'express';
import { check, validationResult } from 'express-validator';
import Post from '../models/Post.js';
import auth from '../middleware/auth.js'; // Import our auth middleware

const router = express.Router();

// Validation rules
const postValidation = [
  check('title', 'Title is required').notEmpty(),
  check('content', 'Content is required').notEmpty(),
  check('category', 'Category is required').notEmpty(),
];

// GET all posts with pagination, search, and category filtering
// ❌ NO AUTH NEEDED - Anyone can view posts
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 5, search = '', category = '' } = req.query;
    const query = {};

    // Search in title or content
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find(query)
        .populate('author', 'name email') // 🔥 Populate author with name and email
        .populate('category', 'name') // 🔥 Populate category with name
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Post.countDocuments(query)
    ]);

    res.json({
      posts,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET a single post by ID
// ❌ NO AUTH NEEDED - Anyone can view a single post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name email') // 🔥 Populate author
      .populate('category', 'name') // 🔥 Populate category
      .populate('comments.user', 'name'); // 🔥 Populate comment users too!
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Increment view count
    await post.incrementViewCount();
    
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new post
// ✅ AUTH REQUIRED - Only logged-in users can create posts
router.post('/', auth, postValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Create post with authenticated user as author
    const newPost = new Post({
      ...req.body,
      author: req.user._id // 🔥 Automatically set the logged-in user as author
    });

    const savedPost = await newPost.save();
    
    // Populate the response
    await savedPost.populate('author', 'name email');
    await savedPost.populate('category', 'name');
    
    res.status(201).json(savedPost);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT - update a post
// ✅ AUTH REQUIRED - Only the author can update their own post
router.put('/:id', auth, postValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Find the post first
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the user is the author of the post
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        error: 'Access denied. You can only update your own posts.' 
      });
    }

    // Update the post
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    )
    .populate('author', 'name email')
    .populate('category', 'name');

    res.json(updatedPost);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE a post 
// ✅ AUTH REQUIRED - Only the author can delete their own post
router.delete('/:id', auth, async (req, res) => {
  try {
    // Find the post first
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the user is the author of the post
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        error: 'Access denied. You can only delete your own posts.' 
      });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;