const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const getOtpExpiry = () => {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + parseInt(process.env.OTP_EXPIRY || 10));
  return expiry;
};

const isOtpExpired = (expiryDate) => {
  return new Date() > new Date(expiryDate);
};

module.exports = { generateOtp, getOtpExpiry, isOtpExpired };
