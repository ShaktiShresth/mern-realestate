// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-realestate-559e2.firebaseapp.com",
  projectId: "mern-realestate-559e2",
  storageBucket: "mern-realestate-559e2.appspot.com",
  messagingSenderId: "89670995303",
  appId: "1:89670995303:web:d03c01bbb518c0d8f533c2",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
