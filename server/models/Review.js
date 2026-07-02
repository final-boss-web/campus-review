import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    placeType: {
      type: String,
      required: true,
      enum: ['Hostel', 'Mess', 'Shop'],
    },
    placeId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'placeType',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    reviewText: {
      type: String,
      required: true,
      trim: true,
    },
    images: [
      {
        url: { type: String, required: true },
        fileId: { type: String, required: true },
        thumbnailUrl: { type: String },
      },
    ],
    pros: {
      type: String,
      default: '',
    },
    cons: {
      type: String,
      default: '',
    },
    // Parameter ratings (1-5)
    price: { type: Number, min: 1, max: 5 },
    food: { type: Number, min: 1, max: 5 },
    cleanliness: { type: Number, min: 1, max: 5 },
    behaviour: { type: Number, min: 1, max: 5 },
    safety: { type: Number, min: 1, max: 5 },
    internet: { type: Number, min: 1, max: 5 },
    facilities: { type: Number, min: 1, max: 5 },
    
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    flags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isVerified: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Review', ReviewSchema);
