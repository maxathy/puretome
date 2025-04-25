const express = require('express');
const jwt = require('jsonwebtoken');
const { isEmail } = require('validator');
const router = express.Router();
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

/**
 * User registration endpoint
 * POST /api/users/register
 *
 * @param {Object} req.body - Contains email, password
 * @returns {Object} User data and JWT token
 */

router.post('/register', async (req, res) => {
  try {
    // Destructure name, email, password from body
    const { name, email, password } = req.body;

    // Add validation for name presence
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ message: 'Full name is required.' });
    }

    // Validate email format
    if (!email || !isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }

    // Validate password presence (more robust validation is recommended)
    if (!password || typeof password !== 'string' || password.length < 6) {
      // Example: min 6 chars
      return res
        .status(400)
        .json({ message: 'Password must be at least 6 characters long.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    console.log('User data valid, creating user');
    // Create new user with name, email, password
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase(),
      password,
    }); // Trim name, lowercase email
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    // Respond with token and user data (excluding password)
    const userData = user.toObject(); // Convert Mongoose doc to plain object
    delete userData.password; // Remove password field
    res.status(201).json({ token, user: userData });
  } catch (err) {
    // Log the specific error for debugging
    console.error('Registration Error:', err);

    // Handle potential Mongoose validation errors or other issues
    let errorMessage = 'Registration failed due to an internal error.';
    if (err.name === 'ValidationError') {
      errorMessage = Object.values(err.errors)
        .map((e) => e.message)
        .join(', ');
    } else if (err.code === 11000) {
      // Duplicate key error (likely email)
      errorMessage = 'Email already registered.';
    }

    res.status(400).json({ message: errorMessage, error: err.message }); // Send back clearer message
  }
});
/**
 * User login endpoint
 * POST /api/users/login
 *
 * @param {Object} req.body - Contains email, password
 * @returns {Object} User data and JWT token
 */

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Forgot password endpoint
 * POST /api/users/forgot-password
 *
 * @param {Object} req.body - Contains email
 * @returns {Object} Success message and reset token
 */

router.post('/forgot-password', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const token = user.generateResetToken();
    await user.save();

    // In real app: send email with reset link
    res.json({ message: 'Reset link generated', token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
/**
 * Reset password endpoint
 * POST /api/users/reset-password
 *
 * @param {Object} req.body - Contains token, password
 * @returns {Object} Success message
 */
router.post('/reset-password', async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.body.token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ error: 'Invalid or expired token' });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
