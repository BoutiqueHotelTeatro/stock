import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDXv8E9kJhsyZUXZSD7_p1WTENh1r0bR_c",
  authDomain: "bht-stock-manager.firebaseapp.com",
  projectId: "bht-stock-manager",
  storageBucket: "bht-stock-manager.firebasestorage.app",
  messagingSenderId: "491539721972",
  appId: "1:491539721972:web:3c392c0d0e97c4b791b8a1"
  measurementId: "G-93ZLNS80XC"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);