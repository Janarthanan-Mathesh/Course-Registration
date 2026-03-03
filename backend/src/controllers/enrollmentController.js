const Enrollment = require('../models/Enrollment');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendCourseCompletionEmail } = require('../utils/email');

// @desc  Enroll in a course
// @route POST /api/enrollments
const enrollCourse = async (req, res) => {
  try {
    const { courseId, courseType } = req.body;
    const courseModel = courseType === 'academic' ? 'AcademicCourse' : 'UniversalCourse';

    const existing = await Enrollment.findOne({ user: req.user._id, course: courseId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
    }

    const enrollment = await Enrollment.create({
      user: req.user._id,
      course: courseId,
      courseType,
      courseModel,
      status: 'enrolled',
    });

    // Award points for enrolling
    await User.findByIdAndUpdate(req.user._id, { $inc: { points: 10 } });

    // Create notification
    await Notification.create({
      user: req.user._id,
      title: 'Course Enrolled!',
      message: `You have successfully enrolled in a new ${courseType} course.`,
      type: 'enrollment',
    });

    res.status(201).json({ success: true, enrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get user enrollments
// @route GET /api/enrollments
const getMyEnrollments = async (req, res) => {
  try {
    const { courseType, status } = req.query;
    const filter = { user: req.user._id };
    if (courseType) filter.courseType = courseType;
    if (status) filter.status = status;

    const enrollments = await Enrollment.find(filter)
      .populate('course')
      .sort({ updatedAt: -1 });

    res.json({ success: true, enrollments, total: enrollments.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Update progress
// @route PUT /api/enrollments/:id/progress
const updateProgress = async (req, res) => {
  try {
    const { progress } = req.body;
    const enrollment = await Enrollment.findOne({ _id: req.params.id, user: req.user._id });
    if (!enrollment) return res.status(404).json({ success: false, message: 'Enrollment not found' });

    enrollment.progress = progress;
    if (progress >= 100) {
      enrollment.status = 'completed';
      enrollment.completedAt = new Date();
      // Award points for completion
      await User.findByIdAndUpdate(req.user._id, { $inc: { points: 50 } });
      // Notify
      await Notification.create({
        user: req.user._id,
        title: '🎉 Course Completed!',
        message: 'Congratulations! Don\'t forget to upload your certificate.',
        type: 'course_completion',
      });
      // Send email
      const user = await User.findById(req.user._id);
      await sendCourseCompletionEmail(user.email, user.username, 'your course').catch(() => {});
    } else if (progress > 0) {
      enrollment.status = 'ongoing';
    }

    await enrollment.save();
    res.json({ success: true, enrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Toggle wishlist
// @route PUT /api/enrollments/:id/wishlist
const toggleWishlist = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({ _id: req.params.id, user: req.user._id });
    if (!enrollment) return res.status(404).json({ success: false, message: 'Enrollment not found' });

    enrollment.isWishlisted = !enrollment.isWishlisted;
    await enrollment.save();
    res.json({ success: true, isWishlisted: enrollment.isWishlisted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Unenroll from a course
// @route DELETE /api/enrollments/:id
const unenroll = async (req, res) => {
  try {
    await Enrollment.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ success: true, message: 'Unenrolled successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { enrollCourse, getMyEnrollments, updateProgress, toggleWishlist, unenroll };
