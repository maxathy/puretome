// Mock dependencies
const express = require('express');
const request = require('supertest');
const commentRoutes = require('../routes/commentRoutes');
const Comment = require('../models/Comment');
const Memoir = require('../models/Memoir');
const { authMiddleware } = require('../middleware/auth');

// Mock modules
jest.mock('../models/Comment');
jest.mock('../models/Memoir');
jest.mock('../middleware/auth');

// Setup app for testing
const app = express();
app.use(express.json());
app.use('/api/comments', commentRoutes);

// Mock authMiddleware to simulate logged-in user
authMiddleware.mockImplementation((req, res, next) => {
  // Simulate a logged-in user for protected routes
  req.user = { id: 'mockUserId', role: 'author' }; // Or 'collaborator' depending on test needs
  next();
});

describe('Comment Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/comments', () => {
    test('should create a new comment on a memoir', async () => {
      const mockMemoir = {
        _id: 'mockMemoirId',
        author: 'mockUserId',
        collaborators: [],
      };

      const mockCommentInstance = {
        _id: 'mockCommentId',
        memoir: 'mockMemoirId',
        chapter: null,
        event: null,
        author: 'mockUserId',
        content: 'Test comment',
        parentComment: null,
        save: jest.fn().mockResolvedValue(true),
        populate: jest.fn().mockImplementation(function () {
          // Use function for this context
          this.author = { _id: 'mockUserId', name: 'Test User' }; // Simulate population
          return Promise.resolve(this);
        }),
      };

      Memoir.findOne.mockResolvedValue(mockMemoir);
      Comment.mockImplementation(() => mockCommentInstance);

      const response = await request(app)
        .post('/api/comments')
        .send({ memoirId: 'mockMemoirId', content: 'Test comment' });

      expect(response.status).toBe(201);
      // Check the structure of the returned comment, including populated author
      expect(response.body).toEqual(
        expect.objectContaining({
          _id: 'mockCommentId',
          memoir: 'mockMemoirId',
          content: 'Test comment',
          author: { _id: 'mockUserId', name: 'Test User' },
        }),
      );
      expect(Memoir.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: 'mockMemoirId',
          $or: expect.any(Array),
        }),
      );
      expect(Comment).toHaveBeenCalledWith(
        expect.objectContaining({
          memoir: 'mockMemoirId',
          author: 'mockUserId',
          content: 'Test comment',
        }),
      );
      expect(mockCommentInstance.save).toHaveBeenCalled();
      expect(mockCommentInstance.populate).toHaveBeenCalledWith({
        path: 'author',
        select: '-password',
      });
    });

    test('should return 404 if memoir not found or user has no access', async () => {
      Memoir.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/comments')
        .send({ memoirId: 'nonExistentMemoirId', content: 'Test comment' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Memoir not found or access denied');
    });

    test('should return 500 on error during comment creation', async () => {
      // Simulate error during memoir check
      Memoir.findOne.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/comments')
        .send({ memoirId: 'mockMemoirId', content: 'Test comment' });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Database error');
    });
  });

  describe('GET /api/comments/memoir/:memoirId', () => {
    test('should get comments for a specific memoir', async () => {
      const mockMemoir = {
        _id: 'mockMemoirId',
        author: 'mockUserId',
        collaborators: [],
      };

      const mockComments = [
        { _id: 'mockCommentId1', content: 'Comment 1' },
        { _id: 'mockCommentId2', content: 'Comment 2' },
      ];

      Memoir.findOne.mockResolvedValue(mockMemoir);
      Comment.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockComments),
      });

      const response = await request(app).get(
        '/api/comments/memoir/mockMemoirId',
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockComments);
      expect(Memoir.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: 'mockMemoirId',
          $or: expect.any(Array),
        }),
      );
      expect(Comment.find).toHaveBeenCalledWith({ memoir: 'mockMemoirId' });
      expect(Comment.find().populate).toHaveBeenCalledWith({
        path: 'author',
        select: '-password',
      });
      expect(Comment.find().populate().sort).toHaveBeenCalledWith({
        createdAt: -1,
      });
    });

    test('should get comments for a specific memoir and chapter', async () => {
      const mockMemoir = { _id: 'mockMemoirId' };
      const mockComments = [{ _id: 'mockCommentId1' }];

      Memoir.findOne.mockResolvedValue(mockMemoir);
      Comment.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(mockComments),
      });

      const response = await request(app).get(
        '/api/comments/memoir/mockMemoirId?chapterId=mockChapterId',
      );

      expect(response.status).toBe(200);
      expect(Comment.find).toHaveBeenCalledWith({
        memoir: 'mockMemoirId',
        chapter: 'mockChapterId',
      });
    });

    test('should return 404 if memoir not found or user has no access when getting comments', async () => {
      Memoir.findOne.mockResolvedValue(null);

      const response = await request(app).get(
        '/api/comments/memoir/nonExistentMemoirId',
      );

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Memoir not found or access denied');
    });

    test('should return 500 on error during comment retrieval', async () => {
      // Simulate error during comment find
      Memoir.findOne.mockResolvedValue({ _id: 'mockMemoirId' }); // Assume memoir access check passes
      Comment.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest
          .fn()
          .mockRejectedValue(new Error('Database error finding comments')),
      });

      const response = await request(app).get(
        '/api/comments/memoir/mockMemoirId',
      );

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Database error finding comments');
    });
  });
});
