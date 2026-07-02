import mongoose from 'mongoose';

const MessSchema = new mongoose.Schema(
  {
    name: {
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
    menu: {
      type: String, // can store a markdown / text description of the menu
      default: '',
    },
    monthlyCharges: {
      type: Number,
      required: true,
    },
    dailyCharges: {
      type: Number,
      required: true,
    },
    foodTiming: {
      type: String,
      required: true,
    },
    veg: {
      type: Boolean,
      default: true,
    },
    nonVeg: {
      type: Boolean,
      default: false,
    },
    contact: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    ratingsCount: {
      type: Number,
      default: 0,
    },
    approved: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Mess', MessSchema);
