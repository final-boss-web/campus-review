import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Hostel from '../models/Hostel.js';
import Mess from '../models/Mess.js';
import Shop from '../models/Shop.js';
import Review from '../models/Review.js';
import ScamReport from '../models/ScamReport.js';
import Comment from '../models/Comment.js';
import Notification from '../models/Notification.js';
import ActivityLog from '../models/ActivityLog.js';

dotenv.config();

const clearDb = async () => {
  try {
    const connStr = process.env.MONGODB_URI;
    if (!connStr) {
      console.error('MONGODB_URI environment variable is not defined.');
      process.exit(1);
    }

    await mongoose.connect(connStr);
    console.log('MongoDB Connected for Clearing Database...');

    // Clear Listings
    const hostelResult = await Hostel.deleteMany({});
    const messResult = await Mess.deleteMany({});
    const shopResult = await Shop.deleteMany({});
    console.log(`Deleted listings: ${hostelResult.deletedCount} Hostels, ${messResult.deletedCount} Messes, ${shopResult.deletedCount} Shops.`);

    // Clear Reviews, Comments, Logs
    const reviewResult = await Review.deleteMany({});
    const commentResult = await Comment.deleteMany({});
    const scamResult = await ScamReport.deleteMany({});
    const notificationResult = await Notification.deleteMany({});
    const logResult = await ActivityLog.deleteMany({});
    console.log(`Deleted feedback/logs: ${reviewResult.deletedCount} Reviews, ${commentResult.deletedCount} Comments, ${scamResult.deletedCount} Scam Reports, ${notificationResult.deletedCount} Notifications, ${logResult.deletedCount} Activity Logs.`);

    // Delete users except the standard mock test users
    const userResult = await User.deleteMany({
      email: { $nin: ['admin@campus.edu', 'student@campus.edu', 'rohan@campus.edu'] }
    });
    console.log(`Deleted ${userResult.deletedCount} non-system users.`);

    // Reset ratings counts for the preserved mock users
    await User.updateMany({}, { $set: { badges: ['Active Member'] } });

    console.log('Database Clear Completed successfully! All dummy listings, reviews, and scam reports have been purged.');
    process.exit(0);
  } catch (error) {
    console.error('Database Clearing Error:', error);
    process.exit(1);
  }
};

clearDb();
