const Certificate = require('../models/Certificate');
const Notification = require('../models/Notification');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const MIN_CERT_DURATION_HOURS = 6;
const MIN_DURATION_REJECTION_REASON = 'Certificate duration must be greater than 6 hours.';

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/certificates';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only PDF and image files are allowed'));
  },
}).single('certificate');

// @desc  Upload certificate
// @route POST /api/certificates
const uploadCertificate = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });

    try {
      const {
        courseName,
        courseProvider,
        skillsLearned,
        durationHours,
        courseType,
        enrollmentId,
        fileUrl: providedFileUrl,
        fileName: providedFileName,
      } = req.body;

      if (!courseName || !courseProvider || !skillsLearned || !durationHours || !courseType) {
        return res.status(400).json({
          success: false,
          message: 'courseName, courseProvider, skillsLearned, durationHours and courseType are required',
        });
      }
      if (!['academic', 'universal'].includes(courseType)) {
        return res.status(400).json({ success: false, message: 'Invalid courseType' });
      }
      const parsedDurationHours = Number(durationHours);
      if (!Number.isFinite(parsedDurationHours) || parsedDurationHours <= 0) {
        return res.status(400).json({ success: false, message: 'durationHours must be a positive number' });
      }

      const resolvedFileUrl = req.file
        ? `/uploads/certificates/${req.file.filename}`
        : providedFileUrl;

      if (!resolvedFileUrl) {
        return res.status(400).json({ success: false, message: 'Certificate file (upload or fileUrl) is required' });
      }

      const certificate = await Certificate.create({
        user: req.user._id,
        enrollment: enrollmentId,
        courseType,
        courseName,
        courseProvider,
        skillsLearned,
        durationHours: parsedDurationHours,
        fileUrl: resolvedFileUrl,
        fileName: req.file ? req.file.originalname : providedFileName || '',
        status: parsedDurationHours >= MIN_CERT_DURATION_HOURS ? 'pending' : 'rejected',
        isApproved: false,
        approvedBy: null,
        approvedAt: null,
        verifiedBy: null,
        verifiedAt: null,
        verificationNotes: '',
        rejectionReason: parsedDurationHours >= MIN_CERT_DURATION_HOURS ? '' : MIN_DURATION_REJECTION_REASON,
      });

      if (parsedDurationHours < MIN_CERT_DURATION_HOURS) {
        await Notification.create({
          user: req.user._id,
          title: 'Certificate Rejected',
          message: `Your certificate for "${certificate.courseName}" was rejected. Reason: ${MIN_DURATION_REJECTION_REASON}`,
          type: 'certificate_rejected',
        });
      }

      res.status(201).json({ success: true, certificate });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });
};

// @desc  Get my certificates
// @route GET /api/certificates
const getMyCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ user: req.user._id }).sort({ uploadedAt: -1 });
    res.json({ success: true, certificates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Approve certificate (admin)
// @route PUT /api/certificates/:id/approve
const approveCertificate = async (req, res) => {
  try {
    const { verificationNotes = '' } = req.body;
    const certificate = await Certificate.findById(req.params.id).populate('user', 'email username');

    if (!certificate) return res.status(404).json({ success: false, message: 'Certificate not found' });
    if (certificate.status === 'approved') {
      return res.status(400).json({ success: false, message: 'Certificate already approved' });
    }

    certificate.status = 'approved';
    certificate.isApproved = true;
    certificate.verifiedBy = req.user._id;
    certificate.verifiedAt = new Date();
    certificate.approvedBy = req.user._id;
    certificate.approvedAt = new Date();
    certificate.verificationNotes = verificationNotes;
    certificate.rejectionReason = '';
    await certificate.save();

    await Notification.create({
      user: certificate.user._id,
      title: 'Certificate Approved',
      message: `Your certificate for "${certificate.courseName}" has been approved.`,
      type: 'certificate_approved',
    });

    res.json({ success: true, certificate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Reject certificate (admin)
// @route PUT /api/certificates/:id/reject
const rejectCertificate = async (req, res) => {
  try {
    const { rejectionReason = '', verificationNotes = '' } = req.body;

    const certificate = await Certificate.findById(req.params.id).populate('user', 'email username');
    if (!certificate) return res.status(404).json({ success: false, message: 'Certificate not found' });

    certificate.status = 'rejected';
    certificate.isApproved = false;
    certificate.verifiedBy = req.user._id;
    certificate.verifiedAt = new Date();
    certificate.approvedBy = null;
    certificate.approvedAt = null;
    certificate.verificationNotes = verificationNotes;
    const normalizedRejectionReason = rejectionReason.trim()
      || (Number(certificate.durationHours) < MIN_CERT_DURATION_HOURS ? MIN_DURATION_REJECTION_REASON : '');
    if (!normalizedRejectionReason) {
      return res.status(400).json({ success: false, message: 'rejectionReason is required' });
    }
    certificate.rejectionReason = normalizedRejectionReason;
    await certificate.save();

    await Notification.create({
      user: certificate.user._id,
      title: 'Certificate Rejected',
      message: `Your certificate for "${certificate.courseName}" was rejected. Reason: ${normalizedRejectionReason}`,
      type: 'certificate_rejected',
    });

    res.json({ success: true, certificate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get all certificates (admin)
// @route GET /api/certificates/all
const getAllCertificates = async (req, res) => {
  try {
    const { status, courseType, userId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (courseType) filter.courseType = courseType;
    if (userId) filter.user = userId;

    const certificates = await Certificate.find(filter)
      .populate('user', 'username email')
      .populate('approvedBy', 'username email')
      .populate('verifiedBy', 'username email')
      .sort({ uploadedAt: -1 });
    res.json({ success: true, certificates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  uploadCertificate,
  getMyCertificates,
  approveCertificate,
  rejectCertificate,
  getAllCertificates,
};
