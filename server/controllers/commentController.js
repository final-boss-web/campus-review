import Comment from '../models/Comment.js';
import Review from '../models/Review.js';
import Notification from '../models/Notification.js';
import logger from '../config/logger.js';
import { io } from '../index.js';

export const getCommentsByReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const comments = await Comment.find({ review: reviewId })
      .populate('author', 'name email avatar')
      .sort({ createdAt: 1 });

    res.status(200).json(comments);
  } catch (error) {
    next(error);
  }
};

export const createComment = async (req, res, next) => {
  try {
    const { reviewId, contentText } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Target review not found.' });
    }

    const comment = await Comment.create({
      author: req.user._id,
      review: reviewId,
      contentText,
    });

    // Notify review author
    if (review.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: review.author,
        sender: req.user._id,
        type: 'comment',
        message: `${req.user.name} commented on your review: "${contentText.substring(0, 30)}..."`,
        referenceId: review._id,
        referenceType: 'Review',
      });

      if (io) {
        io.to(review.author.toString()).emit('notification', {
          message: `${req.user.name} commented on your review.`,
        });
      }
    }

    const populatedComment = await Comment.findById(comment._id).populate('author', 'name email avatar');

    res.status(201).json({
      message: 'Comment posted successfully.',
      comment: populatedComment,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const comment = await Comment.findById(id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found.' });
    }

    // Only author or admin can delete
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. You can only delete your own comments.' });
    }

    await Comment.findByIdAndDelete(id);
    res.status(200).json({ message: 'Comment deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
