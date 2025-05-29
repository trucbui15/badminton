"use client";
import {
  collection,
  serverTimestamp,
  query,
  where,
  getDocs,
  runTransaction,
  doc,
} from "firebase/firestore";
import { db } from "@/app/source/firebaseConfig";
import { useState, useEffect } from "react";
import {
  Input,
  Select,
  DatePicker,
  Typography,
  Space,
  Modal,
  Image,
  Divider,
  Button,
  Tag,
} from "antd";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
dayjs.extend(isSameOrBefore);
import { CheckCircleTwoTone, ArrowLeftOutlined } from "@ant-design/icons";
import { isTimeConflict } from "@/app/source/timeprocessing";
import { useRealtimeBookings } from "@/app/hooks/useRealtimeBookings";
import { FormDataType } from "@/app/data/types";
import { FirebaseError } from "firebase/app";

export default function BookingModal({ court }: { court: number }) {
  const [bookingInfo, setBookingInfo] = useState<FormDataType | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [selectedCourtId, setSelectedCourtId] = useState<number | null>(null);
const [isMonthly, setIsMonthly] = useState(false);
const [monthlyStartDate, setMonthlyStartDate] = useState<dayjs.Dayjs | null>(dayjs());
const [monthlyEndDate, setMonthlyEndDate] = useState<dayjs.Dayjs | null>(dayjs().add(1, "month"));
const [monthlyStartTime, setMonthlyStartTime] = useState(""); // "18:00"
const [sessionsPerWeek, setSessionsPerWeek] = useState(3);
const [hoursPerSession, setHoursPerSession] = useState(2);
const [discountPercent, setDiscountPercent] = useState(20);

const getWeeksBetween = (start: dayjs.Dayjs, end: dayjs.Dayjs) => {
  return Math.ceil(end.diff(start, "day") / 7);
};
  const [courtData, setCourtData] = useState<{
    id: number;
    name: string;
    type: string;
    price: number;
    image: string;
  } | null>(null);

  const [selectedDate, setSelectedDate] = useState<string>(
    dayjs().format("YYYY-MM-DD")
  );
  const [loading, setLoading] = useState(true);
  const { Title, Text } = Typography;

  // Sử dụng hook realtime để lắng nghe thay đổi đặt sân
  const { bookings: realtimeBookings, loading: realtimeLoading } =
    useRealtimeBookings(
      selectedCourtId !== null && selectedCourtId !== undefined
        ? selectedCourtId
        : undefined,
      selectedDate
    );

  const [formData, setFormData] = useState({
    courtId: 0,
    courtName: "",
    fullName: "",
    phone: "",
    email: "",
    date: null as dayjs.Dayjs | null,
    startTime: "",
    duration: "",
    endTime: "",
    totalPrice: 0,
  });

  const [error, setError] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchCourtData = async () => {
      try {
        setLoading(true);

        // Truy vấn dữ liệu sân từ Firestore theo id
        const courtsRef = collection(db, "courts");
        const q = query(courtsRef, where("id", "==", Number(court)));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // Lấy dữ liệu từ document đầu tiên trùng khớp
          const doc = querySnapshot.docs[0];
          const data = doc.data() as {
            id: number;
            name: string;
            type: string;
            price: number;
            image: string;
          };

          setCourtData(data);
          setSelectedCourtId(data.id);

          // Cập nhật formData với thông tin sân
          setFormData((prev) => ({
            ...prev,
            courtId: data.id,
            courtName: data.name,
          }));
        } else {
          console.error("Không tìm thấy thông tin sân");
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu sân:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourtData();
  }, [court]);

  // Hàm cập nhật formData
  const handleChange = (field: string, value: string | dayjs.Dayjs | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Cập nhật ngày đã chọn để lắng nghe bookings cho ngày đó
    if (field === "date" && value) {
      setSelectedDate((value as dayjs.Dayjs).format("YYYY-MM-DD"));
    }
  };

  const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isComposing) return; // Đợi gõ xong mới xử lý
    handleChange("fullName", e.target.value);
  };

  // Xử lý khi nhập số điện thoại: chỉ cho phép số
  const handleChangePhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/\D/g, "");
    if (inputValue.length <= 10) {
      handleChange("phone", inputValue);
    }
  };

  // Xử lý khi nhập email: cập nhật email trong onChange
  const handleChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.trim(); // Loại bỏ khoảng trắng đầu/cuối
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailPattern.test(inputValue)) {
      setError((prevError) => ({ ...prevError, email: "Email không hợp lệ!" }));
    } else {
      setError((prevError) => {
        if (!prevError.email) return prevError;
        const newError = { ...prevError };
        delete newError.email;
        return newError;
      });
    }

    handleChange("email", inputValue); // Cập nhật email trong formData
  };

  // Tạo danh sách giờ từ 05:00 đến 21:00 (mỗi 30 phút)
  const generateTimeSlots = () => {
    const slots = [];
    let start = dayjs().hour(5).minute(0); // 05:00
    const end = dayjs().hour(21).minute(0); // 21:00

    // Bao gồm cả mốc 21:00
    while (start.isBefore(end) || start.isSame(end)) {
      const timeStr = start.format("HH:mm");

      // Kiểm tra xem khung giờ này đã bị đặt chưa
      const isBooked = checkTimeSlotBooked(timeStr);

      slots.push({
        label: start.format("HH:mm") + (isBooked ? " (Đã đặt)" : ""),
        value: start.format("HH:mm"),
        disabled: isBooked,
      });

      start = start.add(30, "minute");
    }
    return slots;
  };

  // Kiểm tra xem khung giờ đã bị đặt chưa (dựa vào dữ liệu realtime)
  const checkTimeSlotBooked = (startTime: string): boolean => {
    if (!formData.date) return false;

    const calculatedEndTime = calculateEndTimeFromStart(
      startTime,
      formData.duration || "1h"
    );

    return isTimeConflict(
      startTime,
      calculatedEndTime,
      realtimeBookings.map((b) => ({
        startTime: b.startTime,
        endTime: b.endTime,
      }))
    );
  };

  // Tính thời gian kết thúc dựa vào thời gian bắt đầu và khoảng thời gian
  const calculateEndTimeFromStart = (
    startTime: string,
    duration: string
  ): string => {
    const baseTime = dayjs(startTime, "HH:mm");
    let addMinutes = 60; // Mặc định 1h
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
    return baseTime.add(addMinutes, "minute").format("HH:mm");
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
    return calculateEndTimeFromStart(
      formData.startTime,
      formData.duration || "1h"
    );
  };

  // Kiểm tra xem giờ bắt đầu hiện tại và thời lượng đã chọn có bị xung đột với các booking hiện có không
  useEffect(() => {
    if (formData.startTime && formData.date) {
      const endTime = calculateEndTime();
      const bookings = realtimeBookings.map((b) => ({
        startTime: b.startTime,
        endTime: b.endTime,
      }));

      // Log tiếng Việt để kiểm tra dữ liệu
      console.log("▶️ Giờ bắt đầu bạn chọn:", formData.startTime);
      console.log("▶️ Thời lượng bạn chọn:", formData.duration);
      console.log("▶️ Ngày bạn chọn:", formData.date);
      console.log("▶️ Giờ kết thúc tính được:", endTime);
      console.log("▶️ Danh sách đặt sân realtime:", realtimeBookings);
      console.log("▶️ Danh sách khung giờ đã đặt để kiểm tra trùng:", bookings);

      const isConflict = isTimeConflict(formData.startTime, endTime, bookings);

      console.log("❗ Kết quả kiểm tra trùng khung giờ:", isConflict);

      if (isConflict) {
        setError((prev) => ({
          ...prev,
          startTime: "Khung giờ này đã được đặt!",
        }));
      } else {
        setError((prev) => {
          const newErrors = { ...prev };
          delete newErrors.startTime;
          return newErrors;
        });
      }
    }
  }, [formData.startTime, formData.duration, formData.date, realtimeBookings]);

  const validateBooking = () => {
  const error: { [key: string]: string } = {};

  // Kiểm tra họ tên, sđt, email luôn
  if (!formData.fullName) error.name = "Vui lòng nhập họ và tên!";
  if (!formData.phone) error.phone = "Vui lòng nhập số điện thoại!";
  if (!formData.email) error.email = "Vui lòng nhập email!";

  if (isMonthly) {
    // Kiểm tra các trường đặt tháng
    if (!monthlyStartDate) error.monthlyStartDate = "Chọn ngày bắt đầu!";
    if (!monthlyEndDate) error.monthlyEndDate = "Chọn ngày kết thúc!";
    if (!monthlyStartTime) error.monthlyStartTime = "Chọn giờ bắt đầu!";
    if (!sessionsPerWeek) error.sessionsPerWeek = "Nhập số buổi/tuần!";
    if (!hoursPerSession) error.hoursPerSession = "Nhập số giờ/buổi!";
  } else {
    // Kiểm tra các trường đặt lẻ
    if (!formData.date) error.date = "Vui lòng chọn ngày!";
    if (!formData.startTime) error.startTime = "Vui lòng chọn giờ bắt đầu!";
    if (!formData.duration) error.duration = "Vui lòng chọn thời gian chơi!";
  }

  return error;
};

  const handleSubmit = async () => {
  const error = validateBooking();
  setError(error);

  if (Object.keys(error).length === 0 && courtData) {
    try {
      const bookingRef = collection(db, "bookings");

      if (isMonthly) {
        // Đặt theo tháng: tạo nhiều booking
        const weeks = getWeeksBetween(monthlyStartDate!, monthlyEndDate!);
        const totalSessions = sessionsPerWeek * weeks;
        let current = monthlyStartDate!.clone();
        let sessions = 0;
        const bookingsToAdd = [];

        // Lặp qua từng ngày, lấy đủ số buổi
        while (current.isSameOrBefore(monthlyEndDate!) && sessions < totalSessions) {
          // Ví dụ: mặc định lấy các ngày liên tiếp, bạn có thể nâng cấp logic chọn thứ trong tuần
          bookingsToAdd.push({
            fullName: formData.fullName,
            phone: formData.phone,
            email: formData.email,
            date: current.format("YYYY-MM-DD"),
            startTime: monthlyStartTime,
            endTime: dayjs(monthlyStartTime, "HH:mm").add(hoursPerSession, "hour").format("HH:mm"),
            duration: `${hoursPerSession}h`,
            courtId: courtData.id,
            courtName: courtData.name,
            price: courtData.price,
            totalPrice: Math.round(courtData.price * hoursPerSession * (1 - discountPercent / 100)),
            isPaid: false,
            timestamp: serverTimestamp(),
          });
          sessions++;
          current = current.add(1, "day");
        }

        // Lưu từng booking vào Firestore
        for (const bookingData of bookingsToAdd) {
          const newBookingRef = doc(bookingRef);
          await runTransaction(db, async (transaction) => {
            transaction.set(newBookingRef, bookingData);
          });
        }

       setBookingInfo({
  courtId: courtData.id,
  courtName: courtData.name,
  fullName: formData.fullName,
  phone: formData.phone,
  email: formData.email,
  date: monthlyStartDate ? monthlyStartDate : dayjs(),
  startTime: monthlyStartTime && monthlyStartTime !== "" ? monthlyStartTime : "00:00",
  endTime: dayjs(
    monthlyStartTime && monthlyStartTime !== "" ? monthlyStartTime : "00:00",
    "HH:mm"
  )
    .add(hoursPerSession && hoursPerSession > 0 ? hoursPerSession : 1, "hour")
    .format("HH:mm"),
  duration: `${hoursPerSession && hoursPerSession > 0 ? hoursPerSession : 1}h`,
  totalPrice: calculateMonthlyPrice(),
  isPaid: false, // hoặc true nếu bạn muốn
});

alert("🎉 Đặt sân theo tháng thành công!");
setIsSuccessModalOpen(true);

// Reset form nếu muốn
setFormData((prev) => ({
  ...prev,
  fullName: "",
  phone: "",
  email: "",
  startTime: "",
  duration: "",
}));
        
      } else {
        // Đặt lẻ như cũ
        const formattedDate = formData.date
          ? formData.date.format("YYYY-MM-DD")
          : "";
        const formattedStartTime = dayjs(formData.startTime, "HH:mm").format(
          "HH:mm"
        );

        const durationMap: { [key: string]: number } = {
          "30m": 0.5,
          "1h": 1,
          "2h": 2,
          "3h": 3,
        };

        const durationInHours = durationMap[formData.duration] || 1;
        const calculatedEndTime = dayjs(formattedStartTime, "HH:mm")
          .add(durationInHours * 60, "minute")
          .format("HH:mm");

        const getDuration = (start: string, end: string): string => {
          const [sh, sm] = start.split(":").map(Number);
          const [eh, em] = end.split(":").map(Number);
          const diff = eh * 60 + em - (sh * 60 + sm);
          const hours = Math.floor(diff / 60);
          const minutes = diff % 60;
          return `${hours}h${minutes > 0 ? ` ${minutes} phút` : ""}`;
        };

        const duration = getDuration(formattedStartTime, calculatedEndTime);

        // Transaction
        await runTransaction(db, async (transaction) => {
          const q = query(
            bookingRef,
            where("courtId", "==", courtData.id),
            where("date", "==", formattedDate)
          );
          const querySnapshot = await getDocs(q);
          const existingBookings = querySnapshot.docs.map((doc) => doc.data());

          const hasConflict = isTimeConflict(
            formattedStartTime,
            calculatedEndTime,
            existingBookings.map((b) => ({
              startTime: b.startTime,
              endTime: b.endTime,
            }))
          );

          if (hasConflict) {
            throw new Error("⚠️ Khung giờ đã được đặt hoặc giao nhau.");
          }

          const newBookingRef = doc(bookingRef); // tạo doc ID mới
          const bookingData = {
            fullName: formData.fullName,
            phone: formData.phone,
            email: formData.email,
            date: formattedDate,
            startTime: formattedStartTime,
            endTime: calculatedEndTime,
            duration,
            courtId: courtData.id,
            courtName: courtData.name,
            price: courtData.price,
            totalPrice: calculatePrice(),
            isPaid: false,
            timestamp: serverTimestamp(),
          };
          transaction.set(newBookingRef, bookingData);

          // Lưu thông tin cho UI sau khi transaction thành công
          
          setBookingInfo({
            ...bookingData,
            date: dayjs(formattedDate, "YYYY-MM-DD"),
          });
        });

        // Gửi email sau khi transaction xong
        await fetch(
          "https://script.google.com/macros/s/AKfycbwJVBLvRETzdCHJTD8Jo6vmNmruLGn1Y9MdoiZocRvAe6MH_ECmeYG8XZOJPGzRYpF-4Q/exec",
          {
            method: "POST",
            mode: "no-cors",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: formData.email,
              formData: {
                courtName: courtData.name,
                date: formattedDate,
                startTime: formattedStartTime,
                endTime: calculatedEndTime,
                totalPrice: calculatePrice(),
              },
            }),
          }
        );

        alert("🎉 Đặt sân thành công và email xác nhận đã được gửi!");
        setIsSuccessModalOpen(true);

        // Reset form
        setFormData((prev) => ({
          ...prev,
          fullName: "",
          phone: "",
          email: "",
          startTime: "",
          duration: "",
        }));
      }
    } catch (err: unknown) {
      if (err instanceof FirebaseError || err instanceof Error) {
        alert(err.message);
      } else {
        console.error("Lỗi không xác định:", err);
        alert("Đã xảy ra lỗi. Vui lòng thử lại.");
      }
    }
  } else {
    alert("Vui lòng điền đầy đủ thông tin.");
  }
};

  const generateMonthlyTimeSlots = () => {
  const slots = [];
  let start = dayjs().hour(5).minute(0);
  const end = dayjs().hour(21).minute(0);
  while (start.isBefore(end) || start.isSame(end)) {
    slots.push({
      label: start.format("HH:mm"),
      value: start.format("HH:mm"),
    });
    start = start.add(30, "minute");
  }
  return slots;
};
  const calculatePrice = () => {
    if (!formData.date || !courtData) return 0;

    // Lấy thứ trong tuần (0: Chủ nhật, 1: Thứ 2, ..., 6: Thứ 7)
    const dayOfWeek = formData.date.day();

    // Hệ số giá: ngày thường x1, cuối tuần x1.25
    const priceMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 1.25 : 1;

    // Giá/giờ theo từng sân
    const pricePerHour = courtData.price * priceMultiplier;

    const durationPrices = {
      "30m": 0.5,
      "1h": 1,
      "2h": 2,
      "3h": 3,
    } as const;

    const hours =
      durationPrices[formData.duration as keyof typeof durationPrices] || 0;

    return Math.round(hours * pricePerHour);
  };

    const calculateMonthlyPrice = () => {
  if (!courtData || !monthlyStartDate || !monthlyEndDate) return 0;
  const weeks = getWeeksBetween(monthlyStartDate, monthlyEndDate);
  const totalSessions = sessionsPerWeek * weeks;
  const total = courtData.price * hoursPerSession * totalSessions;
  const discounted = total * (1 - discountPercent / 100);
  return Math.round(discounted);
};

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        Đang tải thông tin sân...
      </div>
    );
  }

  if (!courtData) {
    return <div className="text-red-500 p-4">Không tìm thấy thông tin sân</div>;
  }

  return (
    <div className="md:p-4 flex gap-8">
      {/* Form Đặt Sân (Bên trái) */}
      <div className="w-1/2 space-y-4">
        <p className="font-bold text-blue-600">{courtData.name}</p>

       <div className="space-y-4">
  {/* Họ và tên */}
  <div>
    <label className="block text-gray-700 font-medium mb-1">
      Họ và Tên
    </label>
    <Input
      placeholder="Họ và tên"
      size="large"
      type="text"
      value={formData.fullName}
      onChange={handleChangeName}
      onCompositionStart={() => setIsComposing(true)}
      onCompositionEnd={() => setIsComposing(false)}
      status={error.name ? "error" : ""}
    />
    {error.name && (
      <p className="text-red-500 text-sm mt-1">{error.name}</p>
    )}
  </div>

  {/* Số điện thoại */}
  <div>
    <label className="block text-gray-700 font-medium mb-1">
      Số Điện Thoại
    </label>
    <Input
      placeholder="Số điện thoại"
      size="large"
      className="border border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-300"
      value={formData.phone}
      onChange={handleChangePhone}
      maxLength={10}
      title="Số điện thoại phải có đúng 10 chữ số!"
      required
      status={error.phone ? "error" : ""}
    />
    {error.phone && (
      <p className="text-red-500 text-sm mt-1">{error.phone}</p>
    )}
  </div>

  {/* Email */}
  <div>
    <label className="block text-gray-700 font-medium mb-1">
      Email
    </label>
    <Input
      placeholder="Email"
      size="large"
      className="border border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-300"
      value={formData.email}
      onChange={handleChangeEmail}
      status={error.email ? "error" : ""}
    />
    {error.email && (
      <p className="text-red-500 text-sm mt-1">{error.email}</p>
    )}
  </div>

  {/* Checkbox đặt tháng luôn hiển thị */}
  <div>
    <label>
      <input
        type="checkbox"
        checked={isMonthly}
        onChange={() => setIsMonthly(!isMonthly)}
        className="mr-2"
      />
      Đặt cố định theo tháng
    </label>
  </div>

  {/* Nếu KHÔNG đặt tháng thì hiện form đặt lẻ */}
  {!isMonthly && (
    <>
      {/* Chọn ngày */}
      <div>
        <label className="block text-gray-700 font-medium mb-1">
          Chọn Ngày
        </label>
        <DatePicker
          className="w-full border border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-300"
          value={formData.date}
          onChange={(date) => handleChange("date", date)}
          format="DD/MM/YYYY"
          placeholder="Chọn ngày"
          disabledDate={(current) =>
            current && current.isBefore(dayjs(), "day")
          }
          status={error.date ? "error" : ""}
        />
        {error.date && (
          <p className="text-red-500 text-sm mt-1">{error.date}</p>
        )}
      </div>

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
            status={error.startTime ? "error" : ""}
          />
          {error.startTime && (
            <p className="text-red-500 text-sm mt-1">{error.startTime}</p>
          )}
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
          {error.endTime && (
            <p className="text-red-500 text-sm mt-1">{error.endTime}</p>
          )}
        </div>
      </div>
    </>
  )}

  {/* Nếu đặt tháng thì hiện block đặt tháng */}
  {isMonthly && (
    <div className="border p-3 rounded-lg mb-4 bg-blue-50 mt-4">
      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label>Ngày bắt đầu:</label>
          <DatePicker
            value={monthlyStartDate}
            onChange={setMonthlyStartDate}
            format="DD/MM/YYYY"
          />
        </div>
        <div>
          <label>Ngày kết thúc:</label>
          <DatePicker
            value={monthlyEndDate}
            onChange={setMonthlyEndDate}
            format="DD/MM/YYYY"
            disabledDate={date => date && date.isBefore(monthlyStartDate)}
          />
        </div>
        <div>
  <label>
    Thời Gian Bắt Đầu
  </label>
  <Select
    className="w-full border border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-300"
    placeholder="Chọn giờ bắt đầu"
    options={generateMonthlyTimeSlots()}
    value={monthlyStartTime}
    onChange={setMonthlyStartTime}
  />
</div>
        <div>
          <label>Số giờ/buổi:</label>
          <Input
            type="number"
            min={1}
            max={4}
            value={hoursPerSession}
            onChange={e => setHoursPerSession(Number(e.target.value))}
          />
        </div>
        <div>
          <label>Số buổi/tuần:</label>
          <Input
            type="number"
            min={1}
            max={7}
            value={sessionsPerWeek}
            onChange={e => setSessionsPerWeek(Number(e.target.value))}
          />
        </div>
        <div>
          <label>Giảm giá (%):</label>
          <Input
            type="number"
            min={0}
            max={100}
            value={discountPercent}
            onChange={e => setDiscountPercent(Number(e.target.value))}
          />
        </div>
      </div>
      <div className="mt-3 text-blue-700 font-semibold">
        Tổng tiền tháng: {calculateMonthlyPrice().toLocaleString()} VND<br />
        <span className="text-green-600">
          (Đã áp dụng ưu đãi {discountPercent}% cho khách hàng thân thiết)
        </span>
        <br />
        <span className="text-gray-600 text-sm">
          {monthlyStartDate && monthlyEndDate &&
            `${sessionsPerWeek * getWeeksBetween(monthlyStartDate, monthlyEndDate)} buổi từ ${monthlyStartDate.format("DD/MM/YYYY")} đến ${monthlyEndDate.format("DD/MM/YYYY")}, mỗi buổi ${hoursPerSession} giờ, bắt đầu lúc ${monthlyStartTime || "?"}`}
        </span>
      </div>
    </div>
  )}

  {/* Nút đặt sân căn giữa */}
  <div className="flex justify-center mt-4">
    <button
      onClick={handleSubmit}
      className={`bg-[#1677ff] hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 ${
        Object.keys(error).length > 0
          ? "opacity-50 cursor-not-allowed"
          : ""
      }`}
    >
      Đặt sân
    </button>
  </div>
</div>

        <Modal
          open={isSuccessModalOpen}
          onCancel={() => setIsSuccessModalOpen(false)}
          footer={null}
          centered
          width={500}
        >
          <Space direction="vertical" align="center" style={{ width: "100%" }}>
            <CheckCircleTwoTone
              twoToneColor="#52c41a"
              style={{ fontSize: 48 }}
            />
            <Title level={3} style={{ marginBottom: 0 }}>
              Đặt sân thành công! 🎉
            </Title>
            <Text type="secondary">
              Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!
            </Text>
          </Space>

          <Divider />

          <Space
            direction="vertical"
            size="middle"
            style={{ width: "100%", padding: "0 20px" }}
          >
            <Text strong>
              🏸 <b style={{ opacity: 0.7 }}>Họ và Tên:</b>{" "}
              {bookingInfo?.fullName || "Chưa có"}
            </Text>
            <Text strong>
              📞 <b style={{ opacity: 0.7 }}>Số điện thoại:</b>{" "}
              {bookingInfo?.phone || "Chưa có"}
            </Text>
            <Text strong>
              📧 <b style={{ opacity: 0.7 }}>Email:</b>{" "}
              {bookingInfo?.email || "Chưa có"}
            </Text>
            <Text strong>
              📅 <b style={{ opacity: 0.7 }}>Ngày đặt sân:</b>{" "}
              {bookingInfo?.date
                ? dayjs.isDayjs(bookingInfo.date)
                  ? bookingInfo.date.format("DD/MM/YYYY")
                  : bookingInfo.date
                : "Chưa có"}{" "}
            </Text>
            <Text strong>
              ⏰ <b style={{ opacity: 0.7 }}>Giờ bắt đầu:</b>{" "}
              {bookingInfo?.startTime || "Chưa có"}
            </Text>
            <Text strong>
              ⏱️ <b style={{ opacity: 0.7 }}>Giờ kết thúc:</b>{" "}
              {bookingInfo?.endTime || "Chưa có"}
            </Text>
            <Text strong>
              ⏳ <b style={{ opacity: 0.7 }}>Thời lượng:</b>{" "}
              {bookingInfo?.duration || "Chưa có"}
            </Text>
            <Text strong style={{ fontSize: 20, color: "#d48806" }}>
              💰 <b style={{ opacity: 0.6 }}>Tổng tiền:</b>{" "}
              {bookingInfo?.totalPrice?.toLocaleString() || "0"} VND
            </Text>
          </Space>

          <Divider />

          <Title level={5} style={{ textAlign: "center", color: "#52c41a" }}>
            ✨ Chúc bạn có một buổi chơi vui vẻ! ✨
          </Title>
          <div
            style={{ display: "flex", justifyContent: "center", marginTop: 16 }}
          >
            <Button
              type="primary"
              icon={<ArrowLeftOutlined />}
              onClick={() => window.location.reload()}
            >
              Quay về trang chủ
            </Button>
          </div>
        </Modal>
      </div>

      {/* Dữ liệu sân (Bên phải) */}
      <div className="w-1/2 space-y-4">
        <p className="font-bold text-blue-600">Thông Tin Sân</p>
        <div className="border md:p-4 p-[4px] rounded-lg flex items-center justify-center">
          <div className="flex flex-col w-1/2 text-[8px] md:text-[14px] md:gap-[10px]">
            <p>
              <strong>Sân:</strong> {courtData.name}
            </p>
            <p>
              <strong>Loại sân:</strong> {courtData.type}
            </p>
            <p>
              <strong>Giờ bắt đầu:</strong> {formData.startTime}
            </p>
            <p>
              <strong>Giờ kết thúc:</strong> {calculateEndTime()}
            </p>
            <p>
              <strong>Tổng tiền:</strong> {calculatePrice().toLocaleString()}{" "}
              VND
            </p>
            {formData.date && courtData && (
              <p className="text-blue-700 font-semibold">
                Giá giờ:{" "}
                {(() => {
                  const dayOfWeek = formData.date.day();
                  const priceMultiplier =
                    dayOfWeek === 0 || dayOfWeek === 6 ? 1.25 : 1;
                  const pricePerHour = courtData.price * priceMultiplier;
                  return `${pricePerHour.toLocaleString()}đ/giờ (${
                    dayOfWeek === 0 || dayOfWeek === 6
                      ? "Thứ 7 - Chủ nhật"
                      : "Thứ 2 - Thứ 6"
                  })`;
                })()}
              </p>
            )}
          </div>
          <div className="w-1/2">
            <Image
              src={courtData.image}
              alt="Sân cầu lông"
              className="md:w-[200px] md:h-[150px] w-[50px] h-[50px]"
            />
          </div>
        </div>

        {/* Hiển thị thông tin đặt sân thời gian thực */}
        <div>
          <p>
            <b>Khung giờ đã được đặt:</b>
          </p>
          {realtimeLoading ? (
            <p>Đang tải...</p>
          ) : (
            <div>
              {realtimeBookings.length === 0 ? (
                <Tag color="green">Chưa có đặt sân nào cho ngày này</Tag>
              ) : (
                <div className="md:grid md:grid-cols-4 flex flex-col gap-4">
                  {realtimeBookings.map((booking, index) => (
                    <div
                      key={index}
                      style={{
                        width: "fit-content",
                        backgroundColor: "#e6f4ff",
                        borderRadius: "5px",
                        padding: "5px",
                      }}
                    >
                      🗓 {booking.date} | ⏰ {booking.startTime} -{" "}
                      {booking.endTime}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
