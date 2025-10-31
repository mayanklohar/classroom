const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const Class = require('../models/Class');

// @route   GET /api/analytics/class/:classId/grades
// @desc    Get grade distribution for a class
// @access  Private (Teacher, Admin)
exports.getGradeDistribution = async (req, res) => {
  try {
    const { classId } = req.params;

    // Get all assignments for this class
    const assignments = await Assignment.find({ classId });
    const assignmentIds = assignments.map(a => a._id);

    // MongoDB aggregation for grade distribution
    const distribution = await Submission.aggregate([
      {
        $match: {
          assignmentId: { $in: assignmentIds },
          status: 'graded'
        }
      },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lte: ['$grade.score', 10] }, then: '0-10' },
                { case: { $lte: ['$grade.score', 20] }, then: '11-20' },
                { case: { $lte: ['$grade.score', 30] }, then: '21-30' },
                { case: { $lte: ['$grade.score', 40] }, then: '31-40' },
                { case: { $lte: ['$grade.score', 50] }, then: '41-50' },
                { case: { $lte: ['$grade.score', 60] }, then: '51-60' },
                { case: { $lte: ['$grade.score', 70] }, then: '61-70' },
                { case: { $lte: ['$grade.score', 80] }, then: '71-80' },
                { case: { $lte: ['$grade.score', 90] }, then: '81-90' }
              ],
              default: '91-100'
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({ distribution });
  } catch (error) {
    console.error('Grade distribution error:', error);
    res.status(500).json({ error: 'Server error fetching grade distribution' });
  }
};

// @route   GET /api/analytics/teacher/stats
// @desc    Get teacher statistics
// @access  Private (Teacher)
exports.getTeacherStats = async (req, res) => {
  try {
    // Get classes taught by teacher
    const classes = await Class.find({ teacherId: req.userId });
    const classIds = classes.map(c => c._id);

    // Get assignments created by teacher
    const assignments = await Assignment.find({ classId: { $in: classIds } });
    const assignmentIds = assignments.map(a => a._id);

    // Get submissions
    const totalSubmissions = await Submission.countDocuments({
      assignmentId: { $in: assignmentIds }
    });

    const pendingSubmissions = await Submission.countDocuments({
      assignmentId: { $in: assignmentIds },
      status: 'submitted'
    });

    // Calculate average score
    const avgScoreResult = await Submission.aggregate([
      {
        $match: {
          assignmentId: { $in: assignmentIds },
          status: 'graded'
        }
      },
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$grade.score' }
        }
      }
    ]);

    const avgScore = avgScoreResult.length > 0 ? avgScoreResult[0].avgScore : 0;

    res.json({
      stats: {
        totalClasses: classes.length,
        totalAssignments: assignments.length,
        totalSubmissions,
        pendingSubmissions,
        avgScore: avgScore.toFixed(2)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching teacher stats' });
  }
};
