"use client";

import { db } from "@/app/source/firebaseConfig";
import {
  Table,
  Modal,
  Button,
  Select,
  Input,
  DatePicker,
  message,
} from "antd";
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
        <Button type="primary" onClick={() => setIsOpenModal(true)}>
          Đặt Sân
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
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">
            Chọn sân
          </label>
          <Select
            className="w-full"
            placeholder="Chọn sân"
            value={formData.courtId}
            onChange={(value) => {
              const selectedCourt = courtsData.find((c) => c.id === value);
              setFormData({
                ...formData,
                courtId: value,
                courtName: selectedCourt?.name || "",
              });
            }}
            options={courtsData.map((court) => ({
              label: court.name,
              value: court.id,
            }))}
          />
        </div>

        {/* Thông tin người dùng */}
        <Input
          className="mb-3"
          placeholder="Họ và tên"
          size="large"
          value={formData.fullName}
          onChange={handleChangeName}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
        />
        <Input
          className="mb-3"
          placeholder="Số điện thoại"
          size="large"
          maxLength={10}
          value={formData.phone}
          onChange={handleChangePhone}
        />
        <Input
          className="mb-3"
          placeholder="Email"
          size="large"
          value={formData.email}
          onChange={handleChangeEmail}
        />

        {/* Ngày */}
        <DatePicker
          className="w-full mb-3"
          value={formData.date}
          onChange={(date) => handleChange("date", date)}
          format="DD/MM/YYYY"
          placeholder="Chọn ngày"
          disabledDate={(current) => current && current.isBefore(dayjs(), "day")}
        />

        {/* Thời gian */}
        <div className="flex gap-4 mb-4">
          <Select
            className="w-1/2"
            placeholder="Giờ bắt đầu"
            options={generateTimeSlots()}
            value={formData.startTime}
            onChange={(value) => handleChange("startTime", value)}
          />
          <Select
            className="w-1/2"
            placeholder="Số giờ chơi"
            options={durationOptions}
            value={formData.duration}
            onChange={(value) => handleChange("duration", value)}
          />
        </div>

        {formData.startTime && formData.duration && (
          <p className="text-gray-600 mb-2">
            Giờ kết thúc: {calculateEndTime()}
          </p>
        )}
      </Modal>
    </>
  );
}
