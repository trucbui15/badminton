import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD3KbUHTx32Hl2g6jT1ck3cXgv-g-vphnI",
  authDomain: "badmintoncourts-28a16.firebaseapp.com",
  projectId: "badmintoncourts-28a16",
  storageBucket: "badmintoncourts-28a16.firebasestorage.app",
  messagingSenderId: "495544587158",
  appId: "1:495544587158:web:51b1fc889b9d7c5b1103b7",
  measurementId: "G-XTYYN2J6QH"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); 

export { db };
