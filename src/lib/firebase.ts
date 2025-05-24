import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, getDocs, collection } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyCIy63Q866PyT-9mRc0699tWt89Hunjx_g",
  authDomain: "streamania-d7adb.firebaseapp.com",
  projectId: "streamania-d7adb",
  storageBucket: "streamania-d7adb.firebasestorage.app",
  messagingSenderId: "137172389074",
  appId: "1:137172389074:web:8aa5a89b4ebb8583fb310b",
  measurementId: "G-RFTKPKDHBP"
};

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase app initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase app:', error);
  throw error;
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

// Test Firebase connection
export const testFirebaseConnection = async () => {
  try {
    console.log('Testing Firebase connection...');
    
    // Test Auth
    const authInstance = getAuth();
    console.log('Auth initialized:', authInstance.currentUser ? 'User logged in' : 'No user logged in');
    
    // Test Firestore
    console.log('Testing Firestore access...');
    const querySnapshot = await getDocs(collection(db, 'users'));
    console.log('Successfully read from Firestore. Documents count:', querySnapshot.size);
    
    console.log('✅ All Firebase services are working properly');
    return true;
  } catch (error) {
    console.error('Detailed Firebase connection error:', error);
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error;
  }
};

export default app;
