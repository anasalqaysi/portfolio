import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, type User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'alqysyanas11@gmail.com';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'deliveryanas-app.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'deliveryanas-app',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'deliveryanas-app.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '685235650426',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:685235650426:web:d6679fa743564d9108a0c3',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-STBTP4TVXZ',
};

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export function isUserAdmin(user: User | null): boolean {
  if (!user || !user.email) return false;
  return user.email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
}
