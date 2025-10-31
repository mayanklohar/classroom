const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const { authenticate, authorize, checkClassMembership } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { validateCreateAssignment, handleValidationErrors, validatePagination } = require('../middleware/validate');

// Create assignment with file uploads
router.post('/classes/:classId/assignments',
  authenticate,
  authorize('teacher', 'admin'),
  upload.array('attachments', 5),
  validateCreateAssignment,
  handleValidationErrors,
  assignmentController.createAssignment
);

// Get assignments for a class
router.get('/classes/:classId/assignments',
  authenticate,
  checkClassMembership,
  validatePagination,
  handleValidationErrors,
  assignmentController.getAssignments
);

// Get single assignment
router.get('/assignments/:id',
  authenticate,
  assignmentController.getAssignmentById
);

// Update assignment
router.patch('/assignments/:id',
  authenticate,
  authorize('teacher', 'admin'),
  assignmentController.updateAssignment
);

// Delete assignment
router.delete('/assignments/:id',
  authenticate,
  authorize('teacher', 'admin'),
  assignmentController.deleteAssignment
);

module.exports = router;
