let admin = null;
try {
  // Lazy-safe import: avoids boot crash if dependency is missing.
  // eslint-disable-next-line global-require
  admin = require('firebase-admin');
} catch (_) {
  admin = null;
}

let initialized = false;

const initFirebaseAdmin = () => {
  if (initialized) return;
  if (!admin) {
    throw new Error('firebase-admin package is not installed');
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKeyRaw) {
    return;
  }

  const privateKey = privateKeyRaw.replace(/\\n/g, '\n');
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });

  initialized = true;
};

const verifyFirebaseIdToken = async (idToken) => {
  initFirebaseAdmin();
  if (!initialized) {
    throw new Error('Firebase Admin is not configured');
  }
  return admin.auth().verifyIdToken(idToken);
};

module.exports = { verifyFirebaseIdToken };
