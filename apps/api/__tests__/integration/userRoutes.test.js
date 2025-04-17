const request = require('supertest');
const express = require('express');
const userRoutes = require('../../routes/userRoutes');
const User = require('../../models/User');

// Mock express app for testing routes
const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

describe('User Routes', () => {
  describe('POST /api/users/register', () => {
    it('should register a new user', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      // Check response
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', userData.email);
      expect(response.body.user).toHaveProperty('role', 'author');

      // Check database
      const savedUser = await User.findOne({ email: userData.email });
      expect(savedUser).toBeTruthy();
    });

    it('should return 400 for invalid user data', async () => {
      const invalidData = {
        email: 'notanemail',
        password: 'pass',
      };

      await request(app)
        .post('/api/users/register')
        .send(invalidData)
        .expect(400);
    });
  });

  describe('POST /api/users/login', () => {
    beforeEach(async () => {
      // Create test user
      const user = new User({
        email: 'existing@example.com',
        password: 'password123',
      });
      await user.save();
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'existing@example.com',
          password: 'password123',
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
    });

    it('should reject login with invalid credentials', async () => {
      await request(app)
        .post('/api/users/login')
        .send({
          email: 'existing@example.com',
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });
});
