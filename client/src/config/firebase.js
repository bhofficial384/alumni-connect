import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyChwofze61TeyRWfIhDqv61aipo8my7Em8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "alumni-connect-fe52a.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "alumni-connect-fe52a",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "alumni-connect-fe52a.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "110354310295",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:110354310295:web:a479a56d184cdccc44b5d2",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-FL8JHEK91X"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export default app;
