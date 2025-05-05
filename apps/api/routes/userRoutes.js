const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware } = require('../middleware/auth');
const multer = require('multer'); // Import multer
const storageService = require('../services/storageService'); // We might need this later if we customize storage

// Configure multer for memory storage (or disk storage if preferred)
const upload = multer({ storage: multer.memoryStorage() });

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

/**
 * User registration endpoint
 * POST /api/users/register
 *
 * @param {Object} req.body - Contains email, password
 * @returns {Object} User data and JWT token
 */

router.post('/register', userController.registerUser);

/**
 * Update user profile endpoint
 * PUT /api/users/profile
 * Requires authentication
 * Handles optional 'avatar' file upload
 *
 * @param {Object} req.body - Contains name, bio
 * @param {File} req.file - Optional avatar file
 * @returns {Object} Updated user data
 */
// Add multer middleware here for the 'avatar' field
router.put(
  '/profile',
  authMiddleware,
  upload.single('avatar'), // Expect a single file field named 'avatar'
  userController.updateProfile,
);

/**
 * User login endpoint
 * POST /api/users/login
 *
 * @param {Object} req.body - Contains email, password
 * @returns {Object} User data and JWT token
 */

router.post('/login', userController.loginUser);

/**
 * Forgot password endpoint
 * POST /api/users/forgot-password
 *
 * @param {Object} req.body - Contains email
 * @returns {Object} Success message and reset token
 */

router.post('/forgot-password', userController.forgotPassword);

/**
 * Reset password endpoint
 * POST /api/users/reset-password
 *
 * @param {Object} req.body - Contains token, password
 * @returns {Object} Success message
 */

router.post('/reset-password', userController.resetPassword);

module.exports = router;
