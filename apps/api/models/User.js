const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
/**
 * User schema for MongoDB
 * Includes authentication methods and password reset functionality
 *
 * @property {String} email - User's email (required, unique)
 * @property {String} password - Hashed password (required)
 * @property {String} role - User role (author, agent, publisher, admin)
 * @property {String} resetPasswordToken - Token for password reset
 * @property {Date} resetPasswordExpires - Expiration for reset token
 * @property {String} avatar - URL to user's avatar image
 */
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['author', 'agent', 'publisher', 'admin'],
    default: 'author',
  },
  avatar: {
    type: String,
    default: null,
  },
  bio: {
    type: String,
    default: '',
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.generateResetToken = function () {
  const token = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = token;
  this.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  return token;
};

module.exports = mongoose.model('User', UserSchema);
