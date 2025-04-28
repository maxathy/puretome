const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { isEmail } = require('validator');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// POST /api/users/register
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ message: 'Full name is required.' });
    }
    if (!email || !isEmail(email)) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 6 characters long.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const user = new User({
      name: name.trim(),
      email: email.toLowerCase(),
      password,
    });
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    const userData = user.toObject();
    delete userData.password;
    res.status(201).json({ token, user: userData });
  } catch (err) {
    console.error('Registration Error:', err);
    let errorMessage = 'Registration failed due to an internal error.';
    if (err.name === 'ValidationError') {
      errorMessage = Object.values(err.errors)
        .map((e) => e.message)
        .join(', ');
    } else if (err.code === 11000) {
      errorMessage = 'Email already registered.';
    }
    res.status(400).json({ message: errorMessage, error: err.message });
  }
};

// POST /api/users/login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase() }); // Ensure lowercase comparison
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({ token, user });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({
      message: 'Login failed due to an internal error.',
      error: err.message,
    });
  }
};

// POST /api/users/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !isEmail(email)) {
      return res.status(400).json({ message: 'Valid email is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Still return a generic success message to prevent email enumeration
      console.log(`Password reset requested for non-existent email: ${email}`);
      return res.json({
        message:
          'If your email is registered, you will receive a password reset link.',
      });
    }

    const token = user.generateResetToken();
    await user.save({ validateBeforeSave: false }); // Skip validation to save token fields

    // TODO: Implement actual email sending here
    console.log(`Password reset token for ${email}: ${token}`); // Log for dev
    // await sendPasswordResetEmail(user.email, token);

    res.json({
      message:
        'If your email is registered, you will receive a password reset link.',
    });
  } catch (err) {
    console.error('Forgot Password Error:', err);
    res.status(500).json({
      message: 'Error processing forgot password request.',
      error: err.message,
    });
  }
};

// POST /api/users/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Reset token is required.' });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 6 characters long.' });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // TODO: Optionally log the user in or send a confirmation email

    res.json({ message: 'Password has been reset successfully.' });
  } catch (err) {
    console.error('Reset Password Error:', err);
    let errorMessage = 'Failed to reset password.';
    if (err.name === 'ValidationError') {
      // This might happen if the new password fails validation
      errorMessage = Object.values(err.errors)
        .map((e) => e.message)
        .join(', ');
      return res.status(400).json({ message: errorMessage });
    }
    res
      .status(500)
      .json({ message: 'Error resetting password.', error: err.message });
  }
};
