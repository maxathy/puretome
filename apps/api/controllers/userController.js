const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { isEmail } = require('validator');
const storageService = require('../services/storageService'); // Import storage service

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

// PUT /api/users/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, bio } = req.body;
    const userId = req.user.id;
    const avatarFile = req.file; // Get the uploaded file from multer

    // Validate inputs
    if (name && (typeof name !== 'string' || name.trim().length === 0)) {
      return res.status(400).json({ message: 'Name must be a valid string.' });
    }
    // Add validation for bio if needed

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    let oldAvatarUrl = user.avatar; // Store old avatar URL before updating
    let newAvatarUrl = user.avatar; // Initialize with current avatar

    // Handle avatar upload if a file is provided
    if (avatarFile) {
      try {
        // Define a folder for avatars (optional, but good practice)
        const avatarFolder = `avatars/${userId}`;
        newAvatarUrl = await storageService.uploadFile(avatarFile, avatarFolder);
        user.avatar = newAvatarUrl; // Update user's avatar URL
      } catch (uploadError) {
        console.error('Avatar Upload Error:', uploadError);
        // Decide if the profile update should fail entirely or just skip avatar update
        return res.status(500).json({
          message: 'Failed to upload avatar.',
          error: uploadError.message,
        });
      }
    }

    // Update other user fields if provided
    if (name) user.name = name.trim();
    if (bio !== undefined) user.bio = bio; // Allow setting bio to empty string

    // Save the updated user
    await user.save();

    // Delete the old avatar *after* successfully saving the new one
    if (avatarFile && oldAvatarUrl && oldAvatarUrl !== newAvatarUrl) {
      try {
        await storageService.deleteFile(oldAvatarUrl);
      } catch (deleteError) {
        // Log the error but don't fail the request, as the profile is already updated
        console.error('Failed to delete old avatar:', oldAvatarUrl, deleteError);
      }
    }

    // Return the updated user without password
    const userData = user.toObject();
    delete userData.password; // Ensure password is not sent back

    res.json({ message: 'Profile updated successfully', user: userData });
  } catch (err) {
    console.error('Profile Update Error:', err);
    // Handle potential validation errors during save
    if (err.name === 'ValidationError') {
         const messages = Object.values(err.errors).map((val) => val.message);
         return res.status(400).json({
           message: `Validation failed: ${messages.join('. ')}`,
           errors: err.errors,
         });
    }
    res.status(500).json({
      message: 'Profile update failed due to an internal error.',
      error: err.message,
    });
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
