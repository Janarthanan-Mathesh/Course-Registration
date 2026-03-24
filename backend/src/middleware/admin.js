const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Admin access required.' });
};

const verifierOnly = (req, res, next) => {
  if (req.user && ['admin', 'mentor'].includes(req.user.role)) {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Verifier access required (admin or mentor).' });
};

module.exports = { adminOnly, verifierOnly };
