const bcrypt = require('bcrypt');
const User = require('../models/User');
const Class = require('../models/Class');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
// @access  Private (Admin only)
exports.getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalTeachers,
      totalClasses,
      totalAssignments,
      totalSubmissions
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'teacher' }),
      Class.countDocuments(),
      Assignment.countDocuments(),
      Submission.countDocuments()
    ]);

    res.json({
      totalUsers,
      totalStudents,
      totalTeachers,
      totalClasses,
      totalAssignments,
      totalSubmissions
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Server error fetching dashboard stats' });
  }
};

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error fetching users' });
  }
};

// @route   GET /api/admin/users/recent
// @desc    Get recent users (last 10)
// @access  Private (Admin only)
exports.getRecentUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(users);
  } catch (error) {
    console.error('Error fetching recent users:', error);
    res.status(500).json({ error: 'Server error fetching recent users' });
  }
};

// @route   GET /api/admin/users/:id
// @desc    Get user by ID
// @access  Private (Admin only)
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Server error fetching user' });
  }
};

// @route   GET /api/admin/users/:id/classes
// @desc    Get classes for a user
// @access  Private (Admin only)
exports.getUserClasses = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let classes = [];

    if (user.role === 'teacher') {
      classes = await Class.find({ teacherId: id });
    } else if (user.role === 'student') {
      classes = await Class.find({ 'members.userId': id, 'members.roleInClass': 'student' });
    }

    // Transform the data to match expected format
    const transformedClasses = classes.map(classDoc => ({
      _id: classDoc._id,
      name: classDoc.title,
      subject: classDoc.description,
      classCode: classDoc.code,
      createdAt: classDoc.createdAt
    }));

    res.json(transformedClasses);
  } catch (error) {
    console.error('Error fetching user classes:', error);
    res.status(500).json({ error: 'Server error fetching user classes' });
  }
};

// @route   GET /api/admin/users/:id/assignments
// @desc    Get assignments for a user (teacher only)
// @access  Private (Admin only)
exports.getUserAssignments = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let assignments = [];

    if (user.role === 'teacher') {
      assignments = await Assignment.find({ createdBy: id })
        .populate('classId', 'title description')
        .sort({ createdAt: -1 });
    }

    // Transform the data to match expected format
    const transformedAssignments = assignments.map(assignment => ({
      _id: assignment._id,
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueAt,
      class: assignment.classId ? {
        _id: assignment.classId._id,
        name: assignment.classId.title,
        subject: assignment.classId.description
      } : null,
      createdAt: assignment.createdAt
    }));

    res.json(transformedAssignments);
  } catch (error) {
    console.error('Error fetching user assignments:', error);
    res.status(500).json({ error: 'Server error fetching user assignments' });
  }
};

// @route   GET /api/admin/users/:id/submissions
// @desc    Get submissions for a user (student only)
// @access  Private (Admin only)
exports.getUserSubmissions = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let submissions = [];

    if (user.role === 'student') {
      submissions = await Submission.find({ student: id })
        .populate({
          path: 'assignment',
          populate: {
            path: 'class',
            select: 'name subject'
          }
        })
        .sort({ createdAt: -1 })
        .limit(20);
    }

    res.json(submissions);
  } catch (error) {
    console.error('Error fetching user submissions:', error);
    res.status(500).json({ error: 'Server error fetching user submissions' });
  }
};

// @route   POST /api/admin/users
// @desc    Create new user
// @access  Private (Admin only)
exports.createUser = async (req, res) => {
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

    // Return user without password
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    };

    res.status(201).json({
      message: 'User created successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Server error creating user' });
  }
};

// @route   PUT /api/admin/users/:id
// @desc    Update user
// @access  Private (Admin only)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { name, role },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Server error updating user' });
  }
};

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Private (Admin only)
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (id === req.userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // TODO: Clean up related data (classes, assignments, submissions)
    // This would depend on your data relationships

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Server error deleting user' });
  }
};

// @route   GET /api/admin/classes
// @desc    Get all classes
// @access  Private (Admin only)
exports.getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find()
      .populate('teacherId', 'name email')
      .populate('members.userId', 'name email')
      .sort({ createdAt: -1 });

    // Transform the data to match the expected format
    const transformedClasses = classes.map(classDoc => ({
      _id: classDoc._id,
      name: classDoc.title,
      subject: classDoc.description,
      classCode: classDoc.code,
      teacher: classDoc.teacherId,
      students: classDoc.members.filter(member => member.roleInClass === 'student').map(member => member.userId),
      createdAt: classDoc.createdAt,
      updatedAt: classDoc.updatedAt
    }));

    res.json(transformedClasses);
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ error: 'Server error fetching classes' });
  }
};

// @route   GET /api/admin/classes/:id
// @desc    Get class by ID
// @access  Private (Admin only)
exports.getClassById = async (req, res) => {
  try {
    const { id } = req.params;
    const classDoc = await Class.findById(id)
      .populate('teacherId', 'name email')
      .populate('members.userId', 'name email');

    if (!classDoc) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // Transform the data to match expected format
    const transformedClass = {
      _id: classDoc._id,
      name: classDoc.title,
      subject: classDoc.description,
      description: classDoc.description,
      classCode: classDoc.code,
      teacher: classDoc.teacherId,
      students: classDoc.members.filter(member => member.roleInClass === 'student').map(member => member.userId),
      createdAt: classDoc.createdAt,
      updatedAt: classDoc.updatedAt
    };

    res.json(transformedClass);
  } catch (error) {
    console.error('Error fetching class:', error);
    res.status(500).json({ error: 'Server error fetching class' });
  }
};

