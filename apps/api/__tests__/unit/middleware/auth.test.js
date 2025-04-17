const jwt = require('jsonwebtoken');
const { authMiddleware, authorizeRoles } = require('../../../middleware/auth');

// Mock JWT secret
const JWT_SECRET = 'secret';
process.env.JWT_SECRET = JWT_SECRET;

describe('Authentication Middleware', () => {
  describe('authMiddleware', () => {
    it('should set req.user with valid token', () => {
      // Create valid token
      const user = { id: '123', role: 'author' };
      const token = jwt.sign(user, JWT_SECRET);

      // Mock request/response/next
      const req = { headers: { authorization: `Bearer ${token}` } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      // Call middleware
      authMiddleware(req, res, next);

      // Should call next and set req.user
      expect(next).toHaveBeenCalled();
      expect(req.user).toEqual(expect.objectContaining(user));
    });

    it('should return 401 with invalid token', () => {
      // Mock request/response/next
      const req = { headers: { authorization: 'Bearer invalid' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      // Call middleware
      authMiddleware(req, res, next);

      // Should return 401
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(String),
        }),
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('authorizeRoles', () => {
    it('should call next when user has allowed role', () => {
      // Mock request/response/next
      const req = { user: { role: 'admin' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      // Call middleware
      const middleware = authorizeRoles('admin', 'publisher');
      middleware(req, res, next);

      // Should call next
      expect(next).toHaveBeenCalled();
    });

    it('should return 403 when user has unauthorized role', () => {
      // Mock request/response/next
      const req = { user: { role: 'author' } };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      // Call middleware
      const middleware = authorizeRoles('admin', 'publisher');
      middleware(req, res, next);

      // Should return 403
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Access denied',
        }),
      );
      expect(next).not.toHaveBeenCalled();
    });
  });
});
