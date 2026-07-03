import nodemailer from 'nodemailer';
import logger from '../config/logger.js';

// Create SMTP Transporter
const createTransporter = () => {
  const host = process.env.EMAIL_HOST;
  const port = parseInt(process.env.EMAIL_PORT) || 587;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    logger.warn('Nodemailer SMTP email credentials are not configured in .env. Will fall back to terminal logging for OTPs.');
    return null;
  }

  return nodemailer.createTransport({
    host: host || 'smtp.gmail.com',
    port: port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user: user,
      pass: pass,
    },
  });
};

export const sendOTPEmail = async (email, otp) => {
  const transporter = createTransporter();
  const from = process.env.EMAIL_FROM || '"Campus Review Hub" <no-reply@campus.edu>';

  const mailOptions = {
    from: from,
    to: email,
    subject: 'Campus Review Hub - Password Reset Verification Code',
    text: `Your password reset OTP is ${otp}. It is valid for 15 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; max-width: 500px; margin: auto;">
        <h2 style="color: #4d70ff; text-align: center;">Campus Review Hub</h2>
        <hr style="border: 0; border-top: 1px solid #eee;" />
        <p>Dear Student,</p>
        <p>You requested a password reset. Please use the following One-Time Password (OTP) to reset your password. This OTP is valid for <strong>15 minutes</strong>.</p>
        <div style="font-size: 24px; font-weight: bold; text-align: center; color: #4d70ff; background-color: #f5f7ff; padding: 15px; border-radius: 8px; letter-spacing: 4px; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: #888; font-size: 12px; text-align: center;">If you did not request this reset, please ignore this email.</p>
      </div>
    `,
  };

  if (!transporter) {
    // Development simulator fallback
    console.log('\n=============================================');
    console.log(`[EMAIL SIMULATOR] Sending OTP to: ${email}`);
    console.log(`[EMAIL SIMULATOR] Verification OTP: ${otp}`);
    console.log('=============================================\n');
    return true;
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`OTP Email successfully sent to ${email}. MessageId: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error(`Error sending email to ${email}: ${error.message}`);
    // Also output simulator fallback in console so developers can proceed if send fails
    console.log('\n=============================================');
    console.log(`[EMAIL FALLBACK] Sending OTP to: ${email}`);
    console.log(`[EMAIL FALLBACK] Verification OTP: ${otp}`);
    console.log('=============================================\n');
    return false;
  }
};
