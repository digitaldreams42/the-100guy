// lib/firebase-admin.js
import admin from 'firebase-admin';

// Decode the base64 service account key
const serviceAccountB64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_B64;
if (!serviceAccountB64) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY_B64 environment variable is not set.');
}
const serviceAccountJson = Buffer.from(serviceAccountB64, 'base64').toString('ascii');
const serviceAccount = JSON.parse(serviceAccountJson);

// Initialize the Firebase Admin SDK if it hasn't been already.
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            // You might need to add your databaseURL here if it's not automatically discovered
            // databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
        });
    } catch (error) {
        console.error('Firebase admin initialization error', error.stack);
    }
}

// Export the admin db instance
export const adminDb = admin.firestore();
