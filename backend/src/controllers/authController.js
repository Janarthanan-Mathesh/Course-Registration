const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { generateOtp, getOtpExpiry, isOtpExpired } = require('../utils/otp');
const { sendOtpEmail, sendPasswordResetEmail } = require('../utils/email');
const { verifyFirebaseIdToken } = require('../utils/firebaseAdmin');
const crypto = require('crypto');

const DEVELOPER_VERIFY_PHONE = process.env.DEVELOPER_VERIFY_PHONE || '+91 9790301848';
const ADMIN_DEV_OTP = String(process.env.ADMIN_DEV_OTP || '').trim();

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

const normalizePhone = (value) => String(value || '').replace(/[\s-]/g, '').replace(/^0+/, '');
const normalizeOtpCode = (value) => String(value || '').replace(/\s/g, '');

const verifyDeveloperOtpCode = (adminDevOtp) => {
  if (!ADMIN_DEV_OTP) {
    throw new Error('Developer OTP is not configured on server');
  }

  const providedAdminDevOtp = normalizeOtpCode(adminDevOtp);
  if (!providedAdminDevOtp) {
    throw new Error('Developer OTP is required');
  }

  if (providedAdminDevOtp !== normalizeOtpCode(ADMIN_DEV_OTP)) {
    throw new Error('Invalid developer OTP');
  }

  return true;
};

const verifyAdminDeveloperAccess = async ({ firebaseIdToken, adminDevOtp }) => {
  const providedAdminDevOtp = normalizeOtpCode(adminDevOtp);
  if (ADMIN_DEV_OTP && providedAdminDevOtp && providedAdminDevOtp === normalizeOtpCode(ADMIN_DEV_OTP)) {
    return true;
  }

  if (!firebaseIdToken) {
    if (ADMIN_DEV_OTP) {
      throw new Error('Admin verification required: verify phone OTP or enter valid developer code');
    }
    throw new Error('Admin login requires Firebase verification token');
  }

  const decoded = await verifyFirebaseIdToken(firebaseIdToken);
  const firebasePhone = normalizePhone(decoded.phone_number || '');
  const expectedPhone = normalizePhone(DEVELOPER_VERIFY_PHONE);

  if (!firebasePhone || firebasePhone !== expectedPhone) {
    throw new Error('Firebase verification phone does not match developer number');
  }

  return true;
};

const buildRegisterSuccessPayload = async ({ user, otp, statusCode = 201, baseMessage }) => {
  let message = baseMessage;
  let otpDelivery = 'sent';
  let otpPreview;

  try {
    await sendOtpEmail(user.email, otp);
  } catch (emailError) {
    otpDelivery = 'failed';
    message = `${baseMessage} OTP email delivery failed; use OTP preview to continue.`;
    if (process.env.NODE_ENV !== 'production') {
      otpPreview = otp;
    }
  }

  return {
    statusCode,
    body: {
      success: true,
      message,
      userId: user._id,
      otpDelivery,
      ...(otpPreview ? { otpPreview } : {}),
    },
  };
};

