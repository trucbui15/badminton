"use client"; // Next.js App Router

import { useState, useEffect } from "react";
import { Input, Select, DatePicker, TimePicker, message } from "antd";
import dayjs from "dayjs";
import { courtsData } from "@/app/data/data";
import { Modal,Image } from "antd";
// import  from "next/image";

// import { db, collection, getDocs, addDoc, serverTimestamp } from "@/app/source/firebaseConfig";

export default function BookingModal({ court }: { court: number }) {
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [email, setEmail] = useState<string>(''); // Explicitly set the type as string
  const [isValid, setIsValid] = useState<boolean>(true); // Explicitly set the type as boolean

  // Handle email change with correct typing
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
  };

  // Email validation function
  const validateEmail = (email: string) => { // Explicitly define the type for email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    setIsValid(emailRegex.test(email));
  };
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    date: null as dayjs.Dayjs | null,
    startTime: "",
    duration: "", 
  });
  const [error, setError] = useState("");

  // Hàm cập nhật formData
  const handleChange = (field: string, value: string | dayjs.Dayjs | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Xử lý khi nhập họ tên: chỉ cho phép chữ và khoảng trắng
  const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/[^a-zA-ZÀ-ỹ\s]/g, "");
    handleChange("name", inputValue);
  };

  // Xử lý khi nhập số điện thoại: chỉ cho phép số
  const handleChangePhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/\D/g, "");
    handleChange("phone", inputValue);
  };

  // Xử lý khi nhập email: cập nhật email trong onChange
  const handleChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange("email", e.target.value);
  };

  // Khi ô email mất focus, thêm hậu tố nếu cần
  // const handleEmailBlur = (e: React.FocusEvent<HTMLInputElement>) => {
  //   let value = e.target.value;
  //   if (value && !value.includes("@")) {
  //     value = value + "@gmail.com";
  //     handleChange("email", value);
  //   }
  // };

  // Tạo danh sách giờ từ 05:00 đến 21:00 (mỗi 30 phút)
  const generateTimeSlots = () => {
    const slots = [];
    let start = dayjs().hour(5).minute(0); // 05:00
    const end = dayjs().hour(21).minute(0); // 21:00

    // Bao gồm cả mốc 21:00
    while (start.isBefore(end) || start.isSame(end)) {
      slots.push({ label: start.format("HH:mm"), value: start.format("HH:mm") });
      start = start.add(30, "minute");
    }
    return slots;
  };

  // Danh sách khoảng thời gian
  const durationOptions = [
    { label: "30 phút", value: "30m" },
    { label: "1 tiếng", value: "1h" },
    { label: "2 tiếng", value: "2h" },
    { label: "3 tiếng", value: "3h" },
  ];

  // Tính giờ kết thúc dựa trên giờ bắt đầu và thời gian chọn
  const calculateEndTime = () => {
    if (!formData.startTime) return "";
    const baseTime = dayjs(formData.startTime, "HH:mm");
    let addMinutes = 60; // Mặc định 1h
    switch (formData.duration) {
      case "30m":
        addMinutes = 30;
        break;
      case "1h":
        addMinutes = 60;
        break;
      case "2h":
        addMinutes = 120;
        break;
      case "3h":
        addMinutes = 180;
        break;
      default:
        addMinutes = 60;
    }
    return baseTime.add(addMinutes, "minute").format("HH:mm");
  };

  // Hàm kiểm tra các điều kiện của form
  const validateBooking = () => {
    const { name, phone, email, date, startTime, duration } = formData;
    if (!name || !phone || !email || !date || !startTime || !duration) {
      return "Vui lòng nhập đầy đủ thông tin!";
    }
    // Kiểm tra số điện thoại phải đủ 10 chữ số
    if (phone.length !== 10) {
      return "Số điện thoại phải có 10 chữ số!";
    }
    // Tính giờ kết thúc và kiểm tra không vượt quá 22:00
    const baseTime = dayjs(startTime, "HH:mm");
    let addMinutes = 60;
    switch (duration) {
      case "30m":
        addMinutes = 30;
        break;
      case "1h":
        addMinutes = 60;
        break;
      case "2h":
        addMinutes = 120;
        break;
      case "3h":
        addMinutes = 180;
        break;
      default:
        addMinutes = 60;
    }
    const endTime = baseTime.add(addMinutes, "minute");
    const limitTime = dayjs("22:00", "HH:mm");
    if (endTime.isAfter(limitTime)) {
      return "Thời gian kết thúc không được sau 22:00";
    }
    return "";
  };

  useEffect(() => {
    const err = validateBooking();
    setError(err);
  }, [
    formData.startTime,
    formData.duration,
    formData.name,
    formData.phone,
    formData.email,
    formData.date,
  ]);

  // Xử lý khi đặt sân
  const handleSubmit = () => {
   alert("đăng nhập thành công")
  };

  const pricePerHour = 100000; 

  const calculatePrice = () => {
    const durationInHours = parseInt(formData.duration, 10);
    return durationInHours * pricePerHour;
  };

  return (
      <div className="md:p-4 flex gap-8">
        {/* Form Đặt Sân (Bên trái) */}
        <div className="w-1/2 space-y-4">
          <p className="font-bold text-orange-500">{courtsData[court].name}</p>
  
          <div className="space-y-4">
            {/* Họ và tên */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Họ và Tên</label>
              <Input
                placeholder="Họ và tên"
                size="large"
                className="border border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-300"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>
  
            {/* Số điện thoại */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Số Điện Thoại</label>
              <Input
                placeholder="Số điện thoại"
                size="large"
                className="border border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-300"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                pattern="^\d{10}$"
                maxLength={10}
                title="Số điện thoại phải có đúng 10 chữ số!"
                required
              />
            </div>
  
            {/* Email */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Email</label>
              <Input
                placeholder="Email"
                value={email}
                onChange={handleEmailChange}
                className="ant-input ant-input-lg"
              />
            </div>
  
            {/* Chọn ngày */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Chọn Ngày</label>
              <DatePicker
                className="w-full border border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-300"
                value={formData.date}
                onChange={(date) => handleChange('date', date)}
                format="DD/MM/YYYY"
                placeholder="Chọn ngày"
                disabledDate={(current) => current && current.isBefore(dayjs(), 'day')}
              />
            </div>
  
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-gray-700 font-semibold mb-1">Thời Gian Bắt Đầu</label>
                <Select
                  className="w-full border border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-300"
                  placeholder="Chọn giờ bắt đầu"
                  options={generateTimeSlots()}
                  value={formData.startTime}
                  onChange={(value) => handleChange('startTime', value)}
                />
              </div>
  
              <div className="w-1/2">
                <label className="block text-gray-700 font-semibold mb-1">Thời Gian Kết Thúc</label>
                <Select
                  className="w-full border border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-300"
                  placeholder="Chọn thời gian chơi"
                  options={durationOptions}
                  value={formData.duration}
                  onChange={(value) => handleChange('duration', value)}
                />
                {formData.startTime && (
                  <p className="mt-2 text-gray-700">Giờ kết thúc: {calculateEndTime()}</p>
                )}
              </div>
            </div>
  
            <div className="flex items-center justify-center mt-4">
              <button
                onClick={handleSubmit}
                className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 ${error ? 'opacity-50 cursor-not-allowed' : ''}`}
                // disabled={!!error}
              >
                Đặt sân
              </button>
            </div>
          </div>
        </div>
  
        {/* Dữ liệu sân (Bên phải) */}
        <div className="w-1/2 space-y-4">
        <p className="font-bold text-orange-500">Thông Tin Sân</p>
        <div className="border md:p-4 p-[4px] rounded-lg flex items-center justify-center">
          <div className="flex flex-col w-1/2 text-[8px]">

          <p><strong>Sân:</strong> {courtsData[court].name}</p>
          <p><strong>Giờ bắt đầu:</strong> {formData.startTime}</p>
          <p><strong>Giờ kết thúc:</strong> {calculateEndTime()}</p>
          <p><strong>Tổng tiền:</strong> {calculatePrice()} VND</p>
          </div>
          <div className="w-1/2">
          <Image
            src={courtsData[court].image}   
            alt="Sân cầu lông"
      
            className="md:w-[200px] md:h-[150px] w-[50px] h-[50px]"
          />
          </div>
        </div>
      </div>
    </div>
  );
  };
