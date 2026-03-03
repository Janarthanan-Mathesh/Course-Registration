const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');
const { getStats, getAllUsers, toggleBlockUser, getUserDetail, broadcastNotification } = require('../controllers/adminController');

router.use(protect, adminOnly);
router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetail);
router.put('/users/:id/block', toggleBlockUser);
router.post('/notify', broadcastNotification);

module.exports = router;
