const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');
const {
  getAcademicCourses,
  getAcademicCourseById,
  createAcademicCourse,
  updateAcademicCourse,
  deleteAcademicCourse,
  addChapter,
  updateChapter,
  deleteChapter,
} = require('../controllers/academicCourseController');

router.use(protect);
router.get('/', getAcademicCourses);
router.get('/:id', getAcademicCourseById);
router.post('/', adminOnly, createAcademicCourse);
router.put('/:id', adminOnly, updateAcademicCourse);
router.delete('/:id', adminOnly, deleteAcademicCourse);
router.post('/:id/chapters', adminOnly, addChapter);
router.put('/:id/chapters/:chapterId', adminOnly, updateChapter);
router.delete('/:id/chapters/:chapterId', adminOnly, deleteChapter);

module.exports = router;
