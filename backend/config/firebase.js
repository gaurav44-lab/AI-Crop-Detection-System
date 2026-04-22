const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Using the storage bucket provided in frontend config
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "agrohelp-4a6b5.firebasestorage.app"
});

const db = admin.firestore();
const storage = admin.storage();
const auth = admin.auth();

module.exports = { admin, db, storage, auth };
