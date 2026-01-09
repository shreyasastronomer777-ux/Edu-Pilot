import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCn1zfz3qSb7RA5EU0MZHl4e7rbnRYJ_Sc",
  authDomain: "edupilot-eabe8.firebaseapp.com",
  projectId: "edupilot-eabe8",
  storageBucket: "edupilot-eabe8.firebasestorage.app",
  messagingSenderId: "533575761970",
  appId: "1:533575761970:web:63964b8af12c1a7343fc2b"
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Services strictly after app initialization
// This ensures the internal component registry is ready
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider };