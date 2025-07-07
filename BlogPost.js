// backend/models/BlogPost.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BlogPostSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: Schema.Types.ObjectId, // Reference to the User model
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    trim: true
  },
  tags: [
    {
      type: String,
      trim: true
    }
  ],
  imageUrl: {
    type: String, // URL to an image (optional)
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update `updatedAt` field on save
BlogPostSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('BlogPost', BlogPostSchema);