"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Modal } from "antd";
import BookingModal from "@/app/user/components/form";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/app/source/firebaseConfig"; 

export default function BadmintonSchedule() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [valueName, setValueName] = useState("");
  const [valuePhoneNumber, setValuePhoneNumber] = useState("");
  const [valueEmail, setValueEmail] = useState("");
  const [selectId, setSelectId] = useState(0);
  const [courtsData, setCourtsData] = useState<any[]>([]);

  useEffect(() => {
    const fetchCourts = async () => {
      try {
        const snapshot = await getDocs(collection(db, "courts"));
        const courtsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCourtsData(courtsList);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu sân:", error);
      }
    };

    fetchCourts();
  }, []);

  const handleModalClose = () => setIsModalOpen(false);

  return (
    <div className="bg-blue-50 min-h-screen p-6 flex flex-col items-center justify-center">
      <div>
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-300 to-green-300 text-center border-gray-200 p-8 mb-6 text-gray-800 rounded-lg flex flex-col justify-center items-center shadow-xl">
          <h1 className="text-4xl font-bold text-blue-600 mb-4">
            THẾ GIỚI CẦU LÔNG
          </h1>
          <p className="text-xl text-blue-500 mb-2">0393118322</p>
          <p className="text-base text-gray-600 max-w-3xl mx-auto">
            Trung tâm giải trí Cầu Lông An Nhơn. Số 8 Trần Phú, Phường Bình
            Định, Tx. An Nhơn
          </p>
        </div>

        {/* Courts List */}
        <div className="grid grid-cols-1 gap-4 p-[10px] rounded-[10px]">
          {courtsData.map((court) => (
            <div
              key={court.id}
              className="flex gap-10 bg-white p-4 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition"
              onClick={() => {
                setIsModalOpen(true);
                setSelectId(court.id);
              }}
            >
              <Image
                src={court.image}
                alt={court.name}
                width={200}
                height={300}
                className="rounded-lg"
              />
              <div className="text-gray-700">
                <h2 className="text-xl font-bold">{court.name}</h2>
                <p className="text-sm">
                  <strong>Loại Sân:</strong> {court.type}
                </p>
                <p className="text-sm">
                  <strong>Giá Sân:</strong> {court.price} VND
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Cầu lông là thứ tồn tại duy nhất, những thứ còn lại có hay
                  không không quan trọng...
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Modal */}
      <Modal
        footer={null}
        open={isModalOpen}
        onCancel={handleModalClose}
        width="80vw"
        centered
      >
        <div className="flex flex-col justify-center items-center gap-1 mb-4">
          <h1 className="text-2xl font-bold text-blue-600">THẾ GIỚI CẦU LÔNG</h1>
          <p className="text-sm">0393118322</p>
          <p className="text-xs">
            Trung tâm giải trí Cầu Lông An Nhơn. Số 8 Trần Phú, Phường Bình Định,
            Tx. An Nhơn
          </p>
        </div>
        <BookingModal court={selectId} />
      </Modal>
    </div>
  );
}
