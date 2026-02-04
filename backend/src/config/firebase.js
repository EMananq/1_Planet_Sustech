const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
let db = null;
let firebaseInitialized = false;

try {
  const serviceAccount = require(serviceAccountPath);
  
  // Only initialize if it's a valid service account (not placeholder)
  if (serviceAccount.project_id && serviceAccount.project_id !== 'YOUR_PROJECT_ID') {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
    db = admin.firestore();
    firebaseInitialized = true;
    console.log('✅ Firebase Admin initialized successfully');
  } else {
    console.warn('⚠️ Firebase not configured: Please update serviceAccountKey.json with real credentials');
    console.log('📝 Get your service account key from Firebase Console > Project Settings > Service Accounts');
  }
} catch (error) {
  console.warn('⚠️ Firebase not initialized:', error.message);
  console.log('📝 Please add your serviceAccountKey.json file to the config folder');
}

module.exports = { admin, db, firebaseInitialized };

