import User from '../models/User.js';
import Review from '../models/Review.js';
import Hostel from '../models/Hostel.js';
import Mess from '../models/Mess.js';
import Shop from '../models/Shop.js';
import ScamReport from '../models/ScamReport.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    // Basic counts
    const totalUsers = await User.countDocuments({ role: 'student' });
    const totalReviews = await Review.countDocuments();
    const totalHostels = await Hostel.countDocuments();
    const totalShops = await Shop.countDocuments();
    const totalMesses = await Mess.countDocuments();
    const totalScamReports = await ScamReport.countDocuments();

    // Calculate total uploaded images (hostels + messes + shops + reviews + scams)
    const hostels = await Hostel.find({}, 'images');
    const messes = await Mess.find({}, 'images');
    const shops = await Shop.find({}, 'images');
    const reviews = await Review.find({}, 'images');
    const scams = await ScamReport.find({}, 'proofImages');

    const totalImages =
      hostels.reduce((sum, h) => sum + h.images.length, 0) +
      messes.reduce((sum, m) => sum + m.images.length, 0) +
      shops.reduce((sum, s) => sum + s.images.length, 0) +
      reviews.reduce((sum, r) => sum + r.images.length, 0) +
      scams.reduce((sum, sc) => sum + sc.proofImages.length, 0);

    // Recent items
    const recentReviews = await Review.find()
      .populate('author', 'name avatar')
      .populate('placeId')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5);

    const recentScamReports = await ScamReport.find()
      .populate('student', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(5);

    // Aggregates for charts
    // 1. Highest Rated Hostels
    const highestRatedHostels = await Hostel.find({ approved: true })
      .sort({ averageRating: -1 })
      .limit(5)
      .select('name averageRating');

    // 2. Lowest Rated Hostels
    const lowestRatedHostels = await Hostel.find({ approved: true, ratingsCount: { $gt: 0 } })
      .sort({ averageRating: 1 })
      .limit(5)
      .select('name averageRating');

    // 3. Most Active Students (Authors of reviews)
    const activeStudents = await Review.aggregate([
      { $group: { _id: '$author', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      { $unwind: '$userDetails' },
      {
        $project: {
          name: '$userDetails.name',
          email: '$userDetails.email',
          count: 1,
        },
      },
    ]);

    // 4. Most Reviewed Places
    const mostReviewedHostels = await Hostel.find({ approved: true })
      .sort({ ratingsCount: -1 })
      .limit(5)
      .select('name ratingsCount');

    res.status(200).json({
      cards: {
        totalUsers,
        totalReviews,
        totalHostels,
        totalShops,
        totalMesses,
        totalImages,
        totalScamReports,
      },
      recent: {
        recentReviews,
        recentUsers,
        recentScamReports,
      },
      charts: {
        highestRatedHostels,
        lowestRatedHostels,
        activeStudents,
        mostReviewedHostels,
      },
    });
  } catch (error) {
    next(error);
  }
};
