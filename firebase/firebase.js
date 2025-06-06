import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDsNQGHzwKv9B8W5BXEe9lnkUjmDLJtoSY",
  authDomain: "voicewave-d2a71.firebaseapp.com",
  projectId: "voicewave-d2a71",
  storageBucket: "voicewave-d2a71.appspot.com",
  messagingSenderId: "644267611179",
  appId: "1:644267611179:web:9d5a4adbafe41df7fc066e",
  measurementId: "G-YYE7VNTQ2N" 
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Initialize Firestore
const db = getFirestore(app);

export { auth, db };
export default app;
