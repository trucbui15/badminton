"use client";
import { collection, addDoc, serverTimestamp, query, where, getDocs  } from "firebase/firestore";
import { db } from "@/app/source/firebaseConfig";
import { useState, useEffect } from "react";
import {Input, Select, DatePicker, Typography, Space, Modal, Image, Divider, Button, Card, Tag} from "antd";
import dayjs from "dayjs";
import { courtsData } from "@/app/data/data";
import { CheckCircleTwoTone, ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import { useBookings } from "@/app/hooks/useBookings";
import { isTimeConflict, Booking } from "@/app/source/timeprocessing";

const { Title, Text } = Typography;

export default function BookingModal({ court }: { court: number }) {
  

  const [bookingInfo, setBookingInfo] = useState<any>(null); // Lưu thông tin đặt sân
  const [isComposing, setIsComposing] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [selectedCourtId, setSelectedCourtId] = useState(null);
  const [selectedCourtName, setSelectedCourtName] = useState("");
  const [selectedCourtPrice, setSelectedCourtPrice] = useState(0);
  const [formData, setFormData] = useState({
    courtId: "",
    courtName: "",
    fullName: "",
    phone: "",
    email: "",
    date: null as dayjs.Dayjs | null,
    startTime: "",
    duration: "",
    endTime: "",
    totalPrice: 0,
    timestamp: null as any,
  });

  const [error, setError] = useState<{ [key: string]: string }>({});

  // Hàm cập nhật formData
  const handleChange = (field: string, value: string | dayjs.Dayjs | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isComposing) return; // Đợi gõ xong mới xử lý
    // const inputValue = e.target.value.replace(/[^a-zA-ZÀ-ỹ\s'’-]/g, "");
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

    console.log("Email nhập vào:", inputValue);
    handleChange("email", inputValue); // Cập nhật email trong formData
  };

  // Tạo danh sách giờ từ 05:00 đến 21:00 (mỗi 30 phút)
  const generateTimeSlots = () => {
    const slots = [];
    let start = dayjs().hour(5).minute(0); // 05:00
    const end = dayjs().hour(21).minute(0); // 21:00

    // Bao gồm cả mốc 21:00
    while (start.isBefore(end) || start.isSame(end)) {
      slots.push({
        label: start.format("HH:mm"),
        value: start.format("HH:mm"),
      });
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

  const validateBooking = () => {
    const { fullName, phone, email, date, startTime, duration } = formData;
    let error: { [key: string]: string } = {}; // Dùng error thay vì errors

    if (!fullName) {
      error.name = "Vui lòng nhập họ và tên!";
    }

    if (!phone) {
      error.phone = "Vui lòng nhập số điện thoại!";
    } else if (!/^\d{10}$/.test(phone)) {
      error.phone = "Số điện thoại phải là 10 chữ số!";
    }

    if (!email) {
      error.email = "Vui lòng nhập email!";
    } else {
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailPattern.test(email.trim())) {
        error.email = "Vui lòng nhập đúng định dạng email!";
      }
    }

    if (!date) {
      error.date = "Vui lòng chọn ngày!";
    }

    if (!startTime) {
      error.startTime = "Vui lòng chọn giờ bắt đầu!";
    } else {
      const baseTime = dayjs(startTime, "HH:mm");
      let addMinutes =
        { "30m": 30, "1h": 60, "2h": 120, "3h": 180 }[duration] || 60;
      const endTime = baseTime.add(addMinutes, "minute");
      const limitTime = dayjs("22:00", "HH:mm");

      if (endTime.isAfter(limitTime)) {
        error.endTime = "Thời gian kết thúc không được sau 22:00!";
      }
    }

    return error;
  };

  const handleSubmit = async () => {
    const error = validateBooking();
    setError(error);

    if (Object.keys(error).length === 0) {
      try {
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

        const durationInHours = durationMap[formData.duration] || 1; // fallback = 1h
        const calculatedEndTime = dayjs(formattedStartTime, "HH:mm")
          .add(durationInHours * 60, "minute")
          .format("HH:mm");

        const getDuration = (start: string, end: string): string => {
          const [sh, sm] = start.split(":").map(Number);
          const [eh, em] = end.split(":").map(Number);
          const startMinutes = sh * 60 + sm;
          const endMinutes = eh * 60 + em;
          const diffMinutes = endMinutes - startMinutes;
          const hours = Math.floor(diffMinutes / 60);
          const minutes = diffMinutes % 60;
          return `${hours}${minutes > 0 ? ` ${minutes} phút` : ""}`;
        };

        const duration = getDuration(formattedStartTime, calculatedEndTime);
        const q = query(
          collection(db, "bookings"),
          where("courtId", "==", courtsData[court].id),
          where("date", "==", formattedDate)
        );
        const querySnapshot = await getDocs(q);
        const existingBookings: Booking[] = [];
  
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          existingBookings.push({
            startTime: data.startTime,
            endTime: data.endTime,
          });
        });
  
        const hasConflict = isTimeConflict(
          formattedStartTime,
          calculatedEndTime,
          existingBookings
        );
        if (hasConflict) {
          alert("⚠️ Khung giờ đã được đặt. Vui lòng chọn giờ khác.");
          return;
        }
        const selectedCourt = courtsData.find(
          (court) => court.id === selectedCourtId
        );
        const totalPrice = durationInHours * Number(selectedCourt?.price) || 0;
        
        const bookingData = {
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          date: formattedDate,
          startTime: formattedStartTime,
          endTime: calculatedEndTime,
          duration,
          courtId: courtsData[court].id,
          courtName: courtsData[court].name,
          price: courtsData[court].price,
          totalPrice: calculatePrice(),
          timestamp: serverTimestamp(),
        };

        await addDoc(collection(db, "bookings"), bookingData);

        alert("Đặt sân thành công!");
        setBookingInfo(bookingData);
        setIsSuccessModalOpen(true);
      } catch (err) {
        console.error("Lỗi khi gửi lên Firestore:", err);
        alert("Đặt sân thất bại! Vui lòng thử lại.");
      }
    } else {
      alert("Vui lòng điền đầy đủ thông tin.");
    }
  };

  const calculatePrice = () => {
    console.log("111");
    const durationPrices = {
      "30m": 0.5,
      "1h": 1,
      "2h": 2,
      "3h": 3,
    } as const;

    const hours =
      durationPrices[formData.duration as keyof typeof durationPrices] || 0;

    const selectedCourt = courtsData.find(
      (court) => court.id === Number(court)
    );

    const pricePerHour = Number(selectedCourt?.price) || 0;

    return hours * courtsData[court].price;
  };

  const BookingSuccessModal = {
    isSuccessModalOpen,
    setIsSuccessModalOpen,
    bookingInfo,
  };

  const { bookings, loading } = useBookings();

