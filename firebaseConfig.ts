
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCn1zfz3qSb7RA5EU0MZHl4e7rbnRYJ_Sc",
  authDomain: "edupilot-eabe8.firebaseapp.com",
  projectId: "edupilot-eabe8",
  storageBucket: "edupilot-eabe8.firebasestorage.app",
  messagingSenderId: "533575761970",
  appId: "1:533575761970:web:63964b8af12c1a7343fc2b"
};

// Initialize Firebase App as a singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Explicitly link services to the app instance
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize Google Auth Provider with custom parameters
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { app, auth, db, googleProvider };
