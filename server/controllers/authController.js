const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT token
const generateToken = (userId, email, role) => {
  return jwt.sign(
    { userId, email, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      email,
      passwordHash,
      role: role || 'student'
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id, user.email, user.role);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user._id, user.email, user.role);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-passwordHash');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching profile' });
  }
};

// @route   PATCH /api/auth/me
// @desc    Update current user profile
// @access  Private
exports.updateMe = async (req, res) => {
  try {
    const { name, profile } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (profile) updateData.profile = { ...profile };

    const user = await User.findByIdAndUpdate(
      req.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-passwordHash');

    res.json({ 
      message: 'Profile updated successfully', 
      user 
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error updating profile' });
  }
};

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
exports.logout = async (req, res) => {
  res.json({ message: 'Logout successful' });
};
