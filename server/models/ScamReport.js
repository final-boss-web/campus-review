import mongoose from 'mongoose';

const ScamReportSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Fake Hostel',
        'Fraud Owner',
        'Deposit Scam',
        'Overcharging',
        'Bad Food',
        'Hidden Charges',
        'Fake Promises',
      ],
    },
    description: {
      type: String,
      required: true,
    },
    proofImages: [
      {
        url: { type: String, required: true },
        fileId: { type: String, required: true },
        thumbnailUrl: { type: String },
      },
    ],
    targetPlaceType: {
      type: String,
      enum: ['Hostel', 'Mess', 'Shop'],
    },
    targetPlaceId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'targetPlaceType',
    },
    isVerifiedScam: {
      type: Boolean,
      default: false,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

export default mongoose.model('ScamReport', ScamReportSchema);
