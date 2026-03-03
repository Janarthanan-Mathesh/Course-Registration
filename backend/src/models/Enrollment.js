const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  courseType: {
    type: String,
    enum: ['academic', 'universal'],
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'courseModel',
  },
  courseModel: {
    type: String,
    required: true,
    enum: ['AcademicCourse', 'UniversalCourse'],
  },
  status: {
    type: String,
    enum: ['enrolled', 'ongoing', 'completed'],
    default: 'enrolled',
  },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  enrolledAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  isWishlisted: { type: Boolean, default: false },
}, { timestamps: true });

// Prevent duplicate enrollments
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
