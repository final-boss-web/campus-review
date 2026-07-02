import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Hostel from '../models/Hostel.js';
import Mess from '../models/Mess.js';
import Shop from '../models/Shop.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import logger from '../config/logger.js';
import { io } from '../index.js';

// Helper to update average rating and review count of the parent Place
const updatePlaceRating = async (placeId, placeType) => {
  try {
    let Model;
    if (placeType === 'Hostel') Model = Hostel;
    else if (placeType === 'Mess') Model = Mess;
    else if (placeType === 'Shop') Model = Shop;

    if (!Model) return;

    const reviews = await Review.find({ placeId, placeType, isVerified: true });
    
    if (reviews.length === 0) {
      await Model.findByIdAndUpdate(placeId, { averageRating: 0, ratingsCount: 0 });
      return;
    }

    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = parseFloat((totalRating / reviews.length).toFixed(1));

    await Model.findByIdAndUpdate(placeId, {
      averageRating,
      ratingsCount: reviews.length,
    });
  } catch (error) {
    logger.error(`Error updating place rating cache: ${error.message}`);
  }
};

// Check for and assign student badges based on review counts
const checkAndAwardBadges = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const reviewCount = await Review.countDocuments({ author: userId });
    let newBadges = [...user.badges];
    let badgeAdded = false;

    if (reviewCount >= 1 && !newBadges.includes('Active Reviewer')) {
      newBadges.push('Active Reviewer');
      badgeAdded = true;
    }
    if (reviewCount >= 5 && !newBadges.includes('Elite Critic')) {
      newBadges.push('Elite Critic');
      badgeAdded = true;
    }
    if (reviewCount >= 10 && !newBadges.includes('Campus Guide')) {
      newBadges.push('Campus Guide');
      badgeAdded = true;
    }

    if (badgeAdded) {
      user.badges = newBadges;
      await user.save();
      // Notify user of badge unlock
      if (io) {
        io.to(userId.toString()).emit('notification', {
          message: `Congratulations! You unlocked a new badge: ${newBadges[newBadges.length - 1]}!`,
        });
      }
    }
  } catch (error) {
    logger.error(`Error checking user badges: ${error.message}`);
  }
};

export const createReview = async (req, res, next) => {
  try {
    const { placeId, placeType, rating, reviewText, images, pros, cons } = req.body;

    // Validate Place existence
    let Model;
    if (placeType === 'Hostel') Model = Hostel;
    else if (placeType === 'Mess') Model = Mess;
    else if (placeType === 'Shop') Model = Shop;

    if (!Model) {
      return res.status(400).json({ message: 'Invalid place type specified.' });
    }

    const place = await Model.findById(placeId);
    if (!place) {
      return res.status(404).json({ message: 'Target place not found.' });
    }

    // Optional parameters from request
    const { price, food, cleanliness, behaviour, safety, internet, facilities } = req.body;

    const newReview = await Review.create({
      author: req.user._id,
      placeId,
      placeType,
      rating,
      reviewText,
      images: images || [],
      pros: pros || '',
      cons: cons || '',
      price,
      food,
      cleanliness,
      behaviour,
      safety,
      internet,
      facilities,
    });

    await updatePlaceRating(placeId, placeType);
    await checkAndAwardBadges(req.user._id);

    // Notify original creator of the place (optional, if we want to send notification)
    if (place.createdBy && place.createdBy.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: place.createdBy,
        sender: req.user._id,
        type: 'review_approval',
        message: `${req.user.name} wrote a review for your listing "${place.name}".`,
        referenceId: newReview._id,
        referenceType: 'Review',
      });
      if (io) {
        io.to(place.createdBy.toString()).emit('notification', {
          message: `${req.user.name} wrote a review on your listing "${place.name}"`,
        });
      }
    }

    const populatedReview = await Review.findById(newReview._id).populate('author', 'name email avatar badges');

    res.status(201).json({
      message: 'Review posted successfully.',
      review: populatedReview,
    });
  } catch (error) {
    next(error);
  }
};

export const updateReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating, reviewText, images, pros, cons } = req.body;

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    if (review.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only edit your own reviews.' });
    }

    const { price, food, cleanliness, behaviour, safety, internet, facilities } = req.body;

    const updatedReview = await Review.findByIdAndUpdate(
      id,
      {
        $set: {
          rating,
          reviewText,
          images: images || review.images,
          pros: pros || '',
          cons: cons || '',
          price,
          food,
          cleanliness,
          behaviour,
          safety,
          internet,
          facilities,
        },
      },
      { new: true }
    ).populate('author', 'name email avatar badges');

    await updatePlaceRating(review.placeId, review.placeType);

    res.status(200).json({
      message: 'Review updated successfully.',
      review: updatedReview,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    if (review.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only delete your own reviews.' });
    }

    await Review.findByIdAndDelete(id);
    await updatePlaceRating(review.placeId, review.placeType);

    res.status(200).json({ message: 'Review deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

export const toggleLikeReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    const likeIdx = review.likes.indexOf(req.user._id);
    let liked = false;

    if (likeIdx > -1) {
      review.likes.splice(likeIdx, 1);
    } else {
      review.likes.push(req.user._id);
      liked = true;

      // Notify author of review
      if (review.author.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: review.author,
          sender: req.user._id,
          type: 'like',
          message: `${req.user.name} liked your review.`,
          referenceId: review._id,
          referenceType: 'Review',
        });
        if (io) {
          io.to(review.author.toString()).emit('notification', {
            message: `${req.user.name} liked your review`,
          });
        }
      }
    }

    await review.save();
    res.status(200).json({
      message: liked ? 'Review liked.' : 'Review unliked.',
      likes: review.likes,
    });
  } catch (error) {
    next(error);
  }
};

export const flagReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    const flagIdx = review.flags.indexOf(req.user._id);
    let flagged = false;

    if (flagIdx > -1) {
      review.flags.splice(flagIdx, 1);
    } else {
      review.flags.push(req.user._id);
      flagged = true;
    }

    await review.save();
    res.status(200).json({
      message: flagged ? 'Review flagged for admin moderation.' : 'Review flag removed.',
      flagsCount: review.flags.length,
    });
  } catch (error) {
    next(error);
  }
};
