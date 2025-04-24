// apps/api/routes/commentRoutes.js
const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Memoir = require('../models/Memoir');
const { authMiddleware } = require('../middleware/auth');

// Create comment
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { memoirId, chapterId, eventId, content, parentCommentId } = req.body;

    // Verify user has access to this memoir
    const memoir = await Memoir.findOne({
      _id: memoirId,
      $or: [
        { author: req.user.id },
        {
          'collaborators.user': req.user.id,
          'collaborators.inviteStatus': 'accepted',
        },
      ],
    });

    if (!memoir) {
      return res
        .status(404)
        .json({ message: 'Memoir not found or access denied' });
    }

    // Create comment
    const comment = new Comment({
      memoir: memoirId,
      chapter: chapterId || null,
      event: eventId || null,
      author: req.user.id,
      content,
      parentComment: parentCommentId || null,
    });

    await comment.save();

    // Populate author for immediate use in UI
    await comment.populate({ path: 'author', select: '-password' });

    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get comments for a memoir/chapter/event
router.get('/memoir/:memoirId', authMiddleware, async (req, res) => {
  try {
    const { memoirId } = req.params;
    const { chapterId, eventId } = req.query;

    // Verify user has access
    const memoir = await Memoir.findOne({
      _id: memoirId,
      $or: [
        { author: req.user.id },
        {
          'collaborators.user': req.user.id,
          'collaborators.inviteStatus': 'accepted',
        },
      ],
    });

    if (!memoir) {
      return res
        .status(404)
        .json({ message: 'Memoir not found or access denied' });
    }

    // Build query
    const query = { memoir: memoirId };
    if (chapterId) query.chapter = chapterId;
    if (eventId) query.event = eventId;

    const comments = await Comment.find(query)
      .populate({ path: 'author', select: '-password' })
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
