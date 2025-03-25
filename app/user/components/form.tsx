"use client";

import { Input, Select, DatePicker, message } from "antd";
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { addDoc, collection } from "firebase/firestore"; // ✅ Import Firestore
import { db } from "@/app/source/firebaseConfig"; // ✅ Đảm bảo bạn đã import cấu hình Firestore
function FormBooking({  
  valueName,
  handleChangeName,
  valuePhoneNumber,
  handleChangePhoneNumber,
  valueEmail,
  handleChangeEmail,
}: any) {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [error, setError] = useState("");
  const [duration, setDuration] = useState("");
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(dayjs());
  const [isDisabled, setIsDisabled] = useState(false);

  const router = useRouter(); // ✅ Sử dụng router để chuyển hướng

  // Danh sách giờ bắt đầu từ 05:00 đến 21:00 (cách nhau 30 phút)
  const now = dayjs();
  const currentHour = now.hour();
  const currentMinute = now.minute();

  const startTimes = Array.from({ length: 33 }, (_, i) => {
    const hours = Math.floor(i / 2) + 5;
    const minutes = i % 2 === 0 ? "00" : "30";
    const timeString = `${String(hours).padStart(2, "0")}:${minutes}`;

    if (
      hours > currentHour ||
      (hours === currentHour &&
        Number(minutes) >= (currentMinute < 30 ? 30 : 60))
    ) {
      return timeString;
    }
    return null;
  }).filter(Boolean);

  // Làm tròn thời gian hiện tại lên khung giờ gần nhất theo 30 phút
  useEffect(() => {
    const now = dayjs();
    const nextSlotMinutes = now.minute() < 30 ? 30 : 60;
    const roundedTime = now.minute(nextSlotMinutes).second(0);
    const formattedTime = roundedTime.format("HH:mm");

    setStartTime(formattedTime);
  }, []);

  const handleStartTimeChange = (value: string) => {
    setStartTime(value);
    setDuration("");
    setEndTime("");
    setError("");
  };

  const handleDateChange = (date: dayjs.Dayjs | null) => {
    setSelectedDate(date);
  
    if (date && date.isAfter(dayjs(), "day")) {
      // Nếu chọn ngày lớn hơn hiện tại, đặt startTime về 05:00
      setStartTime("05:00");
    } else {
      // Nếu chọn ngày hiện tại, làm tròn lên khung giờ gần nhất
      const now = dayjs();
      const nextSlotMinutes = now.minute() < 30 ? 30 : 60;
      const roundedTime = now.minute(nextSlotMinutes).second(0);
      const formattedTime = roundedTime.format("HH:mm");
  
      setStartTime(formattedTime);
    }
  
    setDuration(""); // Reset thời gian kết thúc
    setEndTime("");
    setError("");
  };
  

  const handleDurationChange = (value: string) => {
    setDuration(value);

    if (startTime) {
      const [hours, minutes] = startTime.split(":").map(Number);
      let newHours = hours;
      let newMinutes = minutes;

      switch (value) {
        case "30m":
          newMinutes += 30;
          break;
        case "1h":
          newHours += 1;
          break;
        case "2h":
          newHours += 2;
          break;
        case "3h":
          newHours += 3;
          break;
      }

      if (newMinutes >= 60) {
        newHours += Math.floor(newMinutes / 60);
        newMinutes %= 60;
      }

      if (newHours > 22 || (newHours === 22 && newMinutes > 0)) {
        setError("Thời gian kết thúc không được sau 22:00");
        setEndTime("");
        setIsDisabled(true);
      } else {
        setError("");
        setEndTime(
          `${String(newHours).padStart(2, "0")}:${String(newMinutes).padStart(
            2,
            "0"
          )}`
        );
        setIsDisabled(false);
      }
    }
  };

  // ✅ Hàm kiểm tra dữ liệu trước khi đặt sân
  const handleBooking = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); // Ngăn form submit mặc định
  
    if (!valueName || !valuePhoneNumber || !valueEmail || !selectedDate || !startTime || !duration) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
  
    const bookingData = {
      name: valueName,
      phoneNumber: valuePhoneNumber,
      email: valueEmail,
      date: selectedDate.format("DD/MM/YYYY"),
      startTime: startTime,
      duration: duration,
      endTime: endTime,
      createdAt: new Date(),
    };
  
    try {
      await addDoc(collection(db, "users"), bookingData);
      alert("Đặt sân thành công!");
      router.push("/homeuser"); // Chuyển trang sau khi đặt thành công
    } catch (error) {
      console.error("Lỗi khi lưu dữ liệu:", error);
      alert("Đặt sân thất bại, vui lòng thử lại!");
    }
  };
  

  return (
    <form className="bg-white/80 backdrop-blur-md shadow-lg rounded-xl p-6 sm:p-8 space-y-4 border border-gray-200">
      
      <div>
        <label className="block text-gray-700 font-semibold mb-1">Họ Tên</label>
        <Input
          placeholder="Nhập họ và tên"
          size="large"
          className="border border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-300"
          onChange={handleChangeName}
          value={valueName}
        />
      </div>

      <div>
        <label className="block text-gray-700 font-semibold mb-1">
          Số Điện Thoại
        </label>
        <Input
          placeholder="Nhập số điện thoại"
          size="large"
          className="border border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-300"
          onChange={handleChangePhoneNumber}
          value={valuePhoneNumber}
        />
      </div>

      <div>
        <label className="block text-gray-700 font-semibold mb-1">Email</label>
        <Input
          placeholder="Nhập email"
          size="large"
          className="border border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-300"
          onChange={handleChangeEmail} // ✅ Dùng prop để cập nhật state từ Home.tsx
          value={valueEmail} // ✅ Đảm bảo hiển thị đúng giá trị từ Home.tsx
        />
      </div>

      <div>
        <label className="block text-gray-700 font-semibold mb-1">
          Ngày Đặt
        </label>
        <DatePicker
          className="w-full border border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-300"
          value={selectedDate}
          onChange={handleDateChange}
          format="DD/MM/YYYY"
          placeholder="Chọn ngày"
          disabledDate={(current) =>
            current && current.isBefore(dayjs(), "day")
          }
        />
      </div>

      <div className="flex gap-4">
        <div className="w-1/2">
          <label className="block text-gray-700 font-semibold mb-1">
            Thời Gian Bắt Đầu
          </label>
          <Select
            className="w-full border border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-300"
            placeholder="Chọn thời gian"
            onChange={handleStartTimeChange}
            value={startTime}
            options={startTimes.map((time) => ({ label: time, value: time }))}
          />
        </div>

        <div className="w-1/2">
          <label className="block text-gray-700 font-semibold mb-1">
            Thời Gian Kết Thúc
          </label>
          <Select
            className="w-full border border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-300"
            placeholder="Chọn khung giờ"
            onChange={handleDurationChange}
            value={duration}
            options={[
              { label: "30 phút", value: "30m" },
              { label: "1 giờ", value: "1h" },
              { label: "2 giờ", value: "2h" },
              { label: "3 giờ", value: "3h" },
            ]}
          />
          {endTime && <p className="mt-2 text-gray-700">Kết thúc: {endTime}</p>}
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
      </div>

      <div className="flex items-center justify-center mt-4">
        <button
          className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 ${
            isDisabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isDisabled}
          onClick={handleBooking} // ✅ Gọi hàm kiểm tra và chuyển trang
        >
          Đặt Sân
        </button>
      </div>
    </form> 
  );
}

export default FormBooking;
