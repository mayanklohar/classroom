const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateCreateClass, handleValidationErrors, validatePagination } = require('../middleware/validate');

// JOIN ROUTE MUST BE FIRST - BEFORE ANY /:id ROUTES
router.post('/join',
  authenticate,
  authorize('student'),
  classController.joinClassByCode
);

// Create class
router.post('/', 
  authenticate, 
  authorize('teacher', 'admin'),
  validateCreateClass,
  handleValidationErrors,
  classController.createClass
);

// Get all classes
router.get('/',
  authenticate,
  validatePagination,
  handleValidationErrors,
  classController.getClasses
);

// Get single class by ID
router.get('/:id', 
  authenticate,
  async (req, res, next) => {
    // Custom middleware to check class access for getClassById
    try {
      const Class = require('../models/Class');
      const classId = req.params.id;
      

      
      const classDoc = await Class.findById(classId);
      
      if (!classDoc) {
        return res.status(404).json({ error: 'Class not found' });
      }

      // Admin has access to all classes
      if (req.userRole === 'admin') {
        return next();
      }

      // Check if user is teacher of the class
      if (classDoc.teacherId.toString() === req.userId) {
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

      next();
    } catch (error) {
      console.error('Error checking class access:', error);
      res.status(500).json({ error: 'Server error checking class access' });
    }
  },
  classController.getClassById
);

// Enroll student
router.post('/:id/enroll',
  authenticate,
  authorize('teacher', 'admin'),
  classController.enrollStudent
);

// Remove student
router.delete('/:id/members/:userId',
  authenticate,
  authorize('teacher', 'admin'),
  classController.removeStudent
);

module.exports = router;
