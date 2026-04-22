const { admin, db } = require('../config/firebase');

const protect = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Fetch user from Firestore
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    
    if (!userDoc.exists) {
      // Auto-create user if they don't exist yet but have a valid token
      // This helps with first-time logins via Google Auth
      const newUser = {
        name: decodedToken.name || decodedToken.email.split('@')[0],
        email: decodedToken.email,
        role: 'farmer',
        farmDetails: { location: '', farmSize: 0, primaryCrops: [] },
        isActive: true,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
      await db.collection('users').doc(decodedToken.uid).set(newUser);
      
      req.user = { id: decodedToken.uid, ...newUser };
    } else {
      const userData = userDoc.data();
      if (!userData.isActive) {
        return res.status(401).json({ error: 'Account is deactivated.' });
      }
      // Update last login
      await db.collection('users').doc(decodedToken.uid).update({ 
        lastLogin: new Date().toISOString() 
      });
      
      req.user = { id: decodedToken.uid, ...userData };
    }

    next();
  } catch (err) {
    if (err.code === 'auth/id-token-expired') {
      return res.status(401).json({ error: 'Token has expired.' });
    }
    return res.status(401).json({ error: 'Invalid token.', details: err.message });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Role '${req.user.role}' is not authorized to access this resource.` 
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
