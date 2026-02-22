const express = require('express');
const router = express.Router();
const { getAdvisories, getAdvisory, submitFeedback, resolveAdvisory } = require('../controllers/advisoryController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getAdvisories);
router.get('/:id', protect, getAdvisory);
router.post('/:id/feedback', protect, submitFeedback);
router.put('/:id/resolve', protect, resolveAdvisory);

module.exports = router;
