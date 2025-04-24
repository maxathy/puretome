// apps/api/models/Comment.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  memoir: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Memoir',
    required: true,
  },
  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  resolved: {
    type: Boolean,
    default: false,
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Comment', commentSchema);
