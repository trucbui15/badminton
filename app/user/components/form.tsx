"use client"; // Next.js App Router

import { useState, useEffect } from "react";
import { Input, Select, DatePicker, message } from "antd";
import dayjs from "dayjs";

export default function BookingModal({ court }: { court: number }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    date: null as dayjs.Dayjs | null,
    startTime: "",
    duration: "1h", // Mặc định 1 tiếng
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
  const handleEmailBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (value && !value.includes("@")) {
      value = value + "@gmai.com";
      handleChange("email", value);
    }
  };

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
    const err = validateBooking();
    if (err) {
      message.error(err);
      return;
    }
    message.success("Đặt sân thành công!");
    console.log("Dữ liệu đặt sân:", {
      ...formData,
      endTime: calculateEndTime(),
    });
  };

  return (
    <div className="p-4 space-y-4">
      <p className="font-bold text-orange-500">Sân số {court}</p>

      <Input
        placeholder="Họ và tên"
        size="large"
        className="border border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-300"
        value={formData.name}
        onChange={handleChangeName}
      />

      <Input
        placeholder="Số điện thoại"
        size="large"
        className="border border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-300"
        value={formData.phone}
        onChange={handleChangePhone}
      />

      <Input
        placeholder="Email"
        size="large"
        className="border border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-300"
        value={formData.email}
        onChange={handleChangeEmail}
        onBlur={handleEmailBlur}
      />

      {/* Chọn ngày */}
      <DatePicker
        className="w-full border border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-300"
        value={formData.date}
        onChange={(date) => handleChange("date", date)}
        format="DD/MM/YYYY"
        placeholder="Chọn ngày"
        disabledDate={(current) => current && current.isBefore(dayjs(), "day")}
      />

      <div className="flex gap-4">
        <div className="w-1/2">
          <label className="block text-gray-700 font-semibold mb-1">
            Thời Gian Bắt Đầu
          </label>
          <Select
            className="w-full border border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-300"
            placeholder="Chọn giờ bắt đầu"
            options={generateTimeSlots()}
            value={formData.startTime}
            onChange={(value) => handleChange("startTime", value)}
          />
        </div>

        <div className="w-1/2">
          <label className="block text-gray-700 font-semibold mb-1">
            Thời Gian Kết Thúc
          </label>
          <Select
            className="w-full border border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-300"
            placeholder="Chọn thời gian chơi"
            options={durationOptions}
            value={formData.duration}
            onChange={(value) => handleChange("duration", value)}
          />
          {formData.startTime && (
            <p className="mt-2 text-gray-700">
              Giờ kết thúc: {calculateEndTime()}
            </p>
          )}
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
      </div>

      <div className="flex items-center justify-center mt-4">
        <button
          onClick={handleSubmit}
          className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 ${
            error ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={!!error}
        >
          Đặt sân
        </button>
      </div>
    </div>
  );
}
