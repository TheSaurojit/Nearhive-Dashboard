import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getMessaging } from 'firebase-admin/messaging';

// Initialize Firebase Admin SDK
const initializeFirebaseAdmin = () => {
  // Check if Firebase Admin is already initialized
  if (getApps().length === 0) {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    };

    initializeApp({
      credential: cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  }
};

// Initialize the admin SDK
initializeFirebaseAdmin();


// Export the services you need
export const adminAuth = getAuth();
export const adminDb = getFirestore();
export const adminMessage = getMessaging();


