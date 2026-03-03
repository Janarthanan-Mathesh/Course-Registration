const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const Certificate = require('../models/Certificate');

// @desc  Get current user profile
// @route GET /api/users/me
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -emailOtp -phoneOtp -resetPasswordToken');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Update user profile
// @route PUT /api/users/me
const updateProfile = async (req, res) => {
  try {
    const { username, phone, linkedinLink, githubLink, profileImage } = req.body;
    const updates = {};
    if (username) updates.username = username;
    if (phone) updates.phone = phone;
    if (linkedinLink !== undefined) updates.linkedinLink = linkedinLink;
    if (githubLink !== undefined) updates.githubLink = githubLink;
    if (profileImage) updates.profileImage = profileImage;

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Change password
// @route PUT /api/users/change-password
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(oldPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get user dashboard stats
// @route GET /api/users/dashboard
const getDashboard = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user._id })
      .populate('course', 'courseName courseCode provider')
      .sort({ updatedAt: -1 });

    const completed = enrollments.filter((e) => e.status === 'completed');
    const ongoing = enrollments.filter((e) => e.status === 'ongoing');
    const academic = enrollments.filter((e) => e.courseType === 'academic');
    const universal = enrollments.filter((e) => e.courseType === 'universal');

    const certificates = await Certificate.find({ user: req.user._id });
    const approvedCertificates = certificates.filter((c) => c.isApproved);

    res.json({
      success: true,
      dashboard: {
        totalEnrolled: enrollments.length,
        completed: completed.length,
        ongoing: ongoing.length,
        academicCourses: academic.length,
        universalCourses: universal.length,
        certificatesUploaded: certificates.length,
        certificatesApproved: approvedCertificates.length,
        points: req.user.points,
        badges: req.user.badges,
        streak: req.user.streak,
        recentCourses: enrollments.slice(0, 5),
        ongoingCourses: ongoing,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get activity logs
// @route GET /api/users/activity
const getActivityLogs = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('activityLogs lastLogin');
    res.json({ success: true, logs: user.activityLogs, lastLogin: user.lastLogin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getProfile, updateProfile, changePassword, getDashboard, getActivityLogs };
