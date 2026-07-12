import User from '../models/User.js';
import Review from '../models/Review.js';
import Hostel from '../models/Hostel.js';
import Mess from '../models/Mess.js';
import Shop from '../models/Shop.js';
import ScamReport from '../models/ScamReport.js';
import logger from '../config/logger.js';

export const getUserProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password -otp -otpExpiry -isResetOtpVerified -googleId');

    if (!user) {
      return res.status(404).json({ message: 'User profile not found.' });
    }

    // Fetch user's reviews
    const reviews = await Review.find({ author: id })
      .populate('placeId')
      .sort({ createdAt: -1 });

    // Fetch user's scam reports - only if requesting user is the owner or an admin
    const isOwnProfile = req.user && req.user._id.toString() === id;
    const isAdmin = req.user && req.user.role === 'admin';
    let scamReports = [];
    if (isOwnProfile || isAdmin) {
      scamReports = await ScamReport.find({ student: id })
        .populate('targetPlaceId')
        .sort({ createdAt: -1 });
    }

    // Fetch bookmarks details
    const populatedBookmarks = [];
    for (const bookmark of user.bookmarks) {
      let Model;
      if (bookmark.placeType === 'Hostel') Model = Hostel;
      else if (bookmark.placeType === 'Mess') Model = Mess;
      else if (bookmark.placeType === 'Shop') Model = Shop;

      if (Model) {
        const place = await Model.findById(bookmark.placeId);
        if (place) {
          populatedBookmarks.push({
            placeType: bookmark.placeType,
            place,
          });
        }
      }
    }

    // Liked reviews
    const likedReviews = await Review.find({ likes: id })
      .populate('author', 'name avatar')
      .populate('placeId');

    // Compile list of user's uploaded images
    const images = [];
    reviews.forEach((r) => {
      r.images.forEach((img) => images.push({ url: img.url, srcType: 'Review', refId: r._id }));
    });
    scamReports.forEach((s) => {
      s.proofImages.forEach((img) => images.push({ url: img.url, srcType: 'ScamReport', refId: s._id }));
    });

    res.status(200).json({
      user,
      reviews,
      scamReports,
      bookmarks: populatedBookmarks,
      likedReviews,
      images,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleBookmark = async (req, res, next) => {
  try {
    const { placeId, placeType } = req.body;

    if (!['Hostel', 'Mess', 'Shop'].includes(placeType)) {
      return res.status(400).json({ message: 'Invalid place type for bookmark.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const bookmarkIdx = user.bookmarks.findIndex(
      (b) => b.placeId.toString() === placeId && b.placeType === placeType
    );

    let bookmarked = false;

    if (bookmarkIdx > -1) {
      user.bookmarks.splice(bookmarkIdx, 1);
    } else {
      user.bookmarks.push({ placeId, placeType });
      bookmarked = true;
    }

    await user.save();

    res.status(200).json({
      message: bookmarked ? 'Bookmark added.' : 'Bookmark removed.',
      bookmarks: user.bookmarks,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password -otp -otpExpiry -isResetOtpVerified -googleId').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const toggleBanUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password -otp -otpExpiry -isResetOtpVerified -googleId');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Admin accounts cannot be banned.' });
    }

    user.status = user.status === 'active' ? 'banned' : 'active';
    await user.save();

    logger.warn(`User status toggled: ${user.email} is now ${user.status} by Admin ${req.user.email}`);

    res.status(200).json({
      message: `User account has been ${user.status === 'banned' ? 'banned' : 'unbanned'} successfully.`,
      user,
    });
  } catch (error) {
    next(error);
  }
};
