const { db } = require('../config/firebase');

// Helper to get report details
const getReportDetails = async (reportId) => {
  const reportDoc = await db.collection('reports').doc(reportId).get();
  if (!reportDoc.exists) return null;
  const data = reportDoc.data();
  return { id: reportId, cropType: data.cropType, symptoms: data.symptoms, status: data.status, createdAt: data.createdAt, images: data.images };
};

// @desc    Get all advisories for user
// @route   GET /api/advisory
exports.getAdvisories = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, isRead } = req.query;
    
    let query = db.collection('advisories').where('user', '==', req.user.id);
    if (isRead !== undefined) query = query.where('isRead', '==', isRead === 'true');

    const unreadSnapshot = await db.collection('advisories').where('user', '==', req.user.id).where('isRead', '==', false).get();
    const unreadCount = unreadSnapshot.size;

    const snapshot = await query.get();
    let advisories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Sort
    advisories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    const total = advisories.length;
    
    // Paginate manually
    const skip = (page - 1) * limit;
    advisories = advisories.slice(skip, skip + parseInt(limit));

    // Populate report details
    for (const adv of advisories) {
      adv.report = await getReportDetails(adv.report);
    }

    res.json({ success: true, advisories, total, unreadCount });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single advisory
// @route   GET /api/advisory/:id
exports.getAdvisory = async (req, res, next) => {
  try {
    const advisoryRef = db.collection('advisories').doc(req.params.id);
    const doc = await advisoryRef.get();
    
    if (!doc.exists || doc.data().user !== req.user.id) {
      return res.status(404).json({ error: 'Advisory not found.' });
    }

    let advisory = doc.data();
    advisory.id = doc.id;
    advisory.report = await getReportDetails(advisory.report);

    // Mark as read
    if (!advisory.isRead) {
      await advisoryRef.update({ isRead: true, updatedAt: new Date().toISOString() });
      advisory.isRead = true;
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
    const advisoryRef = db.collection('advisories').doc(req.params.id);
    
    const doc = await advisoryRef.get();
    if (!doc.exists || doc.data().user !== req.user.id) {
       return res.status(404).json({ error: 'Advisory not found.' });
    }

    await advisoryRef.update({
      feedback: { helpful, rating, comment },
      updatedAt: new Date().toISOString()
    });

    const updatedDoc = await advisoryRef.get();
    res.json({ success: true, message: 'Feedback submitted. Thank you!', advisory: { id: updatedDoc.id, ...updatedDoc.data() } });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark advisory as resolved
// @route   PUT /api/advisory/:id/resolve
exports.resolveAdvisory = async (req, res, next) => {
  try {
    const advisoryRef = db.collection('advisories').doc(req.params.id);
    const doc = await advisoryRef.get();
    
    if (!doc.exists || doc.data().user !== req.user.id) {
       return res.status(404).json({ error: 'Advisory not found.' });
    }

    const reportId = doc.data().report;
    await db.collection('reports').doc(reportId).update({
      status: 'resolved',
      updatedAt: new Date().toISOString()
    });

    res.json({ success: true, message: 'Report marked as resolved.' });
  } catch (err) {
    next(err);
  }
};
