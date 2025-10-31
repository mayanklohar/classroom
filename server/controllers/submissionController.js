const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');

// @route   POST /api/assignments/:assignmentId/submissions
// @desc    Create/update submission
// @access  Private (Student)
exports.createSubmission = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { link } = req.body;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Check if submission already exists
    let submission = await Submission.findOne({
      assignmentId,
      studentId: req.userId
    });

    const linkOrFiles = [];

    // Add link if provided
    if (link) {
      linkOrFiles.push({
        type: 'link',
        value: link
      });
    }

    // Add files if uploaded
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        linkOrFiles.push({
          type: 'file',
          value: file.originalname,
          path: file.path,
          mimetype: file.mimetype,
          size: file.size
        });
      });
    }

    // Determine status (late or submitted)
    const status = new Date() > assignment.dueAt ? 'late' : 'submitted';

    if (submission) {
      // Update existing submission
      submission.linkOrFiles = linkOrFiles;
      submission.submittedAt = new Date();
      submission.status = status;
      await submission.save();
    } else {
      // Create new submission
      submission = new Submission({
        assignmentId,
        studentId: req.userId,
        linkOrFiles,
        status
      });
      await submission.save();
    }

    res.status(201).json({
      message: 'Submission saved successfully',
      submission
    });
  } catch (error) {
    console.error('Create submission error:', error);
    res.status(500).json({ error: 'Server error creating submission' });
  }
};

// @route   GET /api/assignments/:assignmentId/submissions
// @desc    Get all submissions for an assignment (Teacher view)
// @access  Private (Teacher, Admin)
exports.getSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = { assignmentId };
    if (status) {
      query.status = status;
    }

    const submissions = await Submission.find(query)
      .populate('studentId', 'name email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ submittedAt: -1 });

    const total = await Submission.countDocuments(query);

    res.json({
      submissions,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching submissions' });
  }
};

// @route   GET /api/submissions/me
// @desc    Get current student's submissions
// @access  Private (Student)
exports.getMySubmissions = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const submissions = await Submission.find({ studentId: req.userId })
      .populate('assignmentId', 'title dueAt classId')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ submittedAt: -1 });

    const total = await Submission.countDocuments({ studentId: req.userId });

    res.json({
      submissions,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching submissions' });
  }
};

// @route   GET /api/submissions/teacher
// @desc    Get all submissions for teacher's assignments
// @access  Private (Teacher)
exports.getTeacherSubmissions = async (req, res) => {
  try {
    const { page = 1, limit = 50, status, classId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // First, get all assignments created by this teacher
    let assignmentQuery = { createdBy: req.userId };
    if (classId) {
      assignmentQuery.classId = classId;
    }

    const assignments = await Assignment.find(assignmentQuery).select('_id');
    const assignmentIds = assignments.map(a => a._id);

    if (assignmentIds.length === 0) {
      return res.json({
        submissions: [],
        pagination: {
          total: 0,
          page: parseInt(page),
          pages: 0,
          limit: parseInt(limit)
        }
      });
    }

    // Build submission query
    let submissionQuery = { assignmentId: { $in: assignmentIds } };
    if (status) {
      submissionQuery.status = status;
    }

    const submissions = await Submission.find(submissionQuery)
      .populate('studentId', 'name email')
      .populate({
        path: 'assignmentId',
        select: 'title dueAt maxScore classId',
        populate: {
          path: 'classId',
          select: 'title'
        }
      })
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ submittedAt: -1 });

    const total = await Submission.countDocuments(submissionQuery);

    res.json({
      submissions,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching teacher submissions:', error);
    res.status(500).json({ error: 'Server error fetching submissions' });
  }
};

// @route   PATCH /api/submissions/:id/grade
// @desc    Grade a submission
// @access  Private (Teacher, Admin)
exports.gradeSubmission = async (req, res) => {
  try {
    const { score, feedback, rubric } = req.body;
    const submissionId = req.params.id;

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    submission.grade = {
      score,
      max: submission.grade?.max || 100,
      rubric
    };
    submission.feedback = feedback;
    submission.status = 'graded';

    await submission.save();

    res.json({
      message: 'Submission graded successfully',
      submission
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error grading submission' });
  }
};

// @route   POST /api/submissions/:id/comments
// @desc    Add comment to submission
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const submissionId = req.params.id;

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    submission.comments.push({
      authorId: req.userId,
      text
    });

    await submission.save();

    res.json({
      message: 'Comment added successfully',
      submission
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error adding comment' });
  }
};
