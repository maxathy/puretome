const express = require('express');
const jwt = require('jsonwebtoken');
const { isEmail } = require('validator');
const router = express.Router();
const User = require('../models/User');
const userController = require('../controllers/userController');

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
