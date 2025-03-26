"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

export default function BadmintonSchedule() {
    const [today, setToday] = useState(new Date()); // Ngày hiện tại

    useEffect(() => {
      setToday(new Date()); // Cập nhật ngày hiện tại khi component mount
      
    }, []);
  
    if (!today) return <p className="text-center text-gray-500">Đang tải...</p>;
  
    // Mảng các thứ trong tuần (bắt đầu từ Thứ Hai)
    const weekdays = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  
    // Lấy thứ của ngày hiện tại (0: Chủ Nhật, 1: Thứ Hai, ..., 6: Thứ Bảy)
    const todayIndex = today.getDay();
  
    // Danh sách 7 ngày tiếp theo, bắt đầu từ **ngày hiện tại**
    const next7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      return {
        day: weekdays[(todayIndex + i) % 7], // Lấy thứ chính xác
        date: date.toLocaleDateString("vi-VN"), // Format ngày (dd/mm/yyyy)
      };
    });
  

  return (
    <div className="bg-gray-100 text-orange-400 min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center border-2 border-orange-500 p-4 mb-6">
          <h1 className="text-2xl font-bold text-orange-400">THẾ GIỚI CẦU LÔNG</h1>
          <p className="text-sm">0393118322</p>
          <p className="text-xs">Trung tâm giải trí Cầu Lông An Nhơn. Số 8 Trần Phú, Phường Bình Định, Tx. An Nhơn</p>
        </div>

      {/* Thanh chọn ngày (Bắt đầu từ hôm nay) */}
      <div className="flex justify-around border-b border-gray-600 pb-2 mb-4">
          {next7Days.map((item, index) => (
            <div key={index} className={`cursor-pointer ${index === 0 ? "text-orange-400 border-b-2 border-orange-400" : "text-gray-400"}`}>
              <p className="text-sm">{item.day}</p>
              <p className="text-sm">{item.date}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <Image src="/images/san1.jpg" alt="Sân Cầu Lông" width={200} height={300} className="rounded-lg" />
          <div>
            <h2 className="text-xl font-bold">Sân 1</h2>
            <div className="flex gap-2 my-2">
              <span className="bg-red-600 px-2 py-1 text-xs rounded">Đánh đôi</span>
              <span className="bg-orange-600 px-2 py-1 text-xs rounded">Đánh đơn</span>
            </div>
            <p className="text-sm"><span className="text-orange-400">Loại Sân:</span> Thảm Silicon</p>
            <p className="text-sm"><span className="text-orange-400">Giá Sân:</span> 100.000 VND</p>
            <p className="text-xs text-gray-400 mt-2">Cầu lông là thứ tồn tại duy nhất những thứ còn lại có hay không không quan trọng...</p>
            <div className="grid grid-cols-4 gap-2 mt-4">
              {["18:10", "19:00", "19:40", "20:30", "21:15", "21:55", "22:50"].map((time, index) => (
                <button key={index} className="border border-orange-500 text-orange-400 px-3 py-1 rounded hover:bg-orange-500 hover:text-white transition">
                  {time}
                </button>
              ))}
            </div>
            <div className="mt-4 bg-gray-800 p-2 rounded">
              <p className="text-yellow-400 font-bold">Giờ Vàng</p>
              <div className="flex gap-2 mt-2">
                <button className="border border-orange-500 text-orange-400 px-3 py-1 rounded hover:bg-orange-500 hover:text-white transition">17:00</button>
                <button className="border border-orange-500 text-orange-400 px-3 py-1 rounded hover:bg-orange-500 hover:text-white transition">20:00</button>
              </div>
            </div>
          </div>
        </div>
      </div>

     
    </div>
  );
}
