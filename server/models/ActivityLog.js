import mongoose from 'mongoose';

const ActivityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  username: {
    type: String,
  },
  fullName: {
    type: String,
  },
  email: {
    type: String,
  },
  action: {
    type: String,
    required: true,
    index: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  // Authentication
  loginTime: Date,
  logoutTime: Date,
  sessionId: {
    type: String,
    index: true,
  },
  jwtId: String,

  // Request Details
  ip: {
    type: String,
    index: true,
  },
  country: String,
  state: String, // region/state
  city: String,
  timezone: String,
  latitude: Number,
  longitude: Number,

  // Device Info
  browser: String,
  browserVersion: String,
  os: String,
  deviceType: String,
  platform: String,
  userAgent: String,
  screenResolution: String,

  // Navigation
  currentPage: String,
  previousPage: String,
  referrer: String,
  requestUrl: String,

  // API Details
  apiEndpoint: String,
  httpMethod: String,
  requestBody: {
    type: mongoose.Schema.Types.Mixed,
  },
  queryParams: {
    type: mongoose.Schema.Types.Mixed,
  },
  responseStatus: Number,
  responseTime: Number, // milliseconds

  // Security Flags
  security: {
    failedLogin: { type: Boolean, default: false },
    invalidJwt: { type: Boolean, default: false },
    unauthorizedAccess: { type: Boolean, default: false },
    rateLimitTrigger: { type: Boolean, default: false },
    suspiciousActivity: { type: Boolean, default: false }
  }
});

// Compound indexes for optimization of analytics pipelines (sorting by date and grouping by action or user)
ActivityLogSchema.index({ timestamp: -1, action: 1 });
ActivityLogSchema.index({ action: 1, timestamp: -1 });
ActivityLogSchema.index({ user: 1, timestamp: -1 });
ActivityLogSchema.index({ sessionId: 1, timestamp: -1 });

export default mongoose.model('ActivityLog', ActivityLogSchema);

