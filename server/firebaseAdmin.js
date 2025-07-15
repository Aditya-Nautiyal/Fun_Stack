const path = require('path');
require('dotenv').config({
  path: `.env.${process.env.NODE_ENV || 'development'}`
});

const admin = require("firebase-admin");

// Use absolute path to avoid require issues
const serviceAccountPath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT);
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = { db };
