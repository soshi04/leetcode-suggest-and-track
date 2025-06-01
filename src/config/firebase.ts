// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCt-1-fvXONZKiGQp5wS5lh3Tw_tGo5ldo",
  authDomain: "leetcode-suggest.firebaseapp.com",
  projectId: "leetcode-suggest",
  storageBucket: "leetcode-suggest.firebasestorage.app",
  messagingSenderId: "50835015521",
  appId: "1:50835015521:web:48920b47662a7600a4a720",
  measurementId: "G-7SZT059GB7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { app, analytics, auth }; 