// @desc  Register new user/admin
// @route POST /api/auth/register
const register = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      confirmPassword,
      phone,
      linkedinLink,
      githubLink,
      role = 'student',
      adminDevOtp,
    } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    const allowedRoles = ['student', 'mentor', 'admin'];
    const normalizedRole = allowedRoles.includes(role) ? role : 'student';

    if (normalizedRole !== 'student') {
      try {
        verifyDeveloperOtpCode(adminDevOtp);
      } catch (otpError) {
        return res.status(401).json({ success: false, message: otpError.message });
      }
    }

    const normalizedEmail = email.toLowerCase();
    const existingUser = await User.findOne({ $or: [{ email: normalizedEmail }, { username }] });
    if (existingUser && existingUser.isEmailVerified) {
      return res.status(200).json({
        success: true,
        requiresLogin: true,
        message: 'Account already exists. Please login with this email/username.',
      });
    }

    const otp = generateOtp();
    const otpExpiry = getOtpExpiry();

    let user = existingUser;
    if (user) {
      user.username = username;
      user.email = normalizedEmail;
      user.password = password;
      user.phone = phone;
      user.linkedinLink = linkedinLink;
      user.githubLink = githubLink;
      user.role = normalizedRole;
      user.authProvider = 'local';
      user.emailOtp = otp;
      user.emailOtpExpiry = otpExpiry;
      user.isAdminDeveloperVerified = true;
      await user.save();

      const payload = await buildRegisterSuccessPayload({
        user,
        otp,
        statusCode: 200,
        baseMessage: 'Account exists but not verified. A new OTP has been generated.',
      });
      return res.status(payload.statusCode).json(payload.body);
    }

    user = await User.create({
      username,
      email: normalizedEmail,
      password,
      phone,
      linkedinLink,
      githubLink,
      role: normalizedRole,
      authProvider: 'local',
      emailOtp: otp,
      emailOtpExpiry: otpExpiry,
      isAdminDeveloperVerified: true,
    });

    const payload = await buildRegisterSuccessPayload({
      user,
      otp,
      statusCode: 201,
      baseMessage: 'Registration successful. Please verify your email with the OTP sent.',
    });
    return res.status(payload.statusCode).json(payload.body);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Verify email OTP
// @route POST /api/auth/verify-email
const verifyEmail = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.emailOtp !== otp) return res.status(400).json({ success: false, message: 'Invalid OTP' });
    if (isOtpExpired(user.emailOtpExpiry)) return res.status(400).json({ success: false, message: 'OTP expired' });

    user.isEmailVerified = true;
    user.emailOtp = undefined;
    user.emailOtpExpiry = undefined;
    await user.save();

    const token = signToken(user._id);
    res.json({ success: true, message: 'Email verified successfully', token });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Resend email OTP
// @route POST /api/auth/resend-otp
const resendOtp = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const otp = generateOtp();
    user.emailOtp = otp;
    user.emailOtpExpiry = getOtpExpiry();
    await user.save();
    await sendOtpEmail(user.email, otp);

    res.json({ success: true, message: 'OTP resent to your email' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Login user/admin
// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password, firebaseIdToken, adminDevOtp } = req.body;

    const user = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: email }],
    }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.role === 'user') {
      user.role = 'student';
    }

    if (user.role === 'mentor') {
      try {
        verifyDeveloperOtpCode(adminDevOtp);
      } catch (otpError) {
        return res.status(401).json({ success: false, message: otpError.message });
      }
    }

    if (!user.isEmailVerified) {
      return res.status(401).json({ success: false, message: 'Please verify your email first' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: 'Account blocked. Contact admin.' });
    }

    if (user.role === 'admin') {
      try {
        await verifyAdminDeveloperAccess({ firebaseIdToken, adminDevOtp });
      } catch (firebaseError) {
        return res.status(401).json({ success: false, message: firebaseError.message });
      }
    }

    user.lastLogin = new Date();
    user.activityLogs.push({ action: 'Login' });
    await user.save();

    const token = signToken(user._id);
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        authProvider: user.authProvider,
        profileImage: user.profileImage,
        collegeDomain: user.collegeDomain,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Forgot password
// @route POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ success: false, message: 'No user with that email' });

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
    user.resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    await sendPasswordResetEmail(email, resetLink);

    res.json({ success: true, message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Reset password
// @route POST /api/auth/reset-password/:token
const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ success: false, message: 'Token invalid or expired' });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Google Sign-in (token from Firebase)
// @route POST /api/auth/google
const googleSignIn = async (req, res) => {
  try {
    const { email, username, profileImage, googleId } = req.body;

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      user = await User.create({
        username: username || email.split('@')[0],
        email: email.toLowerCase(),
        password: googleId + process.env.JWT_SECRET,
        phone: 'N/A',
        profileImage,
        isEmailVerified: true,
        authProvider: 'google',
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = signToken(user._id);
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        authProvider: user.authProvider,
        profileImage: user.profileImage,
        collegeDomain: user.collegeDomain,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  register,
  verifyEmail,
  resendOtp,
  login,
  forgotPassword,
  resetPassword,
  googleSignIn,
};
