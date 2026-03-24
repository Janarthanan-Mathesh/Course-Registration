const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { verifierOnly } = require('../middleware/admin');
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
router.get('/all', verifierOnly, getAllCertificates);
router.put('/:id/approve', verifierOnly, approveCertificate);
router.put('/:id/reject', verifierOnly, rejectCertificate);

module.exports = router;
