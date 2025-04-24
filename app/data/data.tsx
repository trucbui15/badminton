export  const courtsData = [
  { id: 0, name: "Sân 1", type: "Thảm Silicon", price: 100000, image: "/images/san1.jpg" },
  { id: 1, name: "Sân 2", type: "Thảm PU", price: 120000, image: "/images/san2.jpg" },
  { id: 2, name: "Sân 3", type: "Thảm Gỗ", price: 110000, image: "/images/san3.jpg" },
  { id: 3, name: "Sân 4", type: "Có mái che", price: 110000, image: "/images/san4.jpg" },
  { id: 4, name: "Sân 5", type: "Sân Quốc Tế", price: 990000, image: "/images/san5.jpg" },
];

import { db } from "@/app/source/firebaseConfig";
import {doc, setDoc} from  "firebase/firestore";

const pushCourtsFirestore = async () => {
  try{
    for (const court of courtsData){
      const docref = doc(db, "courts", court.id.toString());
      await setDoc(docref, court);
    }
    console.log("✅ Đã lưu dữ liệu courts lên Firestore!");
  }catch(err){
    console.error("❌ Lỗi khi lưu dữ liệu:", err);
  }
};

if (process.env.NODE_ENV === "development") {
  pushCourtsFirestore();
}