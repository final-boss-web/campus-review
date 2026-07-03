import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
    },
    otp: {
      type: String,
    },
    otpExpiry: {
      type: Date,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      default: 'student',
    },
    status: {
      type: String,
      enum: ['active', 'banned'],
      default: 'active',
    },
    bookmarks: [
      {
        placeType: {
          type: String,
          required: true,
          enum: ['Hostel', 'Mess', 'Shop'],
        },
        placeId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          refPath: 'bookmarks.placeType',
        },
      },
    ],
    badges: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model('User', UserSchema);
