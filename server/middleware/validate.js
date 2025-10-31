const { body, param, query, validationResult } = require('express-validator');

// Validation error handler
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    console.log('Request body:', req.body);
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array() 
    });
  }
  next();
};

// Auth validation rules
exports.validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required')
    .isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
  body('email').isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['student', 'teacher', 'admin']).withMessage('Invalid role')
];

exports.validateLogin = [
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];

// Class validation rules
exports.validateCreateClass = [
  body('title').trim().notEmpty().withMessage('Class title is required')
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  body('code').trim().notEmpty().withMessage('Class code is required')
    .isLength({ min: 3, max: 20 }).withMessage('Code must be 3-20 characters'),
  body('description').optional().isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
];

// Assignment validation rules
exports.validateCreateAssignment = [
  body('title').trim().notEmpty().withMessage('Assignment title is required')
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('dueAt').isISO8601().withMessage('Invalid due date format')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Due date must be in the future');
      }
      return true;
    }),
  body('maxScore').optional().isInt({ min: 1 }).withMessage('Max score must be a positive integer')
];

// Submission validation rules
exports.validateGradeSubmission = [
  body('score').isFloat({ min: 0 }).withMessage('Score must be a non-negative number'),
  body('feedback').optional().isLength({ max: 1000 })
    .withMessage('Feedback cannot exceed 1000 characters')
];

// Pagination validation
exports.validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];
