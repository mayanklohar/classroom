const Assignment = require('../models/Assignment');
const Class = require('../models/Class');

// @route   POST /api/classes/:classId/assignments
// @desc    Create new assignment
// @access  Private (Teacher, Admin)
exports.createAssignment = async (req, res) => {
  try {
    const { title, description, dueAt, maxScore } = req.body;
    const classId = req.params.classId;

    // Verify class exists
    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      return res.status(404).json({ error: 'Class not found' });
    }

    const attachments = req.files ? req.files.map(file => ({
      filename: file.originalname,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size
    })) : [];

    const assignment = new Assignment({
      classId,
      title,
      description,
      dueAt,
      attachments,
      createdBy: req.userId,
      maxScore: maxScore || 100
    });

    await assignment.save();

    res.status(201).json({
      message: 'Assignment created successfully',
      assignment
    });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ error: 'Server error creating assignment' });
  }
};

// @route   GET /api/classes/:classId/assignments
// @desc    Get all assignments for a class
// @access  Private
exports.getAssignments = async (req, res) => {
  try {
    const { classId } = req.params;
    const { page = 1, limit = 10, q, statusFilter } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);



    let query = { classId };

    // Search filter
    if (q) {
      query.title = { $regex: q, $options: 'i' };
    }

    // Status filter (upcoming, overdue)
    if (statusFilter === 'upcoming') {
      query.dueAt = { $gte: new Date() };
    } else if (statusFilter === 'overdue') {
      query.dueAt = { $lt: new Date() };
    }

    const assignments = await Assignment.find(query)
      .populate('createdBy', 'name email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ dueAt: 1 });

    // Add submission information based on user role
    if (req.userRole === 'teacher' || req.userRole === 'admin') {
      const Submission = require('../models/Submission');
      
      const assignmentsWithSubmissions = await Promise.all(
        assignments.map(async (assignment) => {
          const submissionCount = await Submission.countDocuments({
            assignmentId: assignment._id
          });
          
          return {
            ...assignment.toObject(),
            submissionCount
          };
        })
      );
      
      const total = await Assignment.countDocuments(query);
      
      return res.json({
        assignments: assignmentsWithSubmissions,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit)
        }
      });
    }

    // If user is a student, add submission status for each assignment
    if (req.userRole === 'student') {
      const Submission = require('../models/Submission');
      
      const assignmentsWithStatus = await Promise.all(
        assignments.map(async (assignment) => {
          const submission = await Submission.findOne({
            assignmentId: assignment._id,
            studentId: req.userId
          });
          
          return {
            ...assignment.toObject(),
            isSubmitted: !!submission,
            submissionStatus: submission?.status || 'not_submitted'
          };
        })
      );
      
      const total = await Assignment.countDocuments(query);
      
      return res.json({
        assignments: assignmentsWithStatus,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          limit: parseInt(limit)
        }
      });
    }

    const total = await Assignment.countDocuments(query);

    res.json({
      assignments,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: 'Server error fetching assignments' });
  }
};

// @route   GET /api/assignments/:id
// @desc    Get single assignment
// @access  Private
exports.getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('classId', 'title code');

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.json({ assignment });
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching assignment' });
  }
};

// @route   PATCH /api/assignments/:id
// @desc    Update assignment
// @access  Private (Teacher, Admin)
exports.updateAssignment = async (req, res) => {
  try {
    const { title, description, dueAt, visibility, maxScore } = req.body;

    const assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      { title, description, dueAt, visibility, maxScore },
      { new: true, runValidators: true }
    );

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.json({
      message: 'Assignment updated successfully',
      assignment
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error updating assignment' });
  }
};

// @route   DELETE /api/assignments/:id
// @desc    Delete assignment
// @access  Private (Teacher, Admin)
exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error deleting assignment' });
  }
};
