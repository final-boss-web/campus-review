import mongoose from 'mongoose';

const ShopSchema = new mongoose.Schema(
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
    address: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    openingTime: {
      type: String,
      required: true,
    },
    closingTime: {
      type: String,
      required: true,
    },
    location: {
      type: String, // dynamic text or maps description
      default: '',
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Restaurant & Cafe',
        'Medical Store',
        'Stationery & Photocopy',
        'Tea Stall',
        'Book Store',
        'Other'
      ],
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

export default mongoose.model('Shop', ShopSchema);
