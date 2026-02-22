const express = require('express');
const router = express.Router();
const {
  createReport, getReports, getReport,
  updateReport, deleteReport, getCommunityReports
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

router.get('/community', protect, getCommunityReports);
router.route('/')
  .get(protect, getReports)
  .post(protect, upload.array('images', 5), handleUploadError, createReport);

router.route('/:id')
  .get(protect, getReport)
  .put(protect, updateReport)
  .delete(protect, deleteReport);

module.exports = router;
