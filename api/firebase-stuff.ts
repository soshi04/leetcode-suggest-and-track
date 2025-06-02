import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin if it hasn't been initialized
if (!getApps().length) {
    admin.initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    console.log('Firebase Admin initialized');
  }

export { admin };

const db = getFirestore();

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