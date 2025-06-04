import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';

let app: App;
let db: Firestore;
let auth: Auth;

if (!getApps().length) {
  app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
} else {
  app = getApps()[0]; // reuse existing app
}

db = getFirestore(app);
auth = getAuth(app);

export { auth, db };

export async function checkAndIncrement(uid: string) {
  const today = new Date().toISOString().slice(0, 10);
  const ref = db.collection('usage').doc(`${uid}_${today}`);
  const docSnap = await ref.get();

  if (docSnap.exists) {
    const { count } = docSnap.data() || {};
    if (count >= 3) return false;
    await ref.update({ count: count + 1 });
  } else {
    await ref.set({ uid, date: today, count: 1 });
  }
  return true;
}