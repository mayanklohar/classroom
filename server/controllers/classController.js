const Class = require('../models/Class');
const User = require('../models/User');

// @route   POST /api/classes
// @desc    Create new class
// @access  Private (Teacher, Admin)
exports.createClass = async (req, res) => {
  try {
    const { title, code, description } = req.body;

    // Check if code already exists
    const existingClass = await Class.findOne({ code: code.toUpperCase() });
    if (existingClass) {
      return res.status(400).json({ error: 'Class code already exists' });
    }

    const newClass = new Class({
      title,
      code: code.toUpperCase(),
      description,
      teacherId: req.userId
    });

    await newClass.save();

    res.status(201).json({
      message: 'Class created successfully',
      class: newClass
    });
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({ error: 'Server error creating class' });
  }
};

// @route   GET /api/classes
// @desc    Get all classes (filtered by user role)
// @access  Private
exports.getClasses = async (req, res) => {
  try {
    const { mine, page = 1, limit = 10, q } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};

    // Role-based filtering
    if (req.userRole === 'admin') {
      // Admin sees all classes
      if (q) {
        query.$or = [
          { title: { $regex: q, $options: 'i' } },
          { code: { $regex: q, $options: 'i' } }
        ];
      }
    } else if (req.userRole === 'teacher') {
      // Teachers see their own classes
      query.teacherId = req.userId;
      
      if (q) {
        query.$and = [
          { teacherId: req.userId },
          {
            $or: [
              { title: { $regex: q, $options: 'i' } },
              { code: { $regex: q, $options: 'i' } }
            ]
          }
        ];
      }
    } else if (req.userRole === 'student') {
      // If searching (q parameter), allow students to see all classes to join new ones
      // Otherwise, show only classes they're enrolled in
      if (q) {
        query.$or = [
          { title: { $regex: q, $options: 'i' } },
          { code: { $regex: q, $options: 'i' } }
        ];
      } else {
        // Students see only classes they're enrolled in when not searching
        query['members.userId'] = req.userId;
      }
    }

    console.log('Query:', JSON.stringify(query));
    console.log('User Role:', req.userRole);
    console.log('User ID:', req.userId);

    const classes = await Class.find(query)
      .populate('teacherId', 'name email')
      .populate('members.userId', 'name email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Class.countDocuments(query);

    console.log('Found classes:', classes.length);

    res.json({
      classes,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({ error: 'Server error fetching classes' });
  }
};

// @route   GET /api/classes/:id
// @desc    Get single class by ID
// @access  Private
exports.getClassById = async (req, res) => {
  try {
    const classDoc = await Class.findById(req.params.id)
      .populate('teacherId', 'name email profile')
      .populate('members.userId', 'name email');

    if (!classDoc) {
      return res.status(404).json({ error: 'Class not found' });
    }

    res.json({ class: classDoc });
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching class' });
  }
};

// @route   POST /api/classes/:id/enroll
// @desc    Enroll student in class
// @access  Private (Teacher, Admin)
exports.enrollStudent = async (req, res) => {
  try {
    const { studentId } = req.body;
    const classId = req.params.id;

    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // Check if student exists
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(400).json({ error: 'Invalid student ID' });
    }

    // Check if already enrolled
    const isEnrolled = classDoc.members.some(
      member => member.userId.toString() === studentId
    );

    if (isEnrolled) {
      return res.status(400).json({ error: 'Student already enrolled' });
    }

    classDoc.members.push({
      userId: studentId,
      roleInClass: 'student'
    });

    await classDoc.save();

    res.json({
      message: 'Student enrolled successfully',
      class: classDoc
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error enrolling student' });
  }
};

// @route   POST /api/classes/join
// @desc    Join class by code (student self-enrollment)
// @access  Private (Student)
exports.joinClassByCode = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Class code is required' });
    }

    // Find class by code (case-insensitive)
    const classDoc = await Class.findOne({ 
      code: code.toUpperCase() 
    }).populate('teacherId', 'name email');

    if (!classDoc) {
      return res.status(404).json({ error: 'Class not found with this code' });
    }

    // Check if student is already enrolled
    const isEnrolled = classDoc.members.some(
      member => member.userId.toString() === req.userId
    );

    if (isEnrolled) {
      return res.status(400).json({ error: 'You are already enrolled in this class' });
    }

    // Add student to class
    classDoc.members.push({
      userId: req.userId,
      roleInClass: 'student',
      enrolledAt: new Date()
    });

    await classDoc.save();

    // Populate the newly added member
    await classDoc.populate('members.userId', 'name email');

    res.json({
      message: 'Successfully joined the class',
      class: classDoc
    });
  } catch (error) {
    console.error('Join class error:', error);
    res.status(500).json({ error: 'Server error joining class' });
  }
};

// @route   DELETE /api/classes/:id/members/:userId
// @desc    Remove student from class
// @access  Private (Teacher, Admin)
exports.removeStudent = async (req, res) => {
  try {
    const { id: classId, userId } = req.params;

    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      return res.status(404).json({ error: 'Class not found' });
    }

    classDoc.members = classDoc.members.filter(
      member => member.userId.toString() !== userId
    );

    await classDoc.save();

    res.json({
      message: 'Student removed successfully',
      class: classDoc
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error removing student' });
  }
};