// Lọc các booking của sân đang chọn:
const bookingsForCourt = bookings.filter(
  (b) => b.courtId === courtsData[court]?.id
);

  return (
    <div className="md:p-4 flex gap-8">
      {/* Form Đặt Sân (Bên trái) */}
      <div className="w-1/2 space-y-4">
        <p className="font-bold text-blue-600">{courtsData[court].name}</p>

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
            />
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
            />
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
            />
          </div>

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
            />
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
            </div>
          </div>

          <div className="flex items-center justify-center mt-4">
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
              {bookingInfo?.date || "Chưa có"}
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
              {formData?.duration ? `${formData.duration} giờ` : "Chưa có"}
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
              <strong>Sân:</strong> {courtsData[court].name}
            </p>
            <p>
              <strong>Giờ bắt đầu:</strong> {formData.startTime}
            </p>
            <p>
              <strong>Giờ kết thúc:</strong> {calculateEndTime()}
            </p>
            <p>
              <strong>Tổng tiền:</strong> {calculatePrice()} VND
            </p>
          </div>
          <div className="w-1/2">
            <Image
              src={courtsData[court].image}
              alt="Sân cầu lông"
              className="md:w-[200px] md:h-[150px] w-[50px] h-[50px]"
            />
          </div>
        </div>
        <p><b>Khung giờ đã được đặt:</b></p>
{loading ? (
  <p>Đang tải...</p>
) : bookingsForCourt.length === 0 ? (
  <Tag color="green">Chưa có đặt</Tag>
) : (
 
  <div className="md:grid md:grid-cols-2 flex flex-col gap-2">
  {bookingsForCourt.map((b, index) => (  
    <div
      key={index}
      style={{
        width: "fit-content",
        backgroundColor: "#e6f4ff",
        borderRadius: "5px",
        padding: "5px"
      }}
    >
      🗓 {b.date} | ⏰ {b.startTime} - {b.endTime}
    </div>
  ))}
</div>

)}

      </div>
    </div>
  );
}
