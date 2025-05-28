const jwt = require('jsonwebtoken');
const User = require('../../../../models/lib/User');
const JWT_SECRET = process.env.JWT_SECRET;

// Improved auth middleware
exports.auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('x-auth-token');
    
    // Check if no token
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token, authorization denied'
      });
    }

    // Validate token format (optional but helpful)
    if (!token.trim()) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format'
      });
    }

    // Verify token with more robust error handling
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (verifyError) {
      console.error('Token verification error:', verifyError);
      
      // Specific error handling
      if (verifyError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Malformed authentication token',
          error: verifyError.message
        });
      }
      
      if (verifyError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Authentication token has expired',
          error: verifyError.message
        });
      }

      // Generic token error
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token',
        error: verifyError.message
      });
    }
   
    // Get user from database, excluding password
    const user = await User.findById(decoded.id).select('-password');
   
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Set user in request object
    req.user = user;
    next();
  } catch (err) {
    console.error('Unexpected authentication error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication',
      error: err.message
    });
  }
};

// Role-based access middleware remains the same
exports.checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role ${req.user.role} is not authorized to access this resource`
      });
    }
    next();
  }
};

exports.checkRoleAdmin = (role) => {
  return (req, res, next) => {
    // Make sure a user exists and is authenticated first
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    // Check if user has the required role
    if (req.user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `Access denied. ${role} role required.`
      });
    }

    next();
  };
};