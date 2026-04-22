import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD3I4oLxlIQZvxYbCF_Zss8BzhbDw7K_vs",
  authDomain: "agrohelp-4a6b5.firebaseapp.com",
  projectId: "agrohelp-4a6b5",
  storageBucket: "agrohelp-4a6b5.firebasestorage.app",
  messagingSenderId: "740524067468",
  appId: "1:740524067468:web:9cfc6e1d0c97966f0749a9"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
