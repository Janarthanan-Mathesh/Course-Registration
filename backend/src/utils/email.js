const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `"Course Registration App" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};

const sendOtpEmail = async (email, otp) => {
  await sendEmail({
    to: email,
    subject: 'Email Verification OTP',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Email Verification</h2>
        <p>Your OTP for email verification is:</p>
        <h1 style="color: #4F46E5; letter-spacing: 4px;">${otp}</h1>
        <p>This OTP is valid for ${process.env.OTP_EXPIRY || 10} minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `,
  });
};

const sendPasswordResetEmail = async (email, resetLink) => {
  await sendEmail({
    to: email,
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Password Reset</h2>
        <p>Click the button below to reset your password:</p>
        <a href="${resetLink}" style="background:#4F46E5;color:#fff;padding:10px 20px;border-radius:5px;text-decoration:none;">
          Reset Password
        </a>
        <p>This link expires in 1 hour.</p>
      </div>
    `,
  });
};

const sendCourseCompletionEmail = async (email, username, courseName) => {
  await sendEmail({
    to: email,
    subject: `Congratulations! You completed ${courseName}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>🎉 Course Completed!</h2>
        <p>Hi ${username},</p>
        <p>Congratulations on completing <strong>${courseName}</strong>!</p>
        <p>Don't forget to upload your certificate in the app.</p>
      </div>
    `,
  });
};

module.exports = { sendEmail, sendOtpEmail, sendPasswordResetEmail, sendCourseCompletionEmail };
