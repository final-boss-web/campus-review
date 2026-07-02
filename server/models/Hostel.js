import mongoose from 'mongoose';

const HostelSchema = new mongoose.Schema(
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
    ownerName: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    googleMapsUrl: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      required: true,
    },
    roomRent: {
      type: Number,
      required: true,
    },
    deposit: {
      type: Number,
      required: true,
    },
    ac: {
      type: Boolean,
      default: false,
    },
    nonAc: {
      type: Boolean,
      default: true,
    },
    wifi: {
      type: Boolean,
      default: false,
    },
    laundry: {
      type: Boolean,
      default: false,
    },
    washing: {
      type: Boolean,
      default: false,
    },
    parking: {
      type: Boolean,
      default: false,
    },
    security: {
      type: Boolean,
      default: false,
    },
    water: {
      type: Boolean,
      default: true,
    },
    electricity: {
      type: Boolean,
      default: true,
    },
    messAvailable: {
      type: Boolean,
      default: false,
    },
    description: {
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
    nearbyDistance: {
      type: Number, // in km
      required: true,
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

export default mongoose.model('Hostel', HostelSchema);
