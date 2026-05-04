import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBfERAZAJl28igZC8ZUcOBOswnHbudPib4",
  authDomain: "pathforge-6fec0.firebaseapp.com",
  projectId: "pathforge-6fec0",
  storageBucket: "pathforge-6fec0.firebasestorage.app",
  messagingSenderId: "250843631485",
  appId: "1:250843631485:web:0727046e6490bd0fb18614"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
