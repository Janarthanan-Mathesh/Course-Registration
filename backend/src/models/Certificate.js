const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  enrollment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enrollment',
  },
  courseType: {
    type: String,
    enum: ['academic', 'universal'],
    required: true,
  },
  courseName: { type: String, required: true },
  courseProvider: { type: String, required: true, trim: true },
  skillsLearned: { type: String, required: true, trim: true },
  durationHours: { type: Number, required: true, min: 0 },
  fileUrl: { type: String, required: true },
  fileName: { type: String },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  isApproved: { type: Boolean, default: false },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: { type: Date },
  verificationNotes: { type: String, default: '' },
  rejectionReason: { type: String, default: '' },
  uploadedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Certificate', certificateSchema);
