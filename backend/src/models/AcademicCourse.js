const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
  chapterNo: { type: Number, required: true, min: 1 },
  chapterName: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  pdfs: [
    {
      title: { type: String, required: true, trim: true },
      url: { type: String, required: true, trim: true },
    },
  ],
  externalLinks: [
    {
      label: { type: String, required: true, trim: true },
      url: { type: String, required: true, trim: true },
    },
  ],
  discourseLink: { type: String, default: '' },
}, { _id: true, timestamps: true });

const academicCourseSchema = new mongoose.Schema({
  courseCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  courseName: { type: String, required: true },
  credits: { type: Number, required: true },
  faculty: { type: String, required: true },
  description: { type: String },
  semester: { type: Number, required: true, min: 1, max: 8 },
  year: { type: Number, required: true },
  collegeDomain: {
    type: String,
    required: true,
    default: process.env.COLLEGE_DOMAIN || 'bitsathy.ac.in',
  },
  department: { type: String },
  discourseLink: { type: String, default: '' },
  chapters: [chapterSchema],
  isActive: { type: Boolean, default: true },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

module.exports = mongoose.model('AcademicCourse', academicCourseSchema);
