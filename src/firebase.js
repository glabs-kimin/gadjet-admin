import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCJ90rCAQ4rK3xJw7Vpbu5U8dO5cu6Xk6Q",
  authDomain: "gadjet-admin.firebaseapp.com",
  projectId: "gadjet-admin",
  storageBucket: "gadjet-admin.firebasestorage.app",
  messagingSenderId: "868315407808",
  appId: "1:868315407808:web:74f4a4527e12c6f9501425",
  measurementId: "G-KN4M87EEL6"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
