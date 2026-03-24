const User = require('../models/User');
const AcademicCourse = require('../models/AcademicCourse');
const UniversalCourse = require('../models/UniversalCourse');
const Enrollment = require('../models/Enrollment');
const Certificate = require('../models/Certificate');
const NON_ADMIN_ROLES = ['student', 'mentor'];

// @desc  Get platform statistics
// @route GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalAcademicCourses,
      totalUniversalCourses,
      totalEnrollments,
      totalCertificates,
      pendingCertificates,
    ] = await Promise.all([
      User.countDocuments({ role: { $in: NON_ADMIN_ROLES } }),
      AcademicCourse.countDocuments(),
      UniversalCourse.countDocuments(),
      Enrollment.countDocuments(),
      Certificate.countDocuments(),
      Certificate.countDocuments({
        $or: [
          { status: 'pending' },
          { status: { $exists: false }, isApproved: false },
        ],
      }),
    ]);

    // Most popular courses
    const popularCourses = await Enrollment.aggregate([
      { $group: { _id: '$course', count: { $sum: 1 }, courseType: { $first: '$courseType' } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalCourses: totalAcademicCourses + totalUniversalCourses,
        totalAcademicCourses,
        totalUniversalCourses,
        totalEnrollments,
        totalCertificates,
        pendingCertificates,
        popularCourses,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get all users
// @route GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter = { role: { $in: NON_ADMIN_ROLES } };
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await User.find(filter)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);
    res.json({ success: true, users, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Block / Unblock user
// @route PUT /api/admin/users/:id/block
const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot block admin users' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({
      success: true,
      message: user.isBlocked ? 'User blocked' : 'User unblocked',
      isBlocked: user.isBlocked,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get user detail for admin
// @route GET /api/admin/users/:id
const getUserDetail = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const enrollments = await Enrollment.find({ user: user._id }).populate('course');
    const certificates = await Certificate.find({ user: user._id });

    res.json({ success: true, user, enrollments, certificates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Broadcast notification to all users
// @route POST /api/admin/notify
const broadcastNotification = async (req, res) => {
  try {
    const { title, message } = req.body;
    const users = await User.find({ role: { $in: NON_ADMIN_ROLES } }).select('_id');
    const Notification = require('../models/Notification');

    const notifications = users.map((u) => ({
      user: u._id,
      title,
      message,
      type: 'admin',
    }));
    await Notification.insertMany(notifications);

    res.json({ success: true, message: `Notification sent to ${users.length} users` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getStats, getAllUsers, toggleBlockUser, getUserDetail, broadcastNotification };
