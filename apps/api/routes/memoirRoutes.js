const express = require('express');
const { ObjectId } = require('mongoose').Types;
const router = express.Router();
const User = require('../models/User');
const Memoir = require('../models/Memoir');
const Invitation = require('../models/Invitation');
const { sendInvitationEmail } = require('../utils/emailService');
const crypto = require('crypto');
const memoirController = require('../controllers/memoirController');

const { authMiddleware, authorizeRoles } = require('../middleware/auth');
/**
 * Create/Update memoir endpoint
 * POST /api/memoir
 * Requires authentication and author role
 *
 * @param {Object} req.body - Memoir data including title, content, chapters
 * @returns {Object} Created memoir data
 */

router.post(
  '/',
  authMiddleware,
  authorizeRoles('author'),
  memoirController.createMemoir,
);

/**
 * Update memoir endpoint
 * PUT /api/memoir/:id
 * Requires authentication and author role
 *
 * @param {String} req.params.id - Memoir ID
 * @param {Object} req.body - Memoir data to update
 * @returns {Object} Updated memoir data
 */
router.put(
  '/:id',
  authMiddleware,
  authorizeRoles('author'),
  memoirController.updateMemoir,
);

/**
 * Delete memoir endpoint
 * DELETE /api/memoir/:id
 * Requires authentication and author role
 *
 * @param {String} req.params.id - Memoir ID
 * @returns {Object} Success message
 */

router.delete(
  '/:id',
  authMiddleware,
  authorizeRoles('author'),
  memoirController.deleteMemoir,
);

/**
 * Get memoir by ID endpoint
 * GET /api/memoir/:id
 * Requires authentication
 *
 * @param {String} req.params.id - Memoir ID
 * @returns {Object} Memoir data with populated author and collaborators
 */

router.get('/:id', authMiddleware, memoirController.getMemoirById);

/**
 * Get all memoirs by the logged-in user endpoint
 * GET /api/memoir/my-memoirs
 * Requires authentication
 *
 * @returns {Array<Object>} Array of memoir data with populated author and collaborators
 */

router.get('/', authMiddleware, memoirController.getMyMemoirs);

/**
 * Add collaborator endpoint
 * POST /api/memoir/:id/collaborators
 * Requires authentication
 *
 * @param {String} req.params.id - Memoir ID
 * @returns {Object} Success message
 */
router.post(
  '/:id/collaborators',
  authMiddleware,
  memoirController.inviteCollaborator,
);

// Respond to a collaboration invite using a token
router.post('/:id/collaborators/respond', memoirController.respondToInvitation);

// Remove collaborator or revoke invitation
router.delete(
  '/:id/collaborators', // Note: No :collaboratorId here, we use request body
  authMiddleware, // Require user to be logged in
  authorizeRoles('author'), // Only allow authors to remove/revoke
  memoirController.removeOrRevokeCollaborator // Link to the new controller function
);

module.exports = router;
