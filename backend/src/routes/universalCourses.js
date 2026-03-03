const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');
const {
  getUniversalCourses,
  getUniversalCourseById,
  addReview,
  createUniversalCourse,
  updateUniversalCourse,
  deleteUniversalCourse,
} = require('../controllers/universalCourseController');

router.use(protect);
router.get('/', getUniversalCourses);
router.get('/:id', getUniversalCourseById);
router.post('/:id/reviews', addReview);
router.post('/', adminOnly, createUniversalCourse);
router.put('/:id', adminOnly, updateUniversalCourse);
router.delete('/:id', adminOnly, deleteUniversalCourse);

module.exports = router;
