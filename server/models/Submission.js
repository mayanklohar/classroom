const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  linkOrFiles: [{
    type: {
      type: String,
      enum: ['link', 'file']
    },
    value: String,  // URL for link, filename for file
    path: String,   // File path (only for files)
    mimetype: String,
    size: Number
  }],
  submittedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['submitted', 'graded', 'missing', 'late'],
    default: 'submitted'
  },
  grade: {
    score: {
      type: Number,
      min: 0
    },
    max: {
      type: Number,
      default: 100
    },
    rubric: String
  },
  feedback: {
    type: String,
    maxlength: [1000, 'Feedback cannot exceed 1000 characters']
  },
  comments: [{
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Compound index for faster queries
submissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Submission', submissionSchema);
