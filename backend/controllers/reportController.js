const Report = require('../models/Report');
const Advisory = require('../models/Advisory');
const aiService = require('../config/aiService');
const path = require('path');

// @desc    Create new report
// @route   POST /api/reports
exports.createReport = async (req, res, next) => {
  try {
    const {
      cropType, cropStage, symptoms, severity,
      location, affectedArea, weatherConditions, isPublic
    } = req.body;

    // Process uploaded images
    const images = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: `/uploads/${req.user.id}/${file.filename}`,
      mimetype: file.mimetype,
      size: file.size
    })) : [];

    const report = await Report.create({
      user: req.user.id,
      cropType,
      cropStage,
      symptoms,
      severity,
      location: location ? JSON.parse(location) : {},
      affectedArea: affectedArea ? JSON.parse(affectedArea) : {},
      weatherConditions: weatherConditions ? JSON.parse(weatherConditions) : {},
      images,
      isPublic: isPublic === 'true'
    });

    // Trigger async AI analysis
    analyzeReportAsync(report._id);

    res.status(201).json({
      success: true,
      message: 'Report submitted. AI analysis in progress...',
      report
    });
  } catch (err) {
    next(err);
  }
};

// Async AI analysis (runs in background)
async function analyzeReportAsync(reportId) {
  try {
    const report = await Report.findById(reportId);
    if (!report) return;

    await Report.findByIdAndUpdate(reportId, { status: 'analyzing' });

    // Call AI service
    const analysis = await aiService.analyzeDisease({
      cropType: report.cropType,
      symptoms: report.symptoms,
      severity: report.severity,
      images: report.images
    });

    await Report.findByIdAndUpdate(reportId, {
      status: 'analyzed',
      aiAnalysis: {
        ...analysis,
        analyzedAt: new Date()
      }
    });

    // Auto-generate advisory
    if (analysis.detectedDisease) {
      await generateAdvisoryForReport(reportId, report.user, analysis);
    }
  } catch (err) {
    console.error('AI Analysis failed:', err.message);
    await Report.findByIdAndUpdate(reportId, { status: 'pending' });
  }
}

async function generateAdvisoryForReport(reportId, userId, analysis) {
  try {
    const advisory = await aiService.generateAdvisory(analysis);
    await Advisory.create({
      report: reportId,
      user: userId,
      ...advisory,
      generatedBy: 'ai'
    });
    await Report.findByIdAndUpdate(reportId, { status: 'advisory_sent' });
  } catch (err) {
    console.error('Advisory generation failed:', err.message);
  }
}

// @desc    Get all reports for logged-in user
// @route   GET /api/reports
exports.getReports = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, cropType, severity } = req.query;
    const query = { user: req.user.id };

    if (status) query.status = status;
    if (cropType) query.cropType = cropType;
    if (severity) query.severity = severity;

    const skip = (page - 1) * limit;
    const [reports, total] = await Promise.all([
      Report.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Report.countDocuments(query)
    ]);

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
    const report = await Report.findOne({
      _id: req.params.id,
      $or: [{ user: req.user.id }, { isPublic: true }]
    }).populate('user', 'name email');

    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    // Fetch advisory if exists
    const advisory = await Advisory.findOne({ report: report._id });

    res.json({ success: true, report, advisory });
  } catch (err) {
    next(err);
  }
};

// @desc    Update report
// @route   PUT /api/reports/:id
exports.updateReport = async (req, res, next) => {
  try {
    const report = await Report.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    res.json({ success: true, report });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete report
// @route   DELETE /api/reports/:id
exports.deleteReport = async (req, res, next) => {
  try {
    const report = await Report.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }
    await Advisory.deleteMany({ report: report._id });
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
    const query = { isPublic: true, status: 'advisory_sent' };
    if (cropType) query.cropType = cropType;

    const reports = await Report.find(query)
      .populate('user', 'name farmDetails.location')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, reports });
  } catch (err) {
    next(err);
  }
};
