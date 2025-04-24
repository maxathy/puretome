const express = require('express');
const { ObjectId } = require('mongoose').Types;
const router = express.Router();
const User = require('../models/User');
const Memoir = require('../models/Memoir');

const { authMiddleware, authorizeRoles } = require('../middleware/auth');
/**
 * Create/Update memoir endpoint
 * POST /api/memoir
 * Requires authentication and author role
 *
 * @param {Object} req.body - Memoir data including title, content, chapters
 * @returns {Object} Saved memoir data
 */

router.post('/', authMiddleware, authorizeRoles('author'), async (req, res) => {
  try {
    const { _id, ...memoirData } = req.body;

    // Ensure the author is set to the logged-in user
    const authorContext = {
      ...memoirData,
      author: req.user.id, // Add/overwrite author field
    };

    const updatedMemoir = await Memoir.findOneAndUpdate(
      { _id: _id || new ObjectId() },
      authorContext, // Use the modified data object
      {
        new: true,
        upsert: true,
        runValidators: true,
      },
    );

    res
      .status(!_id ? 201 : 200)
      .json({ message: 'Memoir saved', memoir: updatedMemoir });
  } catch (err) {
    console.error('Save error:', err);
    res.status(500).json({ message: 'Error saving memoir', error: err });
  }
});

/**
 * Delete memoir endpoint
 * DELETE /api/memoir
 * Requires authentication and author role
 *
 * @param {Object} req.body - Contains memoir id
 * @returns {Object} Success message
 */

router.delete(
  '/',
  authMiddleware,
  authorizeRoles('author'),
  async (req, res) => {
    try {
      const { _id } = req.body;

      if (!_id) {
        return res.status(400).json({ message: 'Memoir ID is required' });
      }

      // Find the memoir and ensure the author is the logged-in user
      const memoirToDelete = await Memoir.findOne({
        _id: _id,
        author: req.user.id,
      });

      if (!memoirToDelete) {
        // If not found or user is not the author, return 404
        // We don't want to reveal if the memoir exists but belongs to someone else
        return res.status(404).json({ message: 'Memoir not found' });
      }

      // Delete the memoir
      await Memoir.deleteOne({ _id: _id });

      res.status(200).json({ message: 'Memoir deleted successfully' });
    } catch (err) {
      console.error('Delete error:', err);
      res.status(500).json({ message: 'Error removing memoir', error: err });
    }
  },
);

/**
 * Get memoir by ID endpoint
 * GET /api/memoir/:id
 * Requires authentication
 *
 * @param {String} req.params.id - Memoir ID
 * @returns {Object} Memoir data with populated author and collaborators
 */

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    // noinspection JSCheckFunctionSignatures
    const memoirs = await Memoir.findOne({
      _id: req.params.id,
      $or: [
        { author: req.user.id },
        {
          'collaborators.user': req.user.id,
          'collaborators.inviteStatus': 'accepted',
        },
      ],
    })
      .populate({ path: 'author', select: ['-password'] })
      .populate({ path: 'collaborators', select: '-password' });
    res.json(memoirs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get all memoirs by the logged-in user endpoint
 * GET /api/memoir/my-memoirs
 * Requires authentication
 *
 * @returns {Array<Object>} Array of memoir data with populated author and collaborators
 */

router.get('/', authMiddleware, async (req, res) => {
  try {
    // noinspection JSCheckFunctionSignatures
    const memoirs = await Memoir.find({ author: req.user.id })
      .populate({ path: 'author', select: ['-password'] })
      .populate({ path: 'collaborators', select: '-password' });
    res.json(memoirs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Add collaborator endpoint
 * POST /api/memoir/:id/collaborators
 * Requires authentication
 *
 * @param {String} req.params.id - Memoir ID
 * @returns {Object} Success message
 */
router.post('/:id/collaborators', authMiddleware, async (req, res) => {
  try {
    const { email, role } = req.body;
    const memoirId = req.params.id;

    // Find memoir and validate ownership
    const memoir = await Memoir.findOne({
      _id: memoirId,
      author: req.user.id,
    });

    if (!memoir) {
      return res.status(404).json({ message: 'Memoir not found' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    const collaborator = {
      role,
      inviteStatus: 'pending',
      inviteEmail: email,
    };

    if (user) {
      collaborator.user = user._id;
    }

    // Add to collaborators array
    memoir.collaborators.push(collaborator);
    await memoir.save();

    // TODO: Send invitation email

    res.status(200).json({
      message: 'Collaborator invitation sent',
      collaborator,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// apps/api/routes/memoirRoutes.js

// Accept/decline collaboration invite
router.put('/:id/collaborators/respond', authMiddleware, async (req, res) => {
  try {
    const { response } = req.body; // 'accepted' or 'declined'
    const memoirId = req.params.id;

    // Find memoir where user is invited
    const memoir = await Memoir.findOne({
      _id: memoirId,
      'collaborators.user': req.user.id,
      'collaborators.inviteStatus': 'pending',
    });

    if (!memoir) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    // Update the invitation status
    const collaboratorIndex = memoir.collaborators.findIndex(
      (c) => c.user.toString() === req.user.id.toString(),
    );

    memoir.collaborators[collaboratorIndex].inviteStatus = response;
    await memoir.save();

    res.json({ message: `Invitation ${response}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
