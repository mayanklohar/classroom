const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { validateGradeSubmission, handleValidationErrors, validatePagination } = require('../middleware/validate');

// Submit assignment (with file upload)
router.post('/assignments/:assignmentId/submissions',
  authenticate,
  authorize('student'),
  upload.array('files', 5),
  submissionController.createSubmission
);

// Get submissions for an assignment (teacher view)
router.get('/assignments/:assignmentId/submissions',
  authenticate,
  authorize('teacher', 'admin'),
  validatePagination,
  handleValidationErrors,
  submissionController.getSubmissions
);

// Get my submissions (student view)
router.get('/submissions/me',
  authenticate,
  authorize('student'),
  validatePagination,
  handleValidationErrors,
  submissionController.getMySubmissions
);

// Get all submissions for teacher's assignments
router.get('/submissions/teacher',
  authenticate,
  authorize('teacher'),
  validatePagination,
  handleValidationErrors,
  submissionController.getTeacherSubmissions
);

// Grade submission
router.patch('/submissions/:id/grade',
  authenticate,
  authorize('teacher', 'admin'),
  validateGradeSubmission,
  handleValidationErrors,
  submissionController.gradeSubmission
);

// Add comment
router.post('/submissions/:id/comments',
  authenticate,
  submissionController.addComment
);

module.exports = router;
