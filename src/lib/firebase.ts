import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBP6rXgyeCc6vpxPLlSwHydPZgRg3NmXyI",
  authDomain: "hall-of-faith-web.firebaseapp.com",
  projectId: "hall-of-faith-web",
  storageBucket: "hall-of-faith-web.firebasestorage.app",
  messagingSenderId: "873261772024",
  appId: "1:873261772024:web:60f3427fc9ee05b974df0d",
  measurementId: "G-Z2E56EM26S"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
