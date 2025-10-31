const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validateRegister, validateLogin, handleValidationErrors } = require('../middleware/validate');

// Authentication routes
router.post('/register', validateRegister, handleValidationErrors, authController.register);
router.post('/login', validateLogin, handleValidationErrors, authController.login);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);
router.patch('/me', authenticate, authController.updateMe);

// Debug route - Check current user info
router.get('/whoami', authenticate, (req, res) => {
  res.json({
    userId: req.userId,
    userRole: req.userRole,
    userName: req.user.name,
    userEmail: req.user.email,
    message: `You are currently logged in as: ${req.userRole}`
  });
});

// Switch user role (useful for testing)
router.patch('/switch-role/:newRole', authenticate, async (req, res) => {
  try {
    const User = require('../models/User');
    const jwt = require('jsonwebtoken');
    
    const { newRole } = req.params;
    
    // Validate role
    if (!['student', 'teacher', 'admin'].includes(newRole)) {
      return res.status(400).json({ error: 'Invalid role. Must be student, teacher, or admin.' });
    }
    
    // Update user role in database
    const user = await User.findByIdAndUpdate(
      req.userId,
      { role: newRole },
      { new: true }
    ).select('-passwordHash');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Generate new token with updated role
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
    
    res.json({
      message: `Role changed to ${newRole} successfully!`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Switch role error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
