const { ObjectId } = require('mongoose').Types;
const User = require('../models/User');
const Memoir = require('../models/Memoir');
const Invitation = require('../models/Invitation');
const { sendInvitationEmail } = require('../utils/emailService');
const crypto = require('crypto');

// POST /api/memoir
exports.createMemoir = async (req, res) => {
  try {
    const { ...memoirData } = req.body;
    const authorContext = {
      ...memoirData,
      author: req.user.id,
    };
    const newMemoir = await Memoir.create(authorContext);
    res.status(201).json({ message: 'Memoir created', memoir: newMemoir });
  } catch (err) {
    console.error('Create error:', err);
    // Check for Mongoose validation error
    if (err.name === 'ValidationError') {
      // Extract validation messages
      const messages = Object.values(err.errors).map((val) => val.message);
      return res.status(400).json({
        message: `Validation failed: ${messages.join('. ')}`,
        errors: err.errors,
      });
    }
    // Fallback for other errors
    res
      .status(500)
      .json({ message: 'Error creating memoir', error: err.message });
  }
};

// PUT /api/memoir/:id
exports.updateMemoir = async (req, res) => {
  try {
    const memoirId = req.params.id;
    const updateData = req.body;
    const memoirToUpdate = await Memoir.findOne({
      _id: memoirId,
      author: req.user.id,
    });

    if (!memoirToUpdate) {
      return res
        .status(404)
        .json({ message: 'Memoir not found or access denied' });
    }

    delete updateData.author; // Prevent changing the author

    const updatedMemoir = await Memoir.findByIdAndUpdate(memoirId, updateData, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ message: 'Memoir updated', memoir: updatedMemoir });
  } catch (err) {
    console.error('Update error:', err);
    res
      .status(500)
      .json({ message: 'Error updating memoir', error: err.message });
  }
};

