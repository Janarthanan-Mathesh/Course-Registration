const UniversalCourse = require('../models/UniversalCourse');
const Enrollment = require('../models/Enrollment');

// @desc  Get all universal courses
// @route GET /api/universal-courses
const getUniversalCourses = async (req, res) => {
  try {
    const { provider, skillLevel, search, page = 1, limit = 20 } = req.query;
    const filter = { isActive: true };

    if (provider) filter.provider = provider;
    if (skillLevel) filter.skillLevel = skillLevel;
    if (search) filter.$text = { $search: search };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const courses = await UniversalCourse.find(filter)
      .sort({ rating: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await UniversalCourse.countDocuments(filter);

    // Attach enrollment status
    const enrolled = await Enrollment.find({
      user: req.user._id,
      courseType: 'universal',
    }).select('course progress status isWishlisted');

    const enrolledMap = {};
    enrolled.forEach((e) => {
      enrolledMap[e.course.toString()] = {
        isEnrolled: true,
        progress: e.progress,
        status: e.status,
        isWishlisted: e.isWishlisted,
      };
    });

    const coursesWithStatus = courses.map((c) => ({
      ...c.toObject(),
      ...(enrolledMap[c._id.toString()] || { isEnrolled: false }),
    }));

    // Sort enrolled courses to top
    coursesWithStatus.sort((a, b) => (b.isEnrolled ? 1 : 0) - (a.isEnrolled ? 1 : 0));

    res.json({ success: true, courses: coursesWithStatus, total, page: parseInt(page) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get single universal course
// @route GET /api/universal-courses/:id
const getUniversalCourseById = async (req, res) => {
  try {
    const course = await UniversalCourse.findById(req.params.id).populate('reviews.user', 'username profileImage');
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Add review to universal course
// @route POST /api/universal-courses/:id/reviews
const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const course = await UniversalCourse.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    // Check if already reviewed
    const existingReview = course.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this course' });
    }

    course.reviews.push({ user: req.user._id, rating, comment });
    course.totalRatings += 1;
    course.rating =
      (course.rating * (course.totalRatings - 1) + rating) / course.totalRatings;
    await course.save();

    res.json({ success: true, message: 'Review added' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Create universal course (admin)
// @route POST /api/universal-courses
const createUniversalCourse = async (req, res) => {
  try {
    const course = await UniversalCourse.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Update universal course (admin)
// @route PUT /api/universal-courses/:id
const updateUniversalCourse = async (req, res) => {
  try {
    const course = await UniversalCourse.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Delete universal course (admin)
// @route DELETE /api/universal-courses/:id
const deleteUniversalCourse = async (req, res) => {
  try {
    await UniversalCourse.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Course deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getUniversalCourses,
  getUniversalCourseById,
  addReview,
  createUniversalCourse,
  updateUniversalCourse,
  deleteUniversalCourse,
};
