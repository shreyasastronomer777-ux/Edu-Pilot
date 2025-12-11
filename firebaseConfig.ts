// Import the functions you need from the SDKs you need
// Note: You must ensure these libraries are available in your environment (e.g. via import map or npm)
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
// REPLACE THESE VALUES WITH YOUR ACTUAL FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
// We use a try-catch block here to prevent the app from crashing in the demo environment
// if the keys are invalid or the library isn't loaded.
let app;
let auth;
let googleProvider;

try {
  // Uncomment the lines below when you have valid config
  // app = initializeApp(firebaseConfig);
  // auth = getAuth(app);
  // googleProvider = new GoogleAuthProvider();
} catch (error) {
  console.warn("Firebase not initialized. Using mock auth.");
}

export { auth, googleProvider };