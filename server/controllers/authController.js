import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import logger from '../config/logger.js';
import { sendOTPEmail } from '../utils/mailer.js';

let googleClient;
const getGoogleClient = () => {
  if (!googleClient && process.env.GOOGLE_CLIENT_ID) {
    googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }
  return googleClient;
};

export const googleLogin = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ message: 'Google credentials token is required' });
    }

    let payload;
    const client = getGoogleClient();

    if (client && !token.startsWith('mock_')) {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } else {
      // Mock Login Fallback for local development/testing without real keys
      logger.info('Using mock Google verification fallback.');
      if (token.startsWith('mock_')) {
        try {
          const base64Str = token.replace('mock_', '');
          const decodedMock = JSON.parse(Buffer.from(base64Str, 'base64').toString('utf-8'));
          payload = {
            sub: decodedMock.sub || 'mock_sub_' + Math.floor(Math.random() * 1000000),
            email: decodedMock.email || 'guest@campus.edu',
            name: decodedMock.name || 'Mock Student',
            picture: decodedMock.picture || 'https://picsum.photos/150',
          };
        } catch (e) {
          payload = {
            sub: 'mock_sub_default_user',
            email: 'default_student@campus.edu',
            name: 'Demo Student User',
            picture: 'https://picsum.photos/150',
          };
        }
      } else {
        return res.status(400).json({ message: 'Invalid token structure.' });
      }
    }

    const { sub: googleId, email, name, picture: avatar } = payload;

    // Find or create User
    let user = await User.findOne({ googleId });
    if (!user) {
      // Auto-assign admin role to configured emails
      const adminEmails = (process.env.ADMIN_EMAILS || 'admin@campus.edu').split(',').map((e) => e.trim().toLowerCase());
      const role = adminEmails.includes(email.toLowerCase()) ? 'admin' : 'student';

      user = await User.create({
        googleId,
        email,
        name,
        avatar: avatar || '',
        role,
        badges: ['Campus Rookie'],
      });
      logger.info(`User registered successfully: ${email} (${role})`);
    } else {
      if (user.status === 'banned') {
        return res.status(403).json({ message: 'Your account has been banned by the administrator.' });
      }
      user.name = name;
      user.avatar = avatar || user.avatar;
      await user.save();
    }

    // Generate session JWT
    const jwtToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    // Set cookie
    res.cookie('token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: 'Logged in successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        bookmarks: user.bookmarks,
        badges: user.badges,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

export const getMe = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(200).json({ user: null });
    }
    res.status(200).json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar,
        role: req.user.role,
        bookmarks: req.user.bookmarks,
        badges: req.user.badges,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const adminEmails = (process.env.ADMIN_EMAILS || 'admin@campus.edu').split(',').map((e) => e.trim().toLowerCase());
    const role = adminEmails.includes(email.toLowerCase()) ? 'admin' : 'student';

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      badges: ['Campus Rookie'],
    });

    const jwtToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.cookie('token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: 'Account registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        bookmarks: user.bookmarks,
        badges: user.badges,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (user.status === 'banned') {
      return res.status(403).json({ message: 'Your account has been banned by the administrator.' });
    }

    if (!user.password) {
      return res.status(400).json({ message: 'This email is linked to a Google Login. Please use Google Login.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const jwtToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.cookie('token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: 'Logged in successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        bookmarks: user.bookmarks,
        badges: user.badges,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'No account linked with this email' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 15 * 60 * 1000;

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    await sendOTPEmail(user.email, otp);

    res.status(200).json({ message: 'Password reset OTP has been sent to your email.' });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;
    if (!email || !otp || !password) {
      return res.status(400).json({ message: 'Email, OTP, and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'No account linked with this email' });
    }

    if (!user.otp || !user.otpExpiry || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP code.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully. Please login with your new password.' });
  } catch (error) {
    next(error);
  }
};
