import * as admin from 'firebase-admin';

const hasAdminCredentials = Boolean(
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY
);

if (!admin.apps.length && hasAdminCredentials) {
  try {
    console.log("[firebase-admin] Initializing Firebase Admin for project:", process.env.FIREBASE_PROJECT_ID);
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    console.log("[firebase-admin] Firebase Admin initialized successfully.");
  } catch (error: any) {
    console.error('[firebase-admin] Firebase admin initialization error:', error.message);
  }
} else if (!admin.apps.length) {
  console.warn('[firebase-admin] Firebase admin is not initialized.');
  if (!process.env.FIREBASE_PROJECT_ID) console.warn(' - FIREBASE_PROJECT_ID is missing');
  if (!process.env.FIREBASE_CLIENT_EMAIL) console.warn(' - FIREBASE_CLIENT_EMAIL is missing');
  if (!process.env.FIREBASE_PRIVATE_KEY) console.warn(' - FIREBASE_PRIVATE_KEY is missing');
}

export const adminAuth = admin.apps.length ? admin.auth() : null;
export const adminDb = admin.apps.length ? admin.firestore() : null;
