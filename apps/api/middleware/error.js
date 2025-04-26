class ErrorResponse extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
  
      // Helps V8 optimize performance
      Error.captureStackTrace(this, this.constructor);
    }
  }

const errorHandler = (err, req, res, next) => {
  let error = { ...err };

  error.message = err.message;


  console.error('ERROR ==>', error.message || err);
  // console.error(err.stack);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found`; // Avoid leaking ID structure
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate field value entered for field '${field}'.`;
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    const message = `Validation Error: ${messages.join('. ')}`;
    error = new ErrorResponse(message, 400);
  }

  // JsonWebTokenError (e.g., invalid token)
  if (err.name === 'JsonWebTokenError') {
    const message = 'Not authorized to access this route (Invalid Token)';
    error = new ErrorResponse(message, 401);
  }

  // TokenExpiredError
  if (err.name === 'TokenExpiredError') {
    const message = 'Not authorized to access this route (Token Expired)';
    error = new ErrorResponse(message, 401);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
};

module.exports = errorHandler; 