// routes/comments.js - Routes for handling comments on blog posts

import express from 'express';
import { check, validationResult } from 'express-validator';
import Post from '../models/Post.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Validation for comments
const commentValidation = [
  check('content')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment must be between 1 and 500 characters'),
];

// GET all comments for a specific post
// NO AUTH NEEDED - Anyone can view comments
router.get('/post/:postId', async (req, res) => {
  try {
    const { postId } = req.params;

    // Find the post and populate comment users
    const post = await Post.findById(postId)
      .populate('comments.user', 'name email')
      .select('comments');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Sort comments by newest first
    const comments = post.comments.sort((a, b) => b.createdAt - a.createdAt);

    res.json({
      success: true,
      count: comments.length,
      comments: comments
    });
  } catch (err) {
    console.error('Get comments error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST a new comment to a specific post
// AUTH REQUIRED - Only logged-in users can comment
router.post('/post/:postId', auth, commentValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { postId } = req.params;
    const { content } = req.body;

    // Find the post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Add comment using the Post model method
    await post.addComment(req.user._id, content);

    // Get the newly added comment (it will be the last one)
    await post.populate('comments.user', 'name email');
    const newComment = post.comments[post.comments.length - 1];

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: newComment
    });
  } catch (err) {
    console.error('Add comment error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET a specific comment by ID
router.get('/:commentId/post/:postId', async (req, res) => {
  try {
    const { postId, commentId } = req.params;

    const post = await Post.findById(postId)
      .populate('comments.user', 'name email');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    res.json({
      success: true,
      comment: comment
    });
  } catch (err) {
    console.error('Get comment error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT - Update a specific comment
// AUTH REQUIRED - Only the comment author can update
router.put('/:commentId/post/:postId', auth, commentValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { postId, commentId } = req.params;
    const { content } = req.body;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if user is the comment author
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        error: 'Access denied. You can only update your own comments.' 
      });
    }

    // Update the comment
    comment.content = content;
    await post.save();

    // Populate user data for response
    await post.populate('comments.user', 'name email');
    const updatedComment = post.comments.id(commentId);

    res.json({
      success: true,
      message: 'Comment updated successfully',
      comment: updatedComment
    });
  } catch (err) {
    console.error('Update comment error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE a specific comment
// AUTH REQUIRED - Only the comment author can delete
router.delete('/:commentId/post/:postId', auth, async (req, res) => {
  try {
    const { postId, commentId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if user is the comment author
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        error: 'Access denied. You can only delete your own comments.' 
      });
    }

    // Remove the comment
    post.comments.pull(commentId);
    await post.save();

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (err) {
    console.error('Delete comment error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;