const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,
    select: false,
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
  },
  profileImage: {
    type: String,
    default: '',
  },
  linkedinLink: { type: String, default: '' },
  githubLink: { type: String, default: '' },
  role: {
    type: String,
    enum: ['student', 'mentor', 'admin'],
    default: 'student',
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local',
  },
  isEmailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  isBlocked: { type: Boolean, default: false },
  collegeDomain: { type: String, default: '' },
  // OTP fields
  emailOtp: { type: String },
  emailOtpExpiry: { type: Date },
  phoneOtp: { type: String },
  phoneOtpExpiry: { type: Date },
  adminOtp: { type: String },
  adminOtpExpiry: { type: Date },
  adminOtpSentTo: { type: String, default: '' },
  isAdminDeveloperVerified: { type: Boolean, default: false },
  adminVerifiedAt: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordExpiry: { type: Date },
  // Gamification
  points: { type: Number, default: 0 },
  badges: [{ type: String }],
  streak: { type: Number, default: 0 },
  lastLogin: { type: Date },
  activityLogs: [
    {
      action: String,
      timestamp: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Extract college domain from email
userSchema.pre('save', function (next) {
  if (this.email) {
    this.collegeDomain = this.email.split('@')[1] || '';
  }
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
