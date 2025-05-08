import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD3KbUHTx32Hl2g6jT1ck3cXgv-g-vphnI",
  authDomain: "badmintoncourts-28a16.firebaseapp.com",
  projectId: "badmintoncourts-28a16",
  storageBucket: "badmintoncourts-28a16.firebasestorage.app",
  messagingSenderId: "495544587158",
  appId: "1:495544587158:web:51b1fc889b9d7c5b1103b7",
  measurementId: "G-XTYYN2J6QH"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app); 

export { db, collection, getDocs, addDoc, serverTimestamp };
























// import { initializeApp } from "firebase/app";
// import { getFirestore, collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";

// const firebaseConfig = {
//   apiKey: "AIzaSyCR_vK6AHA1UkNX3ECydWgzSh4lBVYFong",
//   authDomain: "badmintoncourts2.firebaseapp.com",
//   projectId: "badmintoncourts2",
//   storageBucket: "badmintoncourts2.firebasestorage.app",
//   messagingSenderId: "1077544743319",
//   appId: "1:1077544743319:web:e312af23deb253212354d2"
//   // measurementId: "G-XTYYN2J6QH"
// };

// // Khởi tạo Firebase
// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app); 

// export { db, collection, getDocs, addDoc, serverTimestamp };