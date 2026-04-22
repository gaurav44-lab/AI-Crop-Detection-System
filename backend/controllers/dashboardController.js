const { db } = require('../config/firebase');

// @desc    Get user dashboard stats
// @route   GET /api/dashboard/stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Fetch all reports for the user (feasible for per-user dashboard)
    const reportsSnapshot = await db.collection('reports').where('user', '==', userId).get();
    const reports = reportsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const totalReports = reports.length;
    const resolvedReports = reports.filter(r => r.status === 'resolved').length;
    const pendingReports = reports.filter(r => ['pending', 'analyzing'].includes(r.status)).length;
    
    reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const recentReports = reports.slice(0, 5).map(r => ({
      id: r.id,
      cropType: r.cropType,
      severity: r.severity,
      status: r.status,
      createdAt: r.createdAt,
      aiAnalysis: { detectedDisease: r.aiAnalysis?.detectedDisease }
    }));

    // In-memory aggregations for disease breakdown
    const diseaseCount = {};
    reports.forEach(r => {
      const disease = r.aiAnalysis?.detectedDisease;
      if (disease) {
        diseaseCount[disease] = (diseaseCount[disease] || 0) + 1;
      }
    });
    const diseaseBreakdown = Object.keys(diseaseCount)
      .map(key => ({ id: key, count: diseaseCount[key] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // In-memory aggregations for crop breakdown
    const cropCount = {};
    reports.forEach(r => {
      const crop = r.cropType;
      if (crop) {
        cropCount[crop] = (cropCount[crop] || 0) + 1;
      }
    });
    const cropBreakdown = Object.keys(cropCount)
      .map(key => ({ id: key, count: cropCount[key] }))
      .sort((a, b) => b.count - a.count);

    // In-memory aggregation for monthly activity (last 6 months)
    const sixMonthsAgo = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);
    const monthlyActivityMap = {};
    reports.forEach(r => {
      const date = new Date(r.createdAt);
      if (date >= sixMonthsAgo) {
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyActivityMap[month] = (monthlyActivityMap[month] || 0) + 1;
      }
    });
    const monthlyActivity = Object.keys(monthlyActivityMap)
      .map(key => ({ id: key, count: monthlyActivityMap[key] }))
      .sort((a, b) => (a.id > b.id ? 1 : -1));

    // Get Advisories
    const advisoriesSnapshot = await db.collection('advisories')
      .where('user', '==', userId)
      .where('isRead', '==', false)
      .get();
    const unreadAdvisories = advisoriesSnapshot.size;

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
    const usersSnapshot = await db.collection('users').count().get();
    const totalUsers = usersSnapshot.data().count;

    const reportsRef = db.collection('reports');
    const reportsSnapshot = await reportsRef.get();
    const reports = reportsSnapshot.docs.map(doc => doc.data());
    
    const totalReports = reports.length;

    const advisoriesSnapshot = await db.collection('advisories').count().get();
    const totalAdvisories = advisoriesSnapshot.data().count;

    const severityCount = {};
    reports.forEach(r => {
      const severity = r.severity;
      if (severity) {
        severityCount[severity] = (severityCount[severity] || 0) + 1;
      }
    });
    const severityBreakdown = Object.keys(severityCount).map(key => ({
      _id: key, count: severityCount[key]
    }));

    res.json({
      success: true,
      stats: { totalUsers, totalReports, totalAdvisories },
      severityBreakdown
    });
  } catch (err) {
    next(err);
  }
};
