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
    const { email } = req.body;
    if (isEmail(email)) {
      console.log('email valid');
      const user = new User(req.body);
      await user.save();
      const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
        expiresIn: '7d',
      });
      res.status(201).json({ token, user });
    } else {
      res.status(400).json({ error: 'invalid email' });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
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
