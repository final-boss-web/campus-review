import mongoose from 'mongoose';
import { getUniqueSlug } from '../utils/slugify.js';

const MessSchema = new mongoose.Schema(
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
    coverImage: {
      url: { type: String },
      fileId: { type: String },
      thumbnailUrl: { type: String }
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
    menuImages: [
      {
        url: { type: String, required: true },
        fileId: { type: String, required: true },
        thumbnailUrl: { type: String },
      },
    ],
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
    googleMapsUrl: {
      type: String,
      default: '',
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
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

MessSchema.pre('save', async function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = await getUniqueSlug(this.constructor, this.name, this._id);
  }
  next();
});

export default mongoose.model('Mess', MessSchema);
