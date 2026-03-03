const mongoose = require('mongoose');

const universalCourseSchema = new mongoose.Schema({
  courseName: { type: String, required: true },
  provider: {
    type: String,
    required: true,
    enum: ['Udemy', 'Coursera', 'AWS', 'Oracle', 'Pega', 'LinkedIn Learning', 'Other'],
  },
  description: { type: String },
  duration: { type: String }, // e.g., "10 hours", "4 weeks"
  skillLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner',
  },
  price: { type: Number, default: 0 },
  isFree: { type: Boolean, default: false },
  courseUrl: { type: String },
  thumbnail: { type: String },
  tags: [{ type: String }],
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalRatings: { type: Number, default: 0 },
  reviews: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      rating: Number,
      comment: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('UniversalCourse', universalCourseSchema);
