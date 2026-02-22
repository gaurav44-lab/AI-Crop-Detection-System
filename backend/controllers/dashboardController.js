const Report = require('../models/Report');
const Advisory = require('../models/Advisory');
const User = require('../models/User');

// @desc    Get user dashboard stats
// @route   GET /api/dashboard/stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [
      totalReports,
      resolvedReports,
      pendingReports,
      unreadAdvisories,
      recentReports,
      diseaseBreakdown,
      cropBreakdown,
      monthlyActivity
    ] = await Promise.all([
      Report.countDocuments({ user: userId }),
      Report.countDocuments({ user: userId, status: 'resolved' }),
      Report.countDocuments({ user: userId, status: { $in: ['pending', 'analyzing'] } }),
      Advisory.countDocuments({ user: userId, isRead: false }),
      Report.find({ user: userId }).sort({ createdAt: -1 }).limit(5).select('cropType severity status createdAt aiAnalysis.detectedDisease'),
      Report.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$aiAnalysis.detectedDisease', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]),
      Report.aggregate([
        { $match: { user: userId } },
        { $group: { _id: '$cropType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Report.aggregate([
        { $match: { user: userId, createdAt: { $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        totalReports,
        resolvedReports,
        pendingReports,
        activeReports: totalReports - resolvedReports,
        unreadAdvisories,
        resolutionRate: totalReports ? Math.round((resolvedReports / totalReports) * 100) : 0
      },
      recentReports,
      diseaseBreakdown,
      cropBreakdown,
      monthlyActivity
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Admin - get system-wide stats
// @route   GET /api/dashboard/admin
exports.getAdminStats = async (req, res, next) => {
  try {
    const [totalUsers, totalReports, totalAdvisories, severityBreakdown] = await Promise.all([
      User.countDocuments(),
      Report.countDocuments(),
      Advisory.countDocuments(),
      Report.aggregate([
        { $group: { _id: '$severity', count: { $sum: 1 } } }
      ])
    ]);

    res.json({
      success: true,
      stats: { totalUsers, totalReports, totalAdvisories },
      severityBreakdown
    });
  } catch (err) {
    next(err);
  }
};
