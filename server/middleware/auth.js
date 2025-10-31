const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token and attach user to request
exports.authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-passwordHash');
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token. User not found.' });
    }

    req.userId = decoded.userId;
    req.userRole = decoded.role;
    req.user = user;
    
    console.log('Authenticated user:', {
      id: req.userId,
      role: req.userRole,
      name: user.name
    });
    
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

// Role-based authorization middleware
// Role-based authorization middleware
exports.authorize = (...roles) => {
  return (req, res, next) => {
    console.log('=== AUTHORIZATION CHECK ===');
    console.log('Required roles:', roles);
    console.log('User role:', req.userRole);
    console.log('User ID:', req.userId);
    console.log('===========================');
    
    if (!req.userRole) {
      return res.status(403).json({ 
        error: 'Access denied. No role found in token.',
        debug: {
          userId: req.userId,
          userRole: req.userRole
        }
      });
    }
    
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({ 
        error: 'Access denied. Insufficient permissions.',
        debug: {
          required: roles,
          current: req.userRole
        }
      });
    }
    
    console.log('Authorization passed!');
    next();
  };
};


// Require specific roles
exports.requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.userRole) {
      return res.status(403).json({ 
        error: 'Access denied. No role found in token.'
      });
    }
    
    if (!roles.includes(req.userRole)) {
      return res.status(403).json({ 
        error: 'Access denied. Insufficient permissions.',
        required: roles,
        current: req.userRole
      });
    }
    
    next();
  };
};

// Check if user is member of a class
exports.checkClassMembership = async (req, res, next) => {
  try {
    const Class = require('../models/Class');
    const classId = req.params.classId || req.body.classId;
    

    
    const classDoc = await Class.findById(classId);
    
    if (!classDoc) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // Admin has access to all classes
    if (req.userRole === 'admin') {
      req.classDoc = classDoc;
      return next();
    }

    // Check if user is teacher of the class
    if (classDoc.teacherId.toString() === req.userId) {
      req.classDoc = classDoc;
      req.isTeacher = true;
      return next();
    }

    // Check if user is a member
    const isMember = classDoc.members.some(
      member => member.userId.toString() === req.userId
    );

    if (!isMember) {
      return res.status(403).json({ 
        error: 'Access denied. You are not a member of this class.' 
      });
    }

    req.classDoc = classDoc;
    next();
  } catch (error) {
    console.error('Error checking class membership:', error);
    res.status(500).json({ error: 'Server error checking class membership' });
  }
};
