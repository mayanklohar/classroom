const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, requireRole } = require('../middleware/auth');
const { validateRegister, handleValidationErrors } = require('../middleware/validate');

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireRole(['admin']));

// Dashboard stats
router.get('/stats', adminController.getDashboardStats);

// User management
router.get('/users', adminController.getAllUsers);
router.get('/users/recent', adminController.getRecentUsers);
router.get('/users/:id', adminController.getUserById);
router.get('/users/:id/classes', adminController.getUserClasses);
router.get('/users/:id/assignments', adminController.getUserAssignments);
router.get('/users/:id/submissions', adminController.getUserSubmissions);
router.post('/users', validateRegister, handleValidationErrors, adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Class management
router.get('/classes', adminController.getAllClasses);
router.get('/classes/:id', adminController.getClassById);
router.get('/classes/:id/assignments', adminController.getClassAssignments);
router.get('/classes/:id/submissions', adminController.getClassSubmissions);
router.delete('/classes/:id', adminController.deleteClass);

// Assignment management
router.get('/assignments', adminController.getAllAssignments);
router.delete('/assignments/:id', adminController.deleteAssignment);

// Analytics
router.get('/analytics/users', adminController.getUserAnalytics);
router.get('/analytics/classes', adminController.getClassAnalytics);
router.get('/analytics/assignments', adminController.getAssignmentAnalytics);

module.exports = router;