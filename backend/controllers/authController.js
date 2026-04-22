const { admin, db } = require('../config/firebase');

// @desc    Get current user
// @route   GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.id).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found in database.' });
    }
    res.json({ success: true, user: { id: req.user.id, ...userDoc.data() } });
  } catch (err) {
    next(err);
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, farmDetails } = req.body;
    await db.collection('users').doc(req.user.id).update({
      name,
      farmDetails
    });
    
    // Also update Firebase Auth display name if changed
    if (name) {
      await admin.auth().updateUser(req.user.id, { displayName: name });
    }

    const updatedUserDoc = await db.collection('users').doc(req.user.id).get();
    res.json({ success: true, user: { id: req.user.id, ...updatedUserDoc.data() } });
  } catch (err) {
    next(err);
  }
};

// @desc    Register and Login are now handled natively by Firebase on the frontend.
// These stubs can be used if backend specifically needs to create users via Admin SDK.
exports.register = async (req, res) => res.status(400).json({ error: 'Please register via Frontend Firebase SDK.' });
exports.login = async (req, res) => res.status(400).json({ error: 'Please login via Frontend Firebase SDK.' });
exports.changePassword = async (req, res) => res.status(400).json({ error: 'Change password via Frontend Firebase SDK.' });