// DELETE /api/memoir/:id
exports.deleteMemoir = async (req, res) => {
  try {
    const memoirId = req.params.id;
    const memoirToDelete = await Memoir.findOne({
      _id: memoirId,
      author: req.user.id,
    });

    if (!memoirToDelete) {
      return res.status(404).json({ message: 'Memoir not found' });
    }

    await Memoir.deleteOne({ _id: memoirId });
    res.status(200).json({ message: 'Memoir deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res
      .status(500)
      .json({ message: 'Error removing memoir', error: err.message });
  }
};

// GET /api/memoir/:id
exports.getMemoirById = async (req, res) => {
  try {
    const memoir = await Memoir.findOne({
      _id: req.params.id,
      $or: [
        { author: req.user.id },
        {
          'collaborators.user': req.user.id,
          'collaborators.inviteStatus': 'accepted',
        },
      ],
    })
      .populate({ path: 'author', select: '-password' })
      .populate({ path: 'collaborators.user', select: '-password' }); // Corrected population

    if (!memoir) {
      return res
        .status(404)
        .json({ message: 'Memoir not found or access denied' });
    }
    res.json(memoir);
  } catch (err) {
    console.error('Get Memoir By ID error:', err);
    res
      .status(500)
      .json({ message: 'Error retrieving memoir', error: err.message });
  }
};

// GET /api/memoir/ (Get all memoirs for the logged-in user)
exports.getMyMemoirs = async (req, res) => {
  try {
    const memoirs = await Memoir.find({ author: req.user.id })
      .populate({ path: 'author', select: '-password' })
      .populate({ path: 'collaborators.user', select: '-password' }); // Corrected population
    res.json(memoirs);
  } catch (err) {
    console.error('Get My Memoirs error:', err);
    res
      .status(500)
      .json({ message: 'Error retrieving memoirs', error: err.message });
  }
};

// POST /api/memoir/:id/collaborators
exports.inviteCollaborator = async (req, res) => {
  try {
    const { email, role } = req.body;
    const memoirId = req.params.id;
    const inviterId = req.user.id;

    const memoir = await Memoir.findOne({ _id: memoirId, author: inviterId });
    if (!memoir) {
      return res
        .status(404)
        .json({ message: 'Memoir not found or you are not the author.' });
    }

    const existingCollaborator = memoir.collaborators.find(
      (c) =>
        c.inviteEmail?.toLowerCase() === email.toLowerCase() ||
        (c.user && c.user.toString() === req.user.id.toString()), // Simplification was incorrect, keeping original logic
    );

    const existingInvitation = await Invitation.findOne({
      memoir: memoirId,
      inviteeEmail: email.toLowerCase(),
      status: 'pending',
    });

    if (existingCollaborator || existingInvitation) {
      return res.status(400).json({
        message: 'User is already a collaborator or has a pending invitation.',
      });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days expiry

    const invitation = new Invitation({
      memoir: memoirId,
      inviteeEmail: email.toLowerCase(),
      role: role,
      token: token,
      expiresAt: expiresAt,
      invitedBy: inviterId,
    });
    await invitation.save();

    try {
      const authorUser = await User.findById(inviterId).select('name');
      const authorName = authorUser ? authorUser.name : 'The Author';
      await sendInvitationEmail(
        email,
        memoir.title,
        authorName,
        memoirId,
        token,
      );
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError);
      // Log email error but don't fail the request
    }

    res.status(200).json({
      message: 'Collaborator invitation sent successfully.',
      invitationId: invitation._id,
    });
  } catch (err) {
    console.error('Error inviting collaborator:', err);
    res
      .status(500)
      .json({ message: 'Failed to invite collaborator.', error: err.message });
  }
};

// POST /api/memoir/:id/collaborators/respond
exports.respondToInvitation = async (req, res) => {
  try {
    const { token, accepted } = req.body;
    const memoirIdFromPath = req.params.id;

    if (typeof accepted !== 'boolean' || !token) {
      return res
        .status(400)
        .json({ message: 'Missing or invalid parameters (token, accepted)' });
    }

    const invitation = await Invitation.findOne({ token: token });

    if (!invitation) {
      return res
        .status(404)
        .json({ message: 'Invitation not found or invalid token.' });
    }

    if (invitation.memoir.toString() !== memoirIdFromPath) {
      return res
        .status(400)
        .json({ message: 'Invalid request: Memoir ID mismatch.' });
    }

    if (invitation.status !== 'pending') {
      return res
        .status(400)
        .json({ message: `Invitation already ${invitation.status}.` });
    }

    if (invitation.isExpired()) {
      invitation.status = 'expired';
      await invitation.save();
      return res.status(400).json({ message: 'Invitation has expired.' });
    }

    if (!accepted) {
      await Invitation.deleteOne({ _id: invitation._id });
      return res
        .status(200)
        .json({ message: 'Invitation declined successfully.' });
    }

    // Handle Accept
    const memoir = await Memoir.findById(invitation.memoir);
    if (!memoir) {
      console.error(
        `Memoir not found (${invitation.memoir}) for valid invitation (${invitation._id})`,
      );
      invitation.status = 'expired';
      await invitation.save();
      return res.status(404).json({ message: 'Associated memoir not found.' });
    }

    // Need to determine the user accepting the invite.
    // This logic assumes the invitee might or might not have an account yet.
    // If an account exists with inviteeEmail, use that user's ID.
    // If not, the collaborator entry won't have a user ref initially.
    const inviteeUser = await User.findOne({ email: invitation.inviteeEmail });

    const alreadyCollaborator = memoir.collaborators.some(
      (c) =>
        c.inviteEmail?.toLowerCase() ===
          invitation.inviteeEmail.toLowerCase() ||
        (inviteeUser &&
          c.user &&
          c.user.toString() === inviteeUser._id.toString()), // Check if user ID matches
    );

    if (alreadyCollaborator) {
      invitation.status = 'accepted'; // Ensure status is updated
      await invitation.save(); // Save the updated status
      return res.status(200).json({ message: 'Already a collaborator.' });
    }

    const newCollaborator = {
      role: invitation.role,
      inviteStatus: 'accepted',
      inviteEmail: invitation.inviteeEmail,
      user: inviteeUser ? inviteeUser._id : null, // Link to user if found
    };
    memoir.collaborators.push(newCollaborator);

    invitation.status = 'accepted';

    await memoir.save();
    await invitation.save();

    res.status(200).json({ message: 'Invitation accepted successfully.' });
  } catch (err) {
    console.error('Error responding to invitation:', err);
    res.status(500).json({
      message: 'Error processing invitation response.',
      error: err.message,
    });
  }
};
