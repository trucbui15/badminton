"use client";

import { db } from "@/app/source/firebaseConfig";
import { Table, Modal, Button, Select, Input, DatePicker, message } from "antd";
import dayjs from "dayjs";
import {
  collection,
  getDocs,
  orderBy,
  query,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useEffect, useState } from "react";

export default function Page() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [courtsData, setCourtsData] = useState<any[]>([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [error, setError] = useState<{ [key: string]: string }>({});

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

  // Lấy danh sách bookings
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const q = query(collection(db, "bookings"), orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      const bookingsData = querySnapshot.docs.map((doc) => ({
        key: doc.id,
        ...doc.data(),
      }));
      setBookings(bookingsData);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu bookings:", error);
    }
  };

  // Lấy danh sách courts
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
        console.error("Lỗi lấy danh sách sân:", error);
      }
    };

    fetchCourts();
  }, []);

  // Xử lý form
  const handleChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isComposing) {
      setFormData({ ...formData, fullName: e.target.value });
    }
  };

  const handleChangePhone = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, phone: e.target.value });
  };

  const handleChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, email: e.target.value });
  };

  const durationOptions = [
    { label: "1 giờ", value: 1 },
    { label: "2 giờ", value: 2 },
    { label: "3 giờ", value: 3 },
  ];

  const generateTimeSlots = () => {
    const slots = [];
    for (let i = 6; i <= 22; i++) {
      const hour = i.toString().padStart(2, "0") + ":00";
      slots.push({ label: hour, value: hour });
    }
    return slots;
  };

  const calculateEndTime = () => {
    if (!formData.startTime || !formData.duration) return "";
    const [hours, minutes] = formData.startTime.split(":").map(Number);
    const endHour = hours + Number(formData.duration);
    return `${endHour.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  const handleSubmit = async () => {
    if (
      !formData.fullName ||
      !formData.phone ||
      !formData.date ||
      !formData.startTime ||
      !formData.duration ||
      !formData.courtId
    ) {
      message.error("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    const endTime = calculateEndTime();
    const totalPrice = Number(formData.duration) * 100000;

    const newBooking = {
      ...formData,
      endTime,
      totalPrice,
      date: formData.date?.format("DD/MM/YYYY"),
      timestamp: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, "bookings"), newBooking);
      message.success("Đặt sân thành công!");
      setIsOpenModal(false);
      setFormData({
        courtId: "",
        courtName: "",
        fullName: "",
        phone: "",
        email: "",
        date: null,
        startTime: "",
        duration: "",
        endTime: "",
        totalPrice: 0,
        timestamp: null,
      });
      fetchBookings();
    } catch (err) {
      console.error("Lỗi khi đặt sân:", err);
    }
  };

  const columns = [
    {
      title: "Họ Tên",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Sân",
      dataIndex: "courtName",
      key: "courtName",
    },
    {
      title: "Ngày Đặt Sân",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Khung giờ",
      key: "timeRange",
      render: (_: any, record: any) => (
        <span>
          {record.startTime} - {record.endTime}
        </span>
      ),
    },
    {
      title: "Thời lượng",
      dataIndex: "duration",
      key: "duration",
      render: (duration: number) => `${duration} giờ`,
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (total: number) => `${total?.toLocaleString()} VND`,
    },
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Quản lý sân</h1>
        <Button
          onClick={handleSubmit}
          type="primary"
          disabled={
            !formData.fullName ||
            !formData.phone ||
            !formData.date ||
            !formData.startTime ||
            !formData.duration ||
            !formData.courtId
          }
        >
          Xác nhận đặt sân
        </Button>
      </div>

      <Table columns={columns} dataSource={bookings} />

      <Modal
        open={isOpenModal}
        onCancel={() => setIsOpenModal(false)}
        onOk={handleSubmit}
        title="Đặt sân"
      >
        {/* Chọn sân */}
        <div className="md:p-4 flex gap-8">
          {/* Form Đặt Sân (Bên trái) */}
          <div className="w-1/2 space-y-4">
            <p className="font-bold text-blue-600">
              {courtsData.find((court) => court.id === formData.courtId)?.name}
            </p>

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
                <Button
                  onClick={handleSubmit}
                  type="primary"
                  disabled={Object.keys(error).length > 0}
                >
                  Đặt sân
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
