// Mock dependencies
const express = require('express');
const request = require('supertest');
const userRoutes = require('../routes/userRoutes');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const validator = require('validator');

// Mock modules
jest.mock('../models/User');
jest.mock('jsonwebtoken');
jest.mock('validator');

// Setup app for testing
const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

describe('User Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/users/register', () => {
    test('should register a new user', async () => {
      const mockUserInstance = {
        _id: 'mockUserId',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
        save: jest.fn().mockResolvedValue(true),
        toObject: jest.fn().mockReturnValue({
          _id: 'mockUserId',
          name: 'Test User',
          email: 'test@example.com',
          role: 'user',
        }),
      };

      User.findOne.mockResolvedValue(null);
      // Mock the constructor
      User.mockImplementation(() => mockUserInstance);
      validator.isEmail.mockReturnValue(true);
      jwt.sign.mockReturnValue('mockToken');

      const response = await request(app).post('/api/users/register').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(201);
      expect(response.body.token).toBe('mockToken');
      expect(response.body.user).toEqual({
        _id: 'mockUserId',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
      });
      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(User).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });
      expect(mockUserInstance.save).toHaveBeenCalled();
    });

    test('should return 400 if name is missing', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Full name is required.');
    });

    test('should return 400 if email is invalid', async () => {
      validator.isEmail.mockReturnValue(false);

      const response = await request(app).post('/api/users/register').send({
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123',
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid email format.');
    });

    test('should return 400 if password is too short', async () => {
      validator.isEmail.mockReturnValue(true);

      const response = await request(app).post('/api/users/register').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'short',
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        'Password must be at least 6 characters long.',
      );
    });

    test('should return 400 if email already registered', async () => {
      validator.isEmail.mockReturnValue(true);
      User.findOne.mockResolvedValue({ email: 'test@example.com' });

      const response = await request(app).post('/api/users/register').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email already registered.');
    });
  });

  describe('POST /api/users/login', () => {
    test('should login a user', async () => {
      const mockUser = {
        _id: 'mockUserId',
        email: 'test@example.com',
        role: 'user',
        comparePassword: jest.fn().mockResolvedValue(true),
      };

      User.findOne.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('mockToken');

      const response = await request(app)
        .post('/api/users/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body.token).toBe('mockToken');
      // The route returns the full user object on login
      //   expect(response.body.user).toEqual(mockUser);
      expect(mockUser.comparePassword).toHaveBeenCalledWith('password123');
    });

    test('should return 401 for invalid credentials (user not found)', async () => {
      User.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/users/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });

    test('should return 401 if password does not match', async () => {
      const mockUser = {
        _id: 'mockUserId',
        email: 'test@example.com',
        comparePassword: jest.fn().mockResolvedValue(false), // Password check fails
      };

      User.findOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/users/login')
        .send({ email: 'test@example.com', password: 'wrongpassword' });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Invalid credentials');
    });
  });

  describe('POST /api/users/forgot-password', () => {
    test('should generate reset token', async () => {
      const mockUser = {
        _id: 'userId',
        email: 'test@example.com',
        generateResetToken: jest.fn().mockReturnValue('resetToken'),
        save: jest.fn().mockResolvedValue(true),
      };
      User.findOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/users/forgot-password')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe(
        'If your email is registered, you will receive a password reset link.',
      );
      expect(mockUser.generateResetToken).toHaveBeenCalled();
      expect(mockUser.save).toHaveBeenCalled();
    });

    test('should return success message even if user not found', async () => {
      User.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/users/forgot-password')
        .send({ email: 'nonexistent@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe(
        'If your email is registered, you will receive a password reset link.',
      );
    });
  });

  describe('POST /api/users/reset-password', () => {
    test('should reset password with valid token', async () => {
      const mockUser = {
        _id: 'mockUserId',
        resetPasswordToken: 'resetToken',
        resetPasswordExpires: Date.now() + 3600000, // Expires in 1 hour
        save: jest.fn().mockResolvedValue(true),
        // Add password field for assignment
        password: 'oldPassword',
      };

      User.findOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/users/reset-password')
        .send({ token: 'resetToken', password: 'newpassword123' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe(
        'Password has been reset successfully.',
      );
      expect(mockUser.password).toBe('newpassword123');
      expect(mockUser.resetPasswordToken).toBeUndefined();
      expect(mockUser.resetPasswordExpires).toBeUndefined();
      expect(mockUser.save).toHaveBeenCalled();
    });

    test('should return 400 for invalid or expired token during reset', async () => {
      User.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/users/reset-password')
        .send({ token: 'invalidOrExpiredToken', password: 'newpassword123' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid or expired token');
    });
  });
});
