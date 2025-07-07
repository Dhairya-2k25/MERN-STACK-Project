// backend/routes/blogPosts.js

const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth'); // Our authentication middleware
const BlogPost = require('../models/BlogPost'); // Blog Post Model
const User = require('../models/User'); // User Model (to populate author info)

// @route   POST api/blogposts
// @desc    Create a blog post
// @access  Private (only authenticated users can create posts)
router.post(
  '/',
  auth, // Protect this route with authentication middleware
  [
    check('title', 'Title is required').not().isEmpty(),
    check('content', 'Content is required').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, content, category, tags, imageUrl } = req.body;

      const newBlogPost = new BlogPost({
        title,
        content,
        author: req.user.id, // Author ID comes from the authenticated user
        category,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [], // Split tags by comma
        imageUrl,
      });

      const blogPost = await newBlogPost.save();
      res.json(blogPost);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET api/blogposts
// @desc    Get all blog posts
// @access  Public
router.get('/', async (req, res) => {
  try {
    // Populate the 'author' field to get username instead of just ID
    const blogPosts = await BlogPost.find().populate('author', 'username').sort({ createdAt: -1 });
    res.json(blogPosts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/blogposts/:id
// @desc    Get blog post by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const blogPost = await BlogPost.findById(req.params.id).populate('author', 'username');

    if (!blogPost) {
      return res.status(404).json({ msg: 'Blog post not found' });
    }

    res.json(blogPost);
  } catch (err) {
    console.error(err.message);
    // Check if the ID format is invalid (e.g., not a valid ObjectId)
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Blog post not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/blogposts/:id
// @desc    Update a blog post
// @access  Private (only the author can update their post)
router.put('/:id', auth, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, content, category, tags, imageUrl } = req.body;

  // Build blog post object
  const blogPostFields = {};
  if (title) blogPostFields.title = title;
  if (content) blogPostFields.content = content;
  if (category) blogPostFields.category = category;
  if (tags) blogPostFields.tags = tags.split(',').map(tag => tag.trim());
  if (imageUrl) blogPostFields.imageUrl = imageUrl;
  blogPostFields.updatedAt = Date.now(); // Manually update this on modifications

  try {
    let blogPost = await BlogPost.findById(req.params.id);

    if (!blogPost) return res.status(404).json({ msg: 'Blog post not found' });

    // Ensure user owns the blog post
    if (blogPost.author.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    blogPost = await BlogPost.findByIdAndUpdate(
      req.params.id,
      { $set: blogPostFields },
      { new: true } // Return the updated document
    );

    res.json(blogPost);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Blog post not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/blogposts/:id
// @desc    Delete a blog post
// @access  Private (only the author can delete their post)
router.delete('/:id', auth, async (req, res) => {
  try {
    const blogPost = await BlogPost.findById(req.params.id);

    if (!blogPost) {
      return res.status(404).json({ msg: 'Blog post not found' });
    }

    // Ensure user owns the blog post
    if (blogPost.author.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await BlogPost.deleteOne({ _id: req.params.id }); // Use deleteOne for newer Mongoose versions

    res.json({ msg: 'Blog post removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Blog post not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;