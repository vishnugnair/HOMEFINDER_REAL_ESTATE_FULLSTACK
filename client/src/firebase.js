// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-estate-e676e.firebaseapp.com",
  projectId: "mern-estate-e676e",
  storageBucket: "mern-estate-e676e.appspot.com",
  messagingSenderId: "670817812130",
  appId: "1:670817812130:web:78c44e840e642a161d61fb",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
