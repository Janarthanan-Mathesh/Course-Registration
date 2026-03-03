const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');
const {
  uploadCertificate,
  getMyCertificates,
  approveCertificate,
  rejectCertificate,
  getAllCertificates,
} = require('../controllers/certificateController');

router.use(protect);
router.post('/', uploadCertificate);
router.get('/', getMyCertificates);
router.get('/all', adminOnly, getAllCertificates);
router.put('/:id/approve', adminOnly, approveCertificate);
router.put('/:id/reject', adminOnly, rejectCertificate);

module.exports = router;
