
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCIy63Q866PyT-9mRc0699tWt89Hunjx_g",
  authDomain: "streamania-d7adb.firebaseapp.com",
  projectId: "streamania-d7adb",
  storageBucket: "streamania-d7adb.firebasestorage.app",
  messagingSenderId: "137172389074",
  appId: "1:137172389074:web:8aa5a89b4ebb8583fb310b",
  measurementId: "G-RFTKPKDHBP"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
