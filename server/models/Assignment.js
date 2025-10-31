const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Assignment title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  dueAt: {
    type: Date,
    required: [true, 'Due date is required']
  },
  attachments: [{
    filename: String,
    path: String,
    mimetype: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  visibility: {
    type: String,
    enum: ['visible', 'hidden'],
    default: 'visible'
  },
  maxScore: {
    type: Number,
    default: 100
  },
  locked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Assignment', assignmentSchema);
