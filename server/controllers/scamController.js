import ScamReport from '../models/ScamReport.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import logger from '../config/logger.js';
import { io } from '../index.js';

export const getScams = async (req, res, next) => {
  try {
    const { category, search, verifiedOnly } = req.query;
    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (verifiedOnly === 'true') {
      filter.isVerifiedScam = true;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const scams = await ScamReport.find(filter)
      .populate('student', 'name email avatar badges')
      .populate('targetPlaceId')
      .sort({ createdAt: -1 });

    const isAdmin = req.user && req.user.role === 'admin';
    const sanitizedScams = scams.map(scam => {
      const scamObj = scam.toObject();
      if (!isAdmin) {
        scamObj.student = {
          name: 'Student',
          avatar: '',
          badges: []
        };
      }
      return scamObj;
    });

    res.status(200).json(sanitizedScams);
  } catch (error) {
    next(error);
  }
};

export const getScamDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const scam = await ScamReport.findById(id)
      .populate('student', 'name email avatar badges')
      .populate('targetPlaceId');

    if (!scam) {
      return res.status(404).json({ message: 'Scam report not found.' });
    }

    const isAdmin = req.user && req.user.role === 'admin';
    const scamObj = scam.toObject();
    if (!isAdmin) {
      scamObj.student = {
        name: 'Student',
        avatar: '',
        badges: []
      };
    }

    res.status(200).json(scamObj);
  } catch (error) {
    next(error);
  }
};

export const createScamReport = async (req, res, next) => {
  try {
    const { title, category, description, proofImages, targetPlaceId, targetPlaceType } = req.body;

    const newScam = await ScamReport.create({
      student: req.user._id,
      title,
      category,
      description,
      proofImages: proofImages || [],
      targetPlaceId,
      targetPlaceType,
    });

    logger.warn(`Scam report submitted: "${title}" by student ${req.user.email}`);

    // Update user badges - award "Scam Spotter" if it's their first scam report
    const user = await User.findById(req.user._id);
    if (user && !user.badges.includes('Scam Spotter')) {
      user.badges.push('Scam Spotter');
      await user.save();
      if (io) {
        io.to(req.user._id.toString()).emit('notification', {
          message: 'Congratulations! You unlocked the "Scam Spotter" badge!',
        });
      }
    }

    res.status(201).json({
      message: 'Scam report filed successfully. Admin will review the submission.',
      scamReport: newScam,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyScamReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const scam = await ScamReport.findById(id);

    if (!scam) {
      return res.status(404).json({ message: 'Scam report not found.' });
    }

    scam.isVerifiedScam = true;
    scam.verifiedBy = req.user._id;
    await scam.save();

    logger.info(`Scam report verified: "${scam.title}" by admin ${req.user.email}`);

    // Notify the user who reported
    await Notification.create({
      recipient: scam.student,
      type: 'scam_verified',
      message: `Your scam report regarding "${scam.title}" has been verified! Future students thank you.`,
      referenceId: scam._id,
      referenceType: 'ScamReport',
    });

    if (io) {
      io.to(scam.student.toString()).emit('notification', {
        message: `Your scam report "${scam.title}" has been verified!`,
      });
      // Broadcast verified scam alert
      io.emit('new_scam_alert', {
        id: scam._id,
        title: scam.title,
        message: `🚨 VERIFIED SCAM ALERT: ${scam.title} has been verified by administrators.`,
      });
    }

    res.status(200).json({
      message: 'Scam report verified successfully.',
      scam,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteScamReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const scam = await ScamReport.findById(id);

    if (!scam) {
      return res.status(404).json({ message: 'Scam report not found.' });
    }

    await ScamReport.findByIdAndDelete(id);
    logger.warn(`Scam report deleted by Admin ${req.user.email}`);

    res.status(200).json({ message: 'Scam report deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
