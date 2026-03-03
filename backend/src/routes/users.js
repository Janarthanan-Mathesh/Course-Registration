const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getProfile, updateProfile, changePassword, getDashboard, getActivityLogs } = require('../controllers/userController');

router.use(protect);
router.get('/me', getProfile);
router.put('/me', updateProfile);
router.put('/change-password', changePassword);
router.get('/dashboard', getDashboard);
router.get('/activity', getActivityLogs);

module.exports = router;
