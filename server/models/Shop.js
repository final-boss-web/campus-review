import mongoose from 'mongoose';
import { getUniqueSlug } from '../utils/slugify.js';

const ShopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    images: [
      {
        url: { type: String, required: true },
        fileId: { type: String, required: true },
        thumbnailUrl: { type: String },
      },
    ],
    menuImages: [
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

ShopSchema.pre('save', async function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = await getUniqueSlug(this.constructor, this.name, this._id);
  }
  next();
});

export default mongoose.model('Shop', ShopSchema);
