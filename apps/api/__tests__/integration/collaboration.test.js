// apps/api/__tests__/integration/collaboration.test.js
const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const memoirRoutes = require('../../routes/memoirRoutes');
const User = require('../../models/User');
const Memoir = require('../../models/Memoir');
const jwt = require('jsonwebtoken');

// Mock express app for testing routes
const app = express();
app.use(express.json());
app.use('/api/memoir', memoirRoutes);

describe('Collaboration Features', () => {
  let authorUser, collaboratorUser, authorToken, collaboratorToken, memoirId;

  beforeEach(async () => {
    // Create test users
    authorUser = new User({
      email: 'author@example.com',
      password: 'password123',
    });
    await authorUser.save();

    collaboratorUser = new User({
      email: 'collaborator@example.com',
      password: 'password123',
    });
    await collaboratorUser.save();

    // Generate tokens
    authorToken = jwt.sign(
      { id: authorUser._id, role: 'author' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' },
    );

    collaboratorToken = jwt.sign(
      { id: collaboratorUser._id, role: 'author' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' },
    );

    // Create a test memoir
    const memoir = new Memoir({
      title: 'Test Memoir',
      content: 'Test content',
      author: authorUser._id,
      chapters: [
        {
          title: 'Chapter 1',
          events: [{ title: 'Event 1', content: 'Event content' }],
        },
      ],
    });
    await memoir.save();
    memoirId = memoir._id.toString();
  });

  describe('Inviting collaborators', () => {
    it('should allow memoir author to invite collaborators', async () => {
      const response = await request(app)
        .post(`/api/memoir/${memoirId}/collaborators`)
        .set('Authorization', `Bearer ${authorToken}`)
        .send({
          email: 'newcollaborator@example.com',
          role: 'editor',
        })
        .expect(200);

      expect(response.body).toHaveProperty(
        'message',
        'Collaborator invitation sent',
      );
      expect(response.body.collaborator).toHaveProperty('role', 'editor');
      expect(response.body.collaborator).toHaveProperty(
        'inviteStatus',
        'pending',
      );
    });

    it('should not allow non-authors to invite collaborators', async () => {
      await request(app)
        .post(`/api/memoir/${memoirId}/collaborators`)
        .set('Authorization', `Bearer ${collaboratorToken}`)
        .send({
          email: 'another@example.com',
          role: 'viewer',
        })
        .expect(404); // Not found because collaborator doesn't own this memoir
    });
  });
});
