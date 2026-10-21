import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, type User } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const ADMIN_EMAIL = 'alqysyanas11@gmail.com';

export const firebaseConfig = {
  apiKey: "AIzaSyBk1ZbYqQDTCTThVcfGGWkqy1j2m8RDjeY",
  authDomain: "deliveryanas-app.firebaseapp.com",
  projectId: "deliveryanas-app",
  storageBucket: "deliveryanas-app.firebasestorage.app",
  messagingSenderId: "685235650426",
  appId: "1:685235650426:web:d6679fa743564d9108a0c3",
  measurementId: "G-STBTP4TVXZ",
};

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export function isUserAdmin(user: User | null): boolean {
  if (!user || !user.email) return false;
  return user.email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
}