// @route   GET /api/admin/classes/:id/assignments
// @desc    Get assignments for a class
// @access  Private (Admin only)
exports.getClassAssignments = async (req, res) => {
  try {
    const { id } = req.params;
    const assignments = await Assignment.find({ classId: id })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    // Transform the data to match expected format
    const transformedAssignments = assignments.map(assignment => ({
      _id: assignment._id,
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueAt,
      teacher: assignment.createdBy,
      createdAt: assignment.createdAt
    }));

    res.json(transformedAssignments);
  } catch (error) {
    console.error('Error fetching class assignments:', error);
    res.status(500).json({ error: 'Server error fetching class assignments' });
  }
};

// @route   GET /api/admin/classes/:id/submissions
// @desc    Get submissions for a class
// @access  Private (Admin only)
exports.getClassSubmissions = async (req, res) => {
  try {
    const { id } = req.params;
    const submissions = await Submission.find()
      .populate({
        path: 'assignment',
        match: { class: id },
        populate: {
          path: 'class',
          select: 'name'
        }
      })
      .populate('student', 'name email')
      .sort({ createdAt: -1 });

    // Filter out submissions where assignment is null (not in this class)
    const filteredSubmissions = submissions.filter(sub => sub.assignment !== null);

    res.json(filteredSubmissions);
  } catch (error) {
    console.error('Error fetching class submissions:', error);
    res.status(500).json({ error: 'Server error fetching class submissions' });
  }
};

// @route   DELETE /api/admin/classes/:id
// @desc    Delete class
// @access  Private (Admin only)
exports.deleteClass = async (req, res) => {
  try {
    const { id } = req.params;

    const classDoc = await Class.findByIdAndDelete(id);

    if (!classDoc) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // TODO: Clean up related assignments and submissions

    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Error deleting class:', error);
    res.status(500).json({ error: 'Server error deleting class' });
  }
};

// @route   GET /api/admin/assignments
// @desc    Get all assignments
// @access  Private (Admin only)
exports.getAllAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate('classId', 'title description')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    // Transform the data to match the expected format
    const transformedAssignments = assignments.map(assignment => ({
      _id: assignment._id,
      title: assignment.title,
      description: assignment.description,
      dueDate: assignment.dueAt,
      class: assignment.classId ? {
        _id: assignment.classId._id,
        name: assignment.classId.title,
        subject: assignment.classId.description
      } : null,
      teacher: assignment.createdBy || { name: 'Unknown', email: 'unknown@example.com' },
      createdAt: assignment.createdAt,
      updatedAt: assignment.updatedAt
    }));

    res.json(transformedAssignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: 'Server error fetching assignments' });
  }
};

// @route   DELETE /api/admin/assignments/:id
// @desc    Delete assignment
// @access  Private (Admin only)
exports.deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findByIdAndDelete(id);

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // TODO: Clean up related submissions

    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({ error: 'Server error deleting assignment' });
  }
};

// @route   GET /api/admin/analytics/users
// @desc    Get user analytics
// @access  Private (Admin only)
exports.getUserAnalytics = async (req, res) => {
  try {
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    const usersByMonth = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.json({
      usersByRole,
      usersByMonth
    });
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({ error: 'Server error fetching user analytics' });
  }
};

// @route   GET /api/admin/analytics/classes
// @desc    Get class analytics
// @access  Private (Admin only)
exports.getClassAnalytics = async (req, res) => {
  try {
    const classesByMonth = await Class.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    const classesWithStudentCount = await Class.aggregate([
      {
        $project: {
          title: 1,
          studentCount: {
            $size: {
              $filter: {
                input: '$members',
                cond: { $eq: ['$$this.roleInClass', 'student'] }
              }
            }
          },
          createdAt: 1
        }
      }
    ]);

    res.json({
      classesByMonth,
      classesWithStudentCount
    });
  } catch (error) {
    console.error('Error fetching class analytics:', error);
    res.status(500).json({ error: 'Server error fetching class analytics' });
  }
};

// @route   GET /api/admin/analytics/assignments
// @desc    Get assignment analytics
// @access  Private (Admin only)
exports.getAssignmentAnalytics = async (req, res) => {
  try {
    const assignmentsByMonth = await Assignment.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    const submissionsByAssignment = await Submission.aggregate([
      {
        $group: {
          _id: '$assignmentId',
          submissionCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'assignments',
          localField: '_id',
          foreignField: '_id',
          as: 'assignment'
        }
      },
      {
        $unwind: '$assignment'
      },
      {
        $project: {
          assignmentTitle: '$assignment.title',
          submissionCount: 1
        }
      }
    ]);

    res.json({
      assignmentsByMonth,
      submissionsByAssignment
    });
  } catch (error) {
    console.error('Error fetching assignment analytics:', error);
    res.status(500).json({ error: 'Server error fetching assignment analytics' });
  }
};