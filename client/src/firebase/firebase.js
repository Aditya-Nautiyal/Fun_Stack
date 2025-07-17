import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import devConfig from "./firebaseConfig.dev.jsx"; // Use dev config for development
import prodConfig from "./firebaseConfig.prod.jsx"; // Use prod config for production

const firebaseConfig = import.meta.env.MODE === 'development' ? devConfig : prodConfig;

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
