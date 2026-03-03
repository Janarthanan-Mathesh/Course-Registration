const AcademicCourse = require('../models/AcademicCourse');
const Enrollment = require('../models/Enrollment');

const parseChapterPayload = (payload) => {
  const chapterNo = Number(payload.chapterNo);
  if (!Number.isInteger(chapterNo) || chapterNo < 1) throw new Error('chapterNo must be a positive integer');

  const chapterName = String(payload.chapterName || '').trim();
  if (!chapterName) throw new Error('chapterName is required');

  const pdfs = Array.isArray(payload.pdfs) ? payload.pdfs : [];
  const externalLinks = Array.isArray(payload.externalLinks) ? payload.externalLinks : [];

  const normalizedPdfs = pdfs
    .map((p) => ({ title: String(p.title || '').trim(), url: String(p.url || '').trim() }))
    .filter((p) => p.title && p.url);

  const normalizedExternalLinks = externalLinks
    .map((l) => ({ label: String(l.label || '').trim(), url: String(l.url || '').trim() }))
    .filter((l) => l.label && l.url);

  return {
    chapterNo,
    chapterName,
    description: String(payload.description || '').trim(),
    pdfs: normalizedPdfs,
    externalLinks: normalizedExternalLinks,
    discourseLink: String(payload.discourseLink || '').trim(),
  };
};

// @desc  Get academic courses (college domain restricted)
// @route GET /api/academic-courses
const getAcademicCourses = async (req, res) => {
  try {
    const userDomain = req.user.email.split('@')[1];
    const collegeDomain = process.env.COLLEGE_DOMAIN || 'bitsathy.ac.in';

    if (req.user.role !== 'admin' && userDomain !== collegeDomain) {
      return res.status(403).json({
        success: false,
        message: 'Academic courses are only available for college email users',
      });
    }

    const { semester, year, department } = req.query;
    const filter = { collegeDomain, isActive: true };
    if (semester) filter.semester = parseInt(semester, 10);
    if (year) filter.year = parseInt(year, 10);
    if (department) filter.department = department;

    const courses = await AcademicCourse.find(filter).sort({ semester: 1, department: 1, courseCode: 1 });

    const enrolled = await Enrollment.find({ user: req.user._id, courseType: 'academic' }).select('course');
    const enrolledIds = enrolled.map((e) => e.course.toString());

    const coursesWithStatus = courses.map((c) => ({
      ...c.toObject(),
      isEnrolled: enrolledIds.includes(c._id.toString()),
    }));

    res.json({ success: true, courses: coursesWithStatus, total: courses.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get single academic course
// @route GET /api/academic-courses/:id
const getAcademicCourseById = async (req, res) => {
  try {
    const course = await AcademicCourse.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Create academic course (admin only)
// @route POST /api/academic-courses
const createAcademicCourse = async (req, res) => {
  try {
    const course = await AcademicCourse.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Update academic course (admin only)
// @route PUT /api/academic-courses/:id
const updateAcademicCourse = async (req, res) => {
  try {
    const course = await AcademicCourse.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Delete academic course (admin only)
// @route DELETE /api/academic-courses/:id
const deleteAcademicCourse = async (req, res) => {
  try {
    await AcademicCourse.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Course deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Add chapter to academic course (admin)
// @route POST /api/academic-courses/:id/chapters
const addChapter = async (req, res) => {
  try {
    const course = await AcademicCourse.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const chapter = parseChapterPayload(req.body);
    course.chapters.push(chapter);
    await course.save();

    res.status(201).json({ success: true, course });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc  Update chapter in academic course (admin)
// @route PUT /api/academic-courses/:id/chapters/:chapterId
const updateChapter = async (req, res) => {
  try {
    const course = await AcademicCourse.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const chapter = course.chapters.id(req.params.chapterId);
    if (!chapter) return res.status(404).json({ success: false, message: 'Chapter not found' });

    const payload = parseChapterPayload(req.body);
    chapter.chapterNo = payload.chapterNo;
    chapter.chapterName = payload.chapterName;
    chapter.description = payload.description;
    chapter.pdfs = payload.pdfs;
    chapter.externalLinks = payload.externalLinks;
    chapter.discourseLink = payload.discourseLink;
    await course.save();

    res.json({ success: true, course });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc  Delete chapter from academic course (admin)
// @route DELETE /api/academic-courses/:id/chapters/:chapterId
const deleteChapter = async (req, res) => {
  try {
    const course = await AcademicCourse.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    const chapter = course.chapters.id(req.params.chapterId);
    if (!chapter) return res.status(404).json({ success: false, message: 'Chapter not found' });

    chapter.deleteOne();
    await course.save();

    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAcademicCourses,
  getAcademicCourseById,
  createAcademicCourse,
  updateAcademicCourse,
  deleteAcademicCourse,
  addChapter,
  updateChapter,
  deleteChapter,
};
