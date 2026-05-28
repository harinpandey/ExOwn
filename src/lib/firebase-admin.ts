import * as admin from 'firebase-admin';

const privateKey = process.env.FIREBASE_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEYS;

const hasAdminCredentials = Boolean(
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  privateKey
);

function normalizePrivateKey(key?: string) {
  return key?.replace(/^"|"$/g, "").replace(/\\n/g, "\n");
}

if (!admin.apps.length && hasAdminCredentials) {
  try {
    console.log("[firebase-admin] Initializing Firebase Admin for project:", process.env.FIREBASE_PROJECT_ID);
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: normalizePrivateKey(privateKey),
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
  if (!privateKey) console.warn(' - FIREBASE_PRIVATE_KEY is missing');
}

export const adminAuth = admin.apps.length ? admin.auth() : null;
export const adminDb = admin.apps.length ? admin.firestore() : null;
export const adminMessaging = admin.apps.length ? admin.messaging() : null;
