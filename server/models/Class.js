const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Class title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  code: {
    type: String,
    required: [true, 'Class code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    roleInClass: {
      type: String,
      enum: ['student', 'teacher'],
      default: 'student'
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    }
  }],
  archived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Class', classSchema);
