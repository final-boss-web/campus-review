import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    review: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
      required: true,
      index: true,
    },
    contentText: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Comment', CommentSchema);
