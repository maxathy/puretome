const express = require('express');
const { ObjectId } = require('mongoose').Types;
const router = express.Router();
const User = require('../models/User');
const Memoir = require('../models/Memoir');
const Invitation = require('../models/Invitation');
const { sendInvitationEmail } = require('../utils/emailService');
const crypto = require('crypto');

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
    const inviterId = req.user.id; // ID of the user sending the invite

    // 1. Find memoir and validate ownership
    const memoir = await Memoir.findOne({ _id: memoirId, author: inviterId });
    if (!memoir) {
      return res.status(404).json({ message: 'Memoir not found or you are not the author.' });
    }

    // 2. Check if already a collaborator or pending invite (using email)
    const existingCollaborator = memoir.collaborators.find(
        (c) => c.inviteEmail?.toLowerCase() === email.toLowerCase() || c.user?.toString() === user?._id.toString()
    );
     // Also check existing invitations
     const existingInvitation = await Invitation.findOne({ memoir: memoirId, inviteeEmail: email.toLowerCase(), status: 'pending' });

    if (existingCollaborator || existingInvitation) {
      return res.status(400).json({ message: 'User is already a collaborator or has a pending invitation.' });
    }


    // 3. Generate a secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days expiry

    // 4. Create and save the Invitation document
    const invitation = new Invitation({
      memoir: memoirId,
      inviteeEmail: email.toLowerCase(),
      role: role,
      token: token,
      expiresAt: expiresAt,
      invitedBy: inviterId,
    });
    await invitation.save();

    // 5. Send invitation email with the token
    try {
      const authorUser = await User.findById(inviterId).select('name');
      const authorName = authorUser ? authorUser.name : 'The Author';

      // Pass memoirId and token to email service
      await sendInvitationEmail(email, memoir.title, authorName, memoirId, token);

    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError);
      // Consider how to handle this - maybe delete the invitation record?
      // For now, we'll return success but log the error.
       // Log the email error but don't fail the request - the invite record exists
       // You might want more robust handling, like retries or marking the invite as failed_delivery
    }

    // 6. Respond (don't add to memoir.collaborators yet)
    res.status(200).json({
      message: 'Collaborator invitation sent successfully.',
      // Optionally return invite details, but maybe not the token
      invitationId: invitation._id
    });

  } catch (err) {
     console.error('Error inviting collaborator:', err); // Log the actual error
    res.status(500).json({ message: 'Failed to invite collaborator.', error: err.message });
  }
});

// Respond to a collaboration invite using a token
router.post('/:id/collaborators/respond', async (req, res) => { // Changed to POST, removed authMiddleware
  try {
    const { token, accepted } = req.body; // Get token and acceptance status
    const memoirIdFromPath = req.params.id;

    if (typeof accepted !== 'boolean' || !token) {
      return res.status(400).json({ message: 'Missing or invalid parameters (token, accepted)' });
    }

    // 1. Find the invitation by token
    const invitation = await Invitation.findOne({ token: token });

    // 2. Validate the invitation
    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found or invalid token.' });
    }

    // Check if memoir ID in path matches the one in the invitation
    if (invitation.memoir.toString() !== memoirIdFromPath) {
      return res.status(400).json({ message: 'Invalid request: Memoir ID mismatch.' });
    }

    // Check if already responded or expired
    if (invitation.status !== 'pending') {
      return res.status(400).json({ message: `Invitation already ${invitation.status}.` });
    }
    if (invitation.isExpired()) {
      invitation.status = 'expired'; // Mark as expired
      await invitation.save();
      return res.status(400).json({ message: 'Invitation has expired.' });
    }

    // 3. Handle Decline
    if (!accepted) {
      // Option 1: Delete the invitation
      await Invitation.deleteOne({ _id: invitation._id });
      // Option 2: Mark as declined (if you add 'declined' to Invitation status enum)
      // invitation.status = 'declined';
      // await invitation.save();
      return res.status(200).json({ message: 'Invitation declined successfully.' });
    }

    // 4. Handle Accept
    // Find the target memoir
    const memoir = await Memoir.findById(invitation.memoir);
    if (!memoir) {
       // Should be unlikely if invitation exists, but good practice to check
       console.error(`Memoir not found (${invitation.memoir}) for valid invitation (${invitation._id})`);
       invitation.status = 'expired'; // Mark as expired/invalid as memoir is gone
       await invitation.save();
       return res.status(404).json({ message: 'Associated memoir not found.' });
    }

    // Check if the user is already a collaborator (to prevent duplicates)
     const alreadyCollaborator = memoir.collaborators.some(
       (c) => c.inviteEmail?.toLowerCase() === invitation.inviteeEmail.toLowerCase() ||
              (c.user && c.user.toString() === user?._id.toString()) // Check user ID if user exists
     );

     if (alreadyCollaborator) {
        // Invitation was likely processed already but status update failed? Mark as accepted.
        invitation.status = 'accepted';
        await invitation.save();
        return res.status(200).json({ message: 'Already a collaborator.' });
     }

    // Find if the user already exists in the system
    const user = await User.findOne({ email: invitation.inviteeEmail });

    // Add collaborator entry to the memoir
    const newCollaborator = {
      role: invitation.role,
      inviteStatus: 'accepted',
      inviteEmail: invitation.inviteeEmail, // Keep email for reference
      user: user ? user._id : null, // Add user ID if they exist
    };
    memoir.collaborators.push(newCollaborator);

    // Update invitation status
    invitation.status = 'accepted';

    // Save changes
    await memoir.save();
    await invitation.save();

    res.status(200).json({ message: 'Invitation accepted successfully.' });

  } catch (err) {
    console.error('Error responding to invitation:', err); // Log the actual error
    res.status(500).json({ message: 'Error processing invitation response.', error: err.message });
  }
});

module.exports = router;
