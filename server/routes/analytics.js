const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate, authorize } = require('../middleware/auth');

// Grade distribution for a class
router.get('/class/:classId/grades',
  authenticate,
  authorize('teacher', 'admin'),
  analyticsController.getGradeDistribution
);

// Teacher stats
router.get('/teacher/stats',
  authenticate,
  authorize('teacher'),
  analyticsController.getTeacherStats
);

module.exports = router;
