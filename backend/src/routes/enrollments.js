const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { enrollCourse, getMyEnrollments, updateProgress, toggleWishlist, unenroll } = require('../controllers/enrollmentController');

router.use(protect);
router.post('/', enrollCourse);
router.get('/', getMyEnrollments);
router.put('/:id/progress', updateProgress);
router.put('/:id/wishlist', toggleWishlist);
router.delete('/:id', unenroll);

module.exports = router;
