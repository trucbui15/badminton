"use client";

import { db } from "@/app/source/firebaseConfig";
import { Table, Modal, Button, Select, Input, DatePicker, message, Space, Form } from "antd";
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
import { SearchOutlined } from "@ant-design/icons";

export default function Page() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<any[]>([]);
  const [courtsData, setCourtsData] = useState<any[]>([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [tableHeight, setTableHeight] = useState(500); // Mặc định chiều cao của bảng

  // Cập nhật chiều cao bảng dựa trên cửa sổ
  useEffect(() => {
    const updateTableHeight = () => {
      // Tính toán chiều cao bảng dựa vào chiều cao cửa sổ trừ đi khoảng cách cho các phần tử khác
      const height = window.innerHeight - 300; // Trừ đi header, footer và các phần tử khác
      setTableHeight(Math.max(400, height)); // Tối thiểu là 400px
    };

    // Gọi lần đầu
    updateTableHeight();

    // Thêm event listener cho resize window
    window.addEventListener('resize', updateTableHeight);
    
    // Cleanup
    return () => window.removeEventListener('resize', updateTableHeight);
  }, []);

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

  // Search form states
  const [searchForm] = Form.useForm();
  const [searchName, setSearchName] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [searchCourt, setSearchCourt] = useState("");

  // Fetch bookings
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
      setFilteredBookings(bookingsData);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu bookings:", error);
    }
  };

  // Fetch courts
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

  // Handle search
  const handleSearch = () => {
    const filtered = bookings.filter(booking => {
      const nameMatch = searchName ? booking.fullName.toLowerCase().includes(searchName.toLowerCase()) : true;
      const phoneMatch = searchPhone ? booking.phone.includes(searchPhone) : true;
      
      // Tìm kiếm theo courtId hoặc courtName (nếu có)
      const courtMatch = searchCourt 
        ? (booking.courtId === searchCourt || 
          (booking.courtName && booking.courtName.includes(searchCourt)))
        : true;
      
      return nameMatch && phoneMatch && courtMatch;
    });
    
    // Hiển thị thông báo kết quả tìm kiếm
    if (filtered.length === 0) {
      message.info('Không tìm thấy kết quả nào phù hợp');
    } else {
      message.success(`Tìm thấy ${filtered.length} kết quả`);
    }
    
    setFilteredBookings(filtered);
  };

  const resetSearch = () => {
    searchForm.resetFields();
    setSearchName("");
    setSearchPhone("");
    setSearchCourt("");
    setFilteredBookings(bookings);
  };

  // Handle input change
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

  const handleCourtChange = (courtId: string) => {
    const selectedCourt = courtsData.find(court => court.id === courtId);
    setFormData({
      ...formData,
      courtId,
      courtName: selectedCourt?.name || "",
    });
  };

  const handleSubmit = async () => {
    // Validate form data
    const newError: { [key: string]: string } = {};

    if (!formData.fullName)
      newError.fullName = "Họ và tên không được để trống!";
    if (!formData.phone) newError.phone = "Số điện thoại không được để trống!";
    if (!formData.email) newError.email = "Email không được để trống!";
    if (!formData.date) newError.date = "Ngày không được để trống!";
    if (!formData.startTime)
      newError.startTime = "Giờ bắt đầu không được để trống!";
    if (!formData.duration)
      newError.duration = "Thời gian không được để trống!";
    if (!formData.courtId) newError.courtId = "Vui lòng chọn sân!";

    if (Object.keys(newError).length > 0) {
      setError(newError);
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
      message.error("Có lỗi xảy ra khi đặt sân!");
    }
  };

  const columns = [
    {
      title: "Họ Tên",
      dataIndex: "fullName",
      key: "fullName",
      width: 150,
      ellipsis: true,
      fixed: 'left' as const, // Cố định cột họ tên bên trái
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      width: 130,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 180,
      ellipsis: true,
    },
    {
      title: "Sân",
      dataIndex: "courtName",
      key: "courtName",
      width: 120,
      ellipsis: true,
    },
    {
      title: "Ngày Đặt Sân",
      dataIndex: "date",
      key: "date",
      width: 120,
    },
    {
      title: "Khung giờ",
      key: "timeRange",
      width: 130,
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
      width: 100,
      render: (duration: number) => `${duration} giờ`,
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalPrice",
      key: "totalPrice",
      width: 130,
      render: (total: number) => `${total?.toLocaleString()} VND`,
      fixed: 'right' as const, // Cố định cột tổng tiền bên phải
    }
   
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Quản lý sân</h1>
        <Button type="primary" onClick={() => setIsOpenModal(true)} className="bg-blue-500 hover:bg-blue-600">
          Đặt Sân
        </Button>
      </div>

      {/* Search Form */}
      <div className="mb-4 bg-white rounded-lg shadow">
        <div className="p-4">
          <Form form={searchForm} layout="vertical" className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Form.Item label="Tìm theo tên" className="mb-2">
                  <Input 
                    placeholder="Nhập tên khách hàng" 
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    allowClear
                    className="w-full"
                  />
                </Form.Item>
              </div>
              <div>
                <Form.Item label="Tìm theo số điện thoại" className="mb-2">
                  <Input 
                    placeholder="Nhập số điện thoại" 
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value)}
                    allowClear
                    className="w-full"
                  />
                </Form.Item>
              </div>
              <div>
                <Form.Item label="Tìm theo sân" className="mb-2">
                  <Select
                    placeholder="Chọn sân"
                    value={searchCourt}
                    onChange={(value) => setSearchCourt(value)}
                    allowClear
                    options={[
                      { label: "Sân 1", value: "Sân 1" },
                      { label: "Sân 2", value: "Sân 2" },
                      { label: "Sân 3", value: "Sân 3" },
                      { label: "Sân 4", value: "Sân 4" },
                      { label: "Sân 5", value: "Sân 5" },
                      ...(courtsData.map(court => ({
                        label: court.name,
                        value: court.name // Sử dụng tên sân thay vì ID
                      })))
                    ].filter((v, i, a) => a.findIndex(t => t.value === v.value) === i)} // Loại bỏ các giá trị trùng lặp
                    className="w-full"
                  />
                </Form.Item>
              </div>
            </div>
            <div className="flex justify-end mt-2">
              <Space>
                <Button icon={<SearchOutlined />} type="primary" onClick={handleSearch} className="bg-blue-500">
                  Tìm kiếm
                </Button>
                <Button onClick={resetSearch}>Đặt lại</Button>
              </Space>
            </div>
          </Form>
        </div>
      </div>

      {/* Bảng với thanh cuộn cải tiến */}
      <div className="w-full border rounded-lg shadow-sm bg-white">
        <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-700">
            {searchCourt ? `Danh sách đặt ${searchCourt}` : 'Tất cả các đặt sân'}
          </h3>
          <div className="text-sm text-gray-500">
            Tổng số: {filteredBookings.length} đặt sân
          </div>
        </div>
        <Table 
          columns={columns} 
          dataSource={filteredBookings}
          pagination={{ 
            pageSize: 10, 
            position: ['bottomCenter'],
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bản ghi`
          }}
          scroll={{ 
            x: 'max-content', 
            y: tableHeight 
          }}
          size="middle"
          className="min-w-full rounded-lg"
          sticky={true}
          summary={(pageData) => {
            let totalAmount = 0;
            pageData.forEach(({ totalPrice }) => {
              totalAmount += totalPrice || 0;
            });
            return (
              <>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={7} className="text-right font-semibold">
                    Tổng tiền (trang hiện tại):
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} className="font-semibold text-blue-600">
                    {totalAmount.toLocaleString()} VND
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </>
            );
          }}
          locale={{
            emptyText: (
              <div className="py-8 text-center">
                <div className="text-gray-500">Không có dữ liệu</div>
                {searchCourt && (
                  <div className="mt-2">
                    <Button type="primary" onClick={resetSearch} className="bg-blue-500">
                      Xem tất cả đặt sân
                    </Button>
                  </div>
                )}
              </div>
            )
          }}
        />
      </div>

      <Modal
        open={isOpenModal}
        onCancel={() => setIsOpenModal(false)}
        onOk={handleSubmit}
        title="Đặt sân"
        width={600}
        maskClosable={false}
      >
        <div className="p-2 md:p-4">
          <div className="w-full space-y-3">
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Chọn Sân
              </label>
              <Select
                className="w-full"
                placeholder="Chọn sân"
                options={courtsData.map(court => ({
                  label: court.name,
                  value: court.id
                }))}
                value={formData.courtId}
                onChange={handleCourtChange}
              />
              {error.courtId && <p className="text-red-500 text-sm">{error.courtId}</p>}
              {formData.courtName && (
                <p className="mt-2 font-bold text-blue-600">
                  {formData.courtName}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Họ và Tên
                </label>
                <Input
                  placeholder="Họ và tên"
                  size="large"
                  value={formData.fullName}
                  onChange={handleChangeName}
                  className="w-full"
                />
                {error.fullName && (
                  <p className="text-red-500 text-sm">{error.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Số Điện Thoại
                </label>
                <Input
                  placeholder="Số điện thoại"
                  size="large"
                  value={formData.phone}
                  onChange={handleChangePhone}
                  maxLength={10}
                  className="w-full"
                />
                {error.phone && <p className="text-red-500 text-sm">{error.phone}</p>}
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Email
                </label>
                <Input
                  placeholder="Email"
                  size="large"
                  value={formData.email}
                  onChange={handleChangeEmail}
                  className="w-full"
                />
                {error.email && <p className="text-red-500 text-sm">{error.email}</p>}
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Chọn Ngày
                </label>
                <DatePicker
                  className="w-full"
                  value={formData.date}
                  onChange={(date) => handleChange("date", date)}
                  format="DD/MM/YYYY"
                  disabledDate={(current) =>
                    current && current.isBefore(dayjs(), "day")
                  }
                />
                {error.date && <p className="text-red-500 text-sm">{error.date}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Thời Gian Bắt Đầu
                  </label>
                  <Select
                    className="w-full"
                    options={generateTimeSlots()}
                    value={formData.startTime}
                    onChange={(value) => handleChange("startTime", value)}
                  />
                  {error.startTime && (
                    <p className="text-red-500 text-sm">{error.startTime}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Thời Lượng
                  </label>
                  <Select
                    className="w-full"
                    options={durationOptions}
                    value={formData.duration}
                    onChange={(value) => handleChange("duration", value)}
                  />
                  {error.duration && (
                    <p className="text-red-500 text-sm">{error.duration}</p>
                  )}
                  {formData.startTime && formData.duration && (
                    <p className="mt-2 text-gray-700 text-sm">
                      Giờ kết thúc: {calculateEndTime()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}