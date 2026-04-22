const { admin, db, storage } = require('../config/firebase');
const aiService = require('../config/aiService');
const { v4: uuidv4 } = require('uuid');

// Helper to get user details
const getUserDetails = async (userId) => {
  const userDoc = await db.collection('users').doc(userId).get();
  return userDoc.exists ? { id: userId, name: userDoc.data().name, email: userDoc.data().email, farmDetails: userDoc.data().farmDetails } : { id: userId, name: 'Unknown' };
};

// @desc    Create new report
// @route   POST /api/reports
exports.createReport = async (req, res, next) => {
  try {
    const {
      cropType, cropStage, symptoms, severity,
      location, affectedArea, weatherConditions, isPublic
    } = req.body;

    const uploadedImages = [];
    
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        // Construct the relative path that will be served by express.static
        const publicUrl = `/uploads/${req.user.id}/${file.filename}`;
        
        uploadedImages.push({
          filename: file.filename,
          originalName: file.originalname,
          path: publicUrl,
          mimetype: file.mimetype,
          size: file.size,
          uploadedAt: new Date().toISOString()
        });
      }
    }

    const reportRef = db.collection('reports').doc();
    const reportData = {
      user: req.user.id,
      cropType,
      cropStage: cropStage || 'vegetative',
      symptoms,
      severity: severity || 'medium',
      location: location ? JSON.parse(location) : {},
      affectedArea: affectedArea ? JSON.parse(affectedArea) : {},
      weatherConditions: weatherConditions ? JSON.parse(weatherConditions) : {},
      images: uploadedImages,
      isPublic: isPublic === 'true',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await reportRef.set(reportData);

    // Trigger async AI analysis
    analyzeReportAsync(reportRef.id);

    res.status(201).json({
      success: true,
      message: 'Report submitted. AI analysis in progress...',
      report: { id: reportRef.id, ...reportData }
    });
  } catch (err) {
    next(err);
  }
};

async function analyzeReportAsync(reportId) {
  try {
    const reportRef = db.collection('reports').doc(reportId);
    const doc = await reportRef.get();
    if (!doc.exists) return;
    
    const report = doc.data();
    await reportRef.update({ status: 'analyzing', updatedAt: new Date().toISOString() });

    const analysis = await aiService.analyzeDisease({
      cropType: report.cropType,
      symptoms: report.symptoms,
      severity: report.severity,
      images: report.images
    });

    const aiAnalysisResult = {
      ...analysis,
      analyzedAt: new Date().toISOString()
    };

    await reportRef.update({
      status: 'analyzed',
      aiAnalysis: aiAnalysisResult,
      updatedAt: new Date().toISOString()
    });

    if (analysis.detectedDisease) {
      await generateAdvisoryForReport(reportId, report.user, analysis);
    }
  } catch (err) {
    console.error('AI Analysis failed:', err.message);
    await db.collection('reports').doc(reportId).update({ status: 'pending', updatedAt: new Date().toISOString() });
  }
}

async function generateAdvisoryForReport(reportId, userId, analysis) {
  try {
    const advisory = await aiService.generateAdvisory(analysis);
    const advisoryData = {
      report: reportId,
      user: userId,
      ...advisory,
      generatedBy: 'ai',
      isRead: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await db.collection('advisories').add(advisoryData);
    await db.collection('reports').doc(reportId).update({ status: 'advisory_sent', updatedAt: new Date().toISOString() });
  } catch (err) {
    console.error('Advisory generation failed:', err.message);
  }
}

// @desc    Get all reports for logged-in user
// @route   GET /api/reports
exports.getReports = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, cropType, severity } = req.query;
    
    let reportsQuery = db.collection('reports').where('user', '==', req.user.id);
    if (status) reportsQuery = reportsQuery.where('status', '==', status);
    if (cropType) reportsQuery = reportsQuery.where('cropType', '==', cropType);
    if (severity) reportsQuery = reportsQuery.where('severity', '==', severity);
    
    const snapshot = await reportsQuery.get();
    let reports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    const total = reports.length;
    const skip = (page - 1) * limit;
    reports = reports.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single report
// @route   GET /api/reports/:id
exports.getReport = async (req, res, next) => {
  try {
    const reportDoc = await db.collection('reports').doc(req.params.id).get();
    if (!reportDoc.exists) {
      return res.status(404).json({ error: 'Report not found.' });
    }
    
    let report = reportDoc.data();
    if (report.user !== req.user.id && !report.isPublic) {
      return res.status(404).json({ error: 'Report not found.' });
    }
    
    report.user = await getUserDetails(report.user);
    report.id = reportDoc.id;

    const advisoriesSnapshot = await db.collection('advisories').where('report', '==', reportDoc.id).limit(1).get();
    const advisory = advisoriesSnapshot.empty ? null : { id: advisoriesSnapshot.docs[0].id, ...advisoriesSnapshot.docs[0].data() };

    res.json({ success: true, report, advisory });
  } catch (err) {
    next(err);
  }
};

// @desc    Update report
// @route   PUT /api/reports/:id
exports.updateReport = async (req, res, next) => {
  try {
    const reportRef = db.collection('reports').doc(req.params.id);
    const doc = await reportRef.get();
    if (!doc.exists || doc.data().user !== req.user.id) {
       return res.status(404).json({ error: 'Report not found.' });
    }
    
    const updates = { ...req.body, updatedAt: new Date().toISOString() };
    await reportRef.update(updates);
    
    const updatedDoc = await reportRef.get();
    res.json({ success: true, report: { id: updatedDoc.id, ...updatedDoc.data() } });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete report
// @route   DELETE /api/reports/:id
exports.deleteReport = async (req, res, next) => {
  try {
    const reportRef = db.collection('reports').doc(req.params.id);
    const doc = await reportRef.get();
    if (!doc.exists || doc.data().user !== req.user.id) {
       return res.status(404).json({ error: 'Report not found.' });
    }
    
    await reportRef.delete();
    
    // Delete attached advisories
    const advisoriesQuery = await db.collection('advisories').where('report', '==', req.params.id).get();
    const batch = db.batch();
    advisoriesQuery.forEach(advisoryDoc => batch.delete(advisoryDoc.ref));
    await batch.commit();

    res.json({ success: true, message: 'Report deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

// @desc    Get community/public reports
// @route   GET /api/reports/community
exports.getCommunityReports = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, cropType } = req.query;
    
    let query = db.collection('reports').where('isPublic', '==', true).where('status', '==', 'advisory_sent');
    if (cropType) query = query.where('cropType', '==', cropType);
    
    const snapshot = await query.get();
    let reports = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Sort
    reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Paginate manually
    const skip = (page - 1) * limit;
    reports = reports.slice(skip, skip + parseInt(limit));
    
    // Populate users manually
    for (const r of reports) {
      r.user = await getUserDetails(r.user);
    }
    
    res.json({ success: true, reports });
  } catch (err) {
    next(err);
  }
};
