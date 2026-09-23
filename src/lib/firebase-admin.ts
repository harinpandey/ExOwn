import * as admin from 'firebase-admin';

const projectId = process.env.FIREBASE_PROJECT_ID?.trim().replace(/^"|"$/g, "");
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim().replace(/^"|"$/g, "");
const privateKey = process.env.FIREBASE_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEYS;

const hasAdminCredentials = Boolean(
  projectId &&
  clientEmail &&
  privateKey
);

function normalizePrivateKey(key?: string) {
  if (!key) return undefined;
  let cleaned = key.trim();
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1);
  }
  return cleaned.replace(/\\n/g, "\n").replace(/\\r/g, "");
}

if (!admin.apps.length && hasAdminCredentials) {
  try {
    console.log("[firebase-admin] Initializing Firebase Admin for project:", projectId);
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: projectId!,
        clientEmail: clientEmail!,
        privateKey: normalizePrivateKey(privateKey),
      }),
    });
    console.log("[firebase-admin] Firebase Admin initialized successfully.");
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[firebase-admin] Firebase admin initialization error:", msg);
  }
} else if (!admin.apps.length) {
  console.warn("[firebase-admin] Firebase admin is not initialized.");
  if (!process.env.FIREBASE_PROJECT_ID) console.warn(" - FIREBASE_PROJECT_ID is missing");
  if (!process.env.FIREBASE_CLIENT_EMAIL) console.warn(" - FIREBASE_CLIENT_EMAIL is missing");
  if (!privateKey) console.warn(" - FIREBASE_PRIVATE_KEY is missing");
}

export const adminAuth = admin.apps.length ? admin.auth() : null;
export const adminDb = admin.apps.length ? admin.firestore() : null;
export const adminMessaging = admin.apps.length ? admin.messaging() : null;
