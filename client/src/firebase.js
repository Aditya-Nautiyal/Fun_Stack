import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBzPWODC4gqd6rKzTJEUAzbKksoWWUP_JI",
  authDomain: "login-fun-stack.firebaseapp.com",
  projectId: "login-fun-stack",
  storageBucket: "login-fun-stack.firebasestorage.app",
  messagingSenderId: "949951310394",
  appId: "1:949951310394:web:4794a3503624c598cf2303",
  measurementId: "G-88J7P9XCVH",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
