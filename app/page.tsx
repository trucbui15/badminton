"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input, Modal } from "antd";
import BookingModal from "@/app/user/components/form";
import { courtsData } from "./data/data";
import { db } from "@/app/source/firebaseConfig";

export default function BadmintonSchedule() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [valueName, setValueName] = useState("");
  const [valuePhoneNumber, setValuePhoneNumber] = useState("");
  const [valueEmail, setValueEmail] = useState("");
  const [selectId, setSelectId] = useState(1);

  const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) =>
    setValueName(e.target.value);
  const handleChangePhoneNumber = (e: React.ChangeEvent<HTMLInputElement>) =>
    setValuePhoneNumber(e.target.value);
  const handleChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) =>
    setValueEmail(e.target.value);

  const [today, setToday] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(0);

  useEffect(() => {
    setToday(new Date());
  }, []);

  if (!today) return <p className="text-center text-gray-500">Đang tải...</p>;

  const weekdays = [
    "Chủ Nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
  ];
  const todayIndex = today.getDay();

  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return {
      day: weekdays[(todayIndex + i) % 7],
      date: date.toLocaleDateString("vi-VN"),
    };
  });

  return (
    <div className="bg-blue-50 min-h-screen p-6 flex flex-col items-center justify-center ">
      <div className="">
      <div className="relative bg-gradient-to-r from-blue-300 to-green-300 text-center border-gray-200 p-8 mb-6 text-gray-800 rounded-lg flex flex-col justify-center items-center shadow-xl">
  
     
  <h1 className="text-4xl font-bold text-blue-600 mb-4">
    THẾ GIỚI CẦU LÔNG
  </h1>
  <p className="text-xl text-blue-500 mb-2">0393118322</p>
  <p className="text-base text-gray-600 max-w-3xl mx-auto">
    Trung tâm giải trí Cầu Lông An Nhơn. Số 8 Trần Phú, Phường Bình Định, Tx. An Nhơn
  </p>
</div>


        <div className="flex justify-around border-b border-gray-300 pb-2 mb-4">
          {next7Days.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                setSelectedDay(index);
              }}
              className={`flex flex-col items-center text-blue-400 relative ${
                selectedDay === index ? "font-bold" : ""
              }`}
            >
              <p className="text-sm">{item.day}</p>
              <p className="text-xs">{item.date}</p>
              {selectedDay === index && (
                <span className="absolute -bottom-2 w-full h-1 bg-blue-700 rounded-full"></span>
              )}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4  p-[10px] rounded-[10px]">
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
                  <span className="">
                    <strong>Loại Sân:</strong>
                  </span>{" "}
                  {court.type}
                </p>
                <p className="text-sm">
                  <span className="">
                    <strong>Giá Sân:</strong>
                  </span>{" "}
                  {court.price}
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

      {/* Modal */}
      <Modal
        title="Thông báo"
        open={isModalOpen}
        onOk={() => setIsModalOpen(false)}
        onCancel={() => setIsModalOpen(false)}
        width="80vw" // Chiếm 80% chiều rộng màn hình
        centered // Đảm bảo modal hiển thị chính giữa
      >
        <div className="flex flex-col justify-center items-center gap-1">
          <h1 className="text-2xl font-bold text-blue-600">
            THẾ GIỚI CẦU LÔNG
          </h1>
          <p className="text-sm">0393118322</p>
          <p className="text-xs">
            Trung tâm giải trí Cầu Lông An Nhơn. Số 8 Trần Phú, Phường Bình
            Định, Tx. An Nhơn
          </p>
        </div>
        <BookingModal court={selectId} />
      </Modal>
    </div>
  );
}
