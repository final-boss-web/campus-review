import User from '../models/User.js';
import Review from '../models/Review.js';
import Hostel from '../models/Hostel.js';
import Mess from '../models/Mess.js';
import Shop from '../models/Shop.js';
import ScamReport from '../models/ScamReport.js';
import Comment from '../models/Comment.js';
import ActivityLog from '../models/ActivityLog.js';

// Controller to calculate all interactive dashboard metrics and charts
export const getDashboardStats = async (req, res, next) => {
  try {
    const { range = '7d', startDate, endDate } = req.query;

    // 1. Calculate Date Range Bounds
    let start = new Date();
    let end = new Date();
    const now = new Date();

    if (range === 'today') {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (range === 'yesterday') {
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() - 1);
      end.setHours(23, 59, 59, 999);
    } else if (range === '7d') {
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
    } else if (range === '30d') {
      start.setDate(start.getDate() - 30);
      start.setHours(0, 0, 0, 0);
    } else if (range === '90d') {
      start.setDate(start.getDate() - 90);
      start.setHours(0, 0, 0, 0);
    } else if (range === 'custom' && startDate && endDate) {
      start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    } else {
      // Default to last 7 days
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
    }

    const dateFilter = { timestamp: { $gte: start, $lte: end } };
    const dateFilterCreated = { createdAt: { $gte: start, $lte: end } };

    // --- CARDS SECTION ---

    // Total Users in System
    const totalUsers = await User.countDocuments({ role: 'student' });
    
    // Live Users (active session or ping in the last 5 minutes)
    const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
    const onlineUsersList = await ActivityLog.distinct('sessionId', { timestamp: { $gte: fiveMinsAgo } });
    const onlineUsers = onlineUsersList.length;

    // Today's Users (unique active users/sessions since today's start)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayUsersList = await ActivityLog.distinct('sessionId', { timestamp: { $gte: startOfToday } });
    const todayUsers = todayUsersList.length;

    // Weekly Users (unique active users/sessions in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weeklyUsersList = await ActivityLog.distinct('sessionId', { timestamp: { $gte: sevenDaysAgo } });
    const weeklyUsers = weeklyUsersList.length;

    // Monthly Users (unique active users/sessions in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const monthlyUsersList = await ActivityLog.distinct('sessionId', { timestamp: { $gte: thirtyDaysAgo } });
    const monthlyUsers = monthlyUsersList.length;

    // Active Users in the currently selected date filter range
    const activeUsersList = await ActivityLog.distinct('sessionId', dateFilter);
    const activeUsers = activeUsersList.length;

    // Reviews Stats
    const totalReviews = await Review.countDocuments();
    const reviewsToday = await Review.countDocuments({ createdAt: { $gte: startOfToday } });

    // Most Viewed Reviews/Places (derived from Place Detail pageviews in logs)
    const mostViewedReviews = await ActivityLog.aggregate([
      { $match: { ...dateFilter, currentPage: { $regex: /^\/place\// } } },
      { $group: { _id: '$currentPage', views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 5 }
    ]);

    // Comments Stats
    const totalComments = await Comment.countDocuments();
    const commentsToday = await Comment.countDocuments({ createdAt: { $gte: startOfToday } });

    // Likes Stats
    const likeAggr = await Review.aggregate([
      { $project: { numLikes: { $cond: { if: { $isArray: '$likes' }, then: { $size: '$likes' }, else: 0 } } } },
      { $group: { _id: null, total: { $sum: '$numLikes' } } }
    ]);
    const totalLikes = likeAggr[0]?.total || 0;
    
    // Likes today (based on audit logs)
    const dailyLikes = await ActivityLog.countDocuments({ ...dateFilter, action: 'Like' });

    // Uploads Stats
    const hostels = await Hostel.find({}, 'images');
    const messes = await Mess.find({}, 'images');
    const shops = await Shop.find({}, 'images');
    const reviews = await Review.find({}, 'images');
    const scams = await ScamReport.find({}, 'proofImages');

    const imagesUploaded =
      hostels.reduce((sum, h) => sum + h.images.length, 0) +
      messes.reduce((sum, m) => sum + m.images.length, 0) +
      shops.reduce((sum, s) => sum + s.images.length, 0) +
      reviews.reduce((sum, r) => sum + r.images.length, 0) +
      scams.reduce((sum, sc) => sum + sc.proofImages.length, 0);

    const filesUploaded = await ActivityLog.countDocuments({ ...dateFilter, action: 'Upload' });

    // Visitors Stats (based on unique Session IDs/IPs in logs)
    const dailyVisitors = todayUsers;
    const weeklyVisitors = weeklyUsers;
    const monthlyVisitors = monthlyUsers;
    const liveVisitors = onlineUsers;

    // --- BREAKDOWNS (TABLES) ---

    // Top Pages
    const topPages = await ActivityLog.aggregate([
      { $match: { ...dateFilter, action: 'Page View' } },
      { $group: { _id: '$currentPage', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Top Search Keywords
    const topSearchKeywords = await ActivityLog.aggregate([
      { $match: { ...dateFilter, action: 'Search' } },
      { $group: { _id: { $toLower: { $ifNull: ['$queryParams.q', '$requestBody.query'] } }, count: { $sum: 1 } } },
      { $match: { _id: { $ne: null, $ne: '' } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Top Browsers
    const topBrowsers = await ActivityLog.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$browser', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Top Devices
    const topDevices = await ActivityLog.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$deviceType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Operating Systems
    const operatingSystems = await ActivityLog.aggregate([
      { $match: dateFilter },
      { $group: { _id: '$os', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Countries
    const countries = await ActivityLog.aggregate([
      { $match: dateFilter },
      { $group: { _id: { $ifNull: ['$country', 'Unknown'] }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // States
    const states = await ActivityLog.aggregate([
      { $match: dateFilter },
      { $group: { _id: { $ifNull: ['$state', 'Unknown'] }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Cities
    const cities = await ActivityLog.aggregate([
      { $match: dateFilter },
      { $group: { _id: { $ifNull: ['$city', 'Unknown'] }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Traffic Sources
    const trafficSources = await ActivityLog.aggregate([
      { $match: dateFilter },
      { 
        $group: { 
          _id: {
            $cond: {
              if: { $or: [{ $eq: ['$referrer', ''] }, { $eq: ['$referrer', null] }] },
              then: 'Direct / Bookmark',
              else: {
                $cond: {
                  if: { $regexMatch: { input: '$referrer', regex: /localhost|127\.0\.0\.1/ } },
                  then: 'Internal',
                  else: '$referrer'
                }
              }
            }
          }, 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Errors Stats
    const apiErrors = await ActivityLog.countDocuments({ ...dateFilter, responseStatus: { $gte: 500 } });
    const notFoundErrors = await ActivityLog.countDocuments({ ...dateFilter, responseStatus: 404 });
    const authErrors = await ActivityLog.countDocuments({
      ...dateFilter,
      $or: [{ responseStatus: 401 }, { responseStatus: 403 }, { action: 'Authentication Error' }]
    });

    // --- CHART TRENDS ---

    // User Growth Trend (cumulative users registered over range)
    const userRegistrations = await User.aggregate([
      { $match: dateFilterCreated },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          registrations: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Visitor Trend (unique visitor count by day)
    const visitorTrend = await ActivityLog.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            sessionId: '$sessionId'
          }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          visitors: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Reviews Trend (reviews written by day)
    const reviewsTrend = await Review.aggregate([
      { $match: dateFilterCreated },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          reviews: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const totalHostels = await Hostel.countDocuments();
    const totalMesses = await Mess.countDocuments();
    const totalShops = await Shop.countDocuments();
    const totalScamReports = await ScamReport.countDocuments();

    res.status(200).json({
      cards: {
        totalUsers,
        onlineUsers,
        todayUsers,
        weeklyUsers,
        monthlyUsers,
        activeUsers,
        totalReviews,
        reviewsToday,
        totalComments,
        commentsToday,
        totalLikes,
        dailyLikes,
        imagesUploaded,
        filesUploaded,
        dailyVisitors,
        weeklyVisitors,
        monthlyVisitors,
        liveVisitors,
        totalHostels,
        totalMesses,
        totalShops,
        totalScamReports,
      },
      breakdowns: {
        topPages,
        topSearchKeywords,
        topBrowsers,
        topDevices,
        operatingSystems,
        countries,
        states,
        cities,
        trafficSources,
        mostViewedReviews,
        errors: {
          apiErrors,
          notFoundErrors,
          authErrors,
        }
      },
      trends: {
        userGrowth: userRegistrations,
        visitorTrend,
        reviewsTrend,
      }
    });
  } catch (error) {
    next(error);
  }
};

// Endpoint for receiving frontend activity log requests
export const logActivity = async (req, res, next) => {
  try {
    // Note: The global requestLogger middleware handles parsing the body and inserting the DB record.
    // So this controller just needs to acknowledge the tracking call.
    res.status(200).json({ success: true, message: 'Activity logged successfully.' });
  } catch (error) {
    next(error);
  }
};

// API to generate CSV or spreadsheet payload of logs for export
export const exportActivityLogs = async (req, res, next) => {
  try {
    const logs = await ActivityLog.find()
      .populate('user', 'name email')
      .sort({ timestamp: -1 })
      .limit(1000)
      .lean();

    res.status(200).json(logs);
  } catch (error) {
    next(error);
  }
};

// API to get activity logs with filters (e.g. by userId)
export const getActivityLogs = async (req, res, next) => {
  try {
    const { userId, limit, action } = req.query;
    const filter = {};
    if (userId) {
      filter.user = userId;
    }
    if (action) {
      filter.action = action;
    }
    const logs = await ActivityLog.find(filter)
      .populate('user', 'name email avatar')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit) || 200)
      .lean();

    res.status(200).json(logs);
  } catch (error) {
    next(error);
  }
};

