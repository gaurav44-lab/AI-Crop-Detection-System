const Advisory = require('../models/Advisory');
const Report = require('../models/Report');

// @desc    Get all advisories for user
// @route   GET /api/advisory
exports.getAdvisories = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, isRead } = req.query;
    const query = { user: req.user.id };
    if (isRead !== undefined) query.isRead = isRead === 'true';

    const [advisories, total, unreadCount] = await Promise.all([
      Advisory.find(query)
        .populate('report', 'cropType symptoms status createdAt images')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit)),
      Advisory.countDocuments(query),
      Advisory.countDocuments({ user: req.user.id, isRead: false })
    ]);

    res.json({ success: true, advisories, total, unreadCount });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single advisory
// @route   GET /api/advisory/:id
exports.getAdvisory = async (req, res, next) => {
  try {
    const advisory = await Advisory.findOne({
      _id: req.params.id,
      user: req.user.id
    }).populate('report');

    if (!advisory) {
      return res.status(404).json({ error: 'Advisory not found.' });
    }

    // Mark as read
    if (!advisory.isRead) {
      advisory.isRead = true;
      await advisory.save();
    }

    res.json({ success: true, advisory });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit feedback on advisory
// @route   POST /api/advisory/:id/feedback
exports.submitFeedback = async (req, res, next) => {
  try {
    const { helpful, rating, comment } = req.body;
    const advisory = await Advisory.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { feedback: { helpful, rating, comment } },
      { new: true }
    );

    if (!advisory) {
      return res.status(404).json({ error: 'Advisory not found.' });
    }

    res.json({ success: true, message: 'Feedback submitted. Thank you!', advisory });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark advisory as resolved
// @route   PUT /api/advisory/:id/resolve
exports.resolveAdvisory = async (req, res, next) => {
  try {
    const advisory = await Advisory.findOne({ _id: req.params.id, user: req.user.id });
    if (!advisory) return res.status(404).json({ error: 'Advisory not found.' });

    await Report.findByIdAndUpdate(advisory.report, { status: 'resolved' });
    res.json({ success: true, message: 'Report marked as resolved.' });
  } catch (err) {
    next(err);
  }
};
