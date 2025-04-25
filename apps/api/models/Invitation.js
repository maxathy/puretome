const mongoose = require('mongoose');
const crypto = require('crypto');

const InvitationSchema = new mongoose.Schema({
  memoir: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Memoir',
    required: true,
  },
  inviteeEmail: { // Store email, user might not exist yet
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  role: { // Role assigned in the invitation
    type: String,
    enum: ['viewer', 'editor', 'validator'],
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'expired'], // 'declined' isn't stored here, just prevents acceptance
    default: 'pending',
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  invitedBy: { // Track who sent the invite
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, {
  timestamps: true, // Adds createdAt
});

// Optional: Add index for faster token lookup
InvitationSchema.index({ token: 1 });

// Optional: Method to check if token is expired
InvitationSchema.methods.isExpired = function() {
  return Date.now() >= this.expiresAt;
};

module.exports = mongoose.models.Invitation || mongoose.model('Invitation', InvitationSchema); 