"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, doc } from "@firebase/firestore";
import { db } from "@/app/source/firebaseConfig"; 
import Image from "next/image";

export default function Home() {
  const [courts, setCourts] = useState<any[]>([]);

  useEffect(() => {
    const fetchCourts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "courts"));
        const courtList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCourts(courtList);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu sân:", error);
      }
    };

    fetchCourts();
  }, []);

  return (
    <div className="bg-[url('/images/bgbadminton.jpg')] bg-cover bg-center min-h-screen w-full flex flex-col overflow-hidden p-4">
      <div className="flex justify-between">
        <div className="flex items-center gap-2 text-white">
          <div className="w-6 h-6 bg-yellow-500 rounded-full"></div>
          <div className="w-6 h-6 bg-blue-600 rounded-full -ml-2"></div>
          <h1 className="text-xl font-bold">CourtBadminton</h1>
        </div>
      </div>

      <div className="flex flex-col items-center mt-10">
        <h2 className="text-4xl font-bold text-white">Danh Sách Sân</h2>
        <p className="text-lg text-white">Chọn sân phù hợp để đặt lịch ngay!</p>

        {/* Danh sách sân */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-6">
          {courts.length > 0 ? (
            courts.map((court) => (
              <div key={court.id} className="bg-white p-4 rounded-lg shadow-md w-60">
                <div className="w-full h-40 relative">
                  <Image
                    src={court.imageUrl || "/images/default-court.jpg"}
                    alt={court.id}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-md"
                  />
                </div>
                {/* <h3 className="text-lg font-semibold mt-2 text-center">{court.name}</h3> */}
                {/* <p className="text-gray-600 text-center"> {court.name}</p> */}
                <p className="text-gray-600 text-center">Số sân: {court.courtNumber}</p>
                <p className="text-blue-500 font-bold text-center">{court.type}</p>
                <button className="mt-2 w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Xem Ngay
                </button>
              </div>
            ))
          ) : (
            <p className="text-white mt-4">Đang tải danh sách sân...</p>
          )}
        </div>
      </div>
    </div>
  );
}
