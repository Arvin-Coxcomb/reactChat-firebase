// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDvSKF0d2oVYmsfhrMQNm7fsgTwJ-Py2NU",//import.meta.env.VITE_API_KEY,
  authDomain: "reactwebchat-86c7d.firebaseapp.com",
  projectId: "reactwebchat-86c7d",
  storageBucket: "reactwebchat-86c7d.appspot.com",
  messagingSenderId: "935886541429",
  appId: "1:935886541429:web:f3ee216e3721474c775e3c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const db = getFirestore();
export const storage = getStorage();