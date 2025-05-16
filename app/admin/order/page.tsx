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
  Space,
  Form,
  Tag,
  Popconfirm,
} from "antd";
import dayjs from "dayjs";
import {
  collection,
  getDocs,
  orderBy,
  query,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  SearchOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  DeleteOutlined  
} from "@ant-design/icons";

// Define types properly
interface FormDataType {
  key?: string;
  courtId: string;
  courtName: string;
  fullName: string;
  phone: string;
  email: string;
  date: dayjs.Dayjs | null;
  startTime: string;
  duration: string | number;
  endTime: string;
  totalPrice: number;
  // timestamp: any; // Using any for Firebase timestamp
  isPaid: boolean;
  // paidAt?: any; // Optional paid timestamp
}

interface CourtType {
  id: string;
  name: string;
  type: string;
  price: number;
  image: string;
}

export default function Page() {
  const [bookings, setBookings] = useState<FormDataType[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<FormDataType[]>([]);
  const [courtsData, setCourtsData] = useState<CourtType[]>([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [tableHeight, setTableHeight] = useState(500);
  const [revenueStats, setRevenueStats] = useState({
    totalRevenue: 0,
    paidCount: 0,
  });

  // Cập nhật chiều cao bảng dựa trên cửa sổ
  useEffect(() => {
    const updateTableHeight = () => {
      const height = window.innerHeight - 300;
      setTableHeight(Math.max(400, height));
    };

    updateTableHeight();
    window.addEventListener("resize", updateTableHeight);

    return () => window.removeEventListener("resize", updateTableHeight);
  }, []);

  const [isComposing] = useState(false);
  const [error, setError] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState<FormDataType>({
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
    // timestamp: null,
    isPaid: false,
  });

  // Search form states
  const [searchForm] = Form.useForm();
  const [searchName, setSearchName] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [searchCourt, setSearchCourt] = useState("");
  const [searchPaymentStatus, setSearchPaymentStatus] = useState("");

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
        isPaid: doc.data().isPaid || false,
      })) as FormDataType[];
      
      setBookings(bookingsData);
      setFilteredBookings(bookingsData);
      calculateRevenueStats(bookingsData);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu bookings:", error);
    }
  };

  // Calculate revenue statistics
  const calculateRevenueStats = (bookingsData: FormDataType[]) => {
    const paidBookings = bookingsData.filter((booking) => booking.isPaid);
    const totalRevenue = paidBookings.reduce(
      (sum, booking) => sum + (booking.totalPrice || 0),
      0
    );

    setRevenueStats({
      totalRevenue,
      paidCount: paidBookings.length,
    });
  };

  // Handle payment status change
  const handlePaymentStatus = async (record: FormDataType) => {
    try {
      if (!record.key) {
        throw new Error("Record key is missing");
      }
      
      const bookingRef = doc(db, "bookings", record.key);
      await updateDoc(bookingRef, {
        isPaid: true,
        paidAt: serverTimestamp(),
      });

      message.success(
        `Đã xác nhận thanh toán cho đặt sân của ${record.fullName}`
      );

      // Update local state
      const updatedBookings = bookings.map((booking) =>
        booking.key === record.key ? { ...booking, isPaid: true } : booking
      );

      setBookings(updatedBookings);
      setFilteredBookings(
        updatedBookings.filter((booking) => {
          // Apply current filters
          const nameMatch = searchName
            ? booking.fullName.toLowerCase().includes(searchName.toLowerCase())
            : true;
          const phoneMatch = searchPhone
            ? booking.phone.includes(searchPhone)
            : true;
          const courtMatch = searchCourt
            ? booking.courtId === searchCourt ||
              (booking.courtName && booking.courtName.includes(searchCourt))
            : true;
          const paymentMatch = searchPaymentStatus
            ? searchPaymentStatus === "paid"
              ? booking.isPaid
              : !booking.isPaid
            : true;

          return nameMatch && phoneMatch && courtMatch && paymentMatch;
        })
      );

      // Update revenue stats
      calculateRevenueStats(updatedBookings);
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái thanh toán:", error);
      message.error("Có lỗi xảy ra khi cập nhật trạng thái thanh toán");
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
        })) as CourtType[];
        
        setCourtsData(courtsList);
      } catch (error) {
        console.error("Lỗi lấy danh sách sân:", error);
      }
    };

    fetchCourts();
  }, []);

  // Handle search
  const handleSearch = () => {
    const filtered = bookings.filter((booking) => {
      const nameMatch = searchName
        ? booking.fullName.toLowerCase().includes(searchName.toLowerCase())
        : true;
      const phoneMatch = searchPhone
        ? booking.phone.includes(searchPhone)
        : true;

      // Tìm kiếm theo courtId hoặc courtName (nếu có)
      const courtMatch = searchCourt
        ? booking.courtId === searchCourt ||
          (booking.courtName && booking.courtName.includes(searchCourt))
        : true;

      // Tìm kiếm theo trạng thái thanh toán
      const paymentMatch = searchPaymentStatus
        ? searchPaymentStatus === "paid"
          ? booking.isPaid
          : !booking.isPaid
        : true;

      return nameMatch && phoneMatch && courtMatch && paymentMatch;
    });

    // Hiển thị thông báo kết quả tìm kiếm
    if (filtered.length === 0) {
      message.info("Không tìm thấy kết quả nào phù hợp");
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
    setSearchPaymentStatus("");
    setFilteredBookings(bookings);
  };

  // Handle input change
  const handleChange = (field: string, value: unknown) => {
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
    { label: "1 giờ", value: "1" },
    { label: "2 giờ", value: "2" },
    { label: "3 giờ", value: "3" },
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
    const selectedCourt = courtsData.find((court) => court.id === courtId);
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
      isPaid: false, // Default to unpaid
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
        // timestamp: null,
        isPaid: false,
      });
      fetchBookings();
    } catch (err) {
      console.error("Lỗi khi đặt sân:", err);
      message.error("Có lỗi xảy ra khi đặt sân!");
    }
  };

  
const handleDelete = async (record: FormDataType) => {
  try {
    if (!record.key) {
      throw new Error("Record key is missing");
    }
    
    console.log("Xóa đơn đặt sân với ID:", record.key);

    // Sử dụng cú pháp mới nhất quán với phần còn lại của code
    const docRef = doc(db, "bookings", record.key);
    
    await deleteDoc(docRef);
    
    message.success("Đã xóa đơn đặt sân thành công!");
    
    // Cập nhật state sau khi xóa
    const updatedBookings = bookings.filter(booking => booking.key !== record.key);
    setBookings(updatedBookings);
    setFilteredBookings(filteredBookings.filter(booking => booking.key !== record.key));
    
    // Cập nhật thống kê
    calculateRevenueStats(updatedBookings);
  } catch (error) {
    console.error("Lỗi khi xóa dữ liệu:", error);
    message.error("Có lỗi xảy ra khi xóa dữ liệu!");
  }
};

  const columns = [
    {
      title: "Họ Tên",
      dataIndex: "fullName",
      key: "fullName",
      width: 150,
      ellipsis: true,
      fixed: "left" as const,
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
      render: (_: unknown, record: FormDataType) => (
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
      render: (duration: number | string) => `${duration} giờ`,
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalPrice",
      key: "totalPrice",
      width: 130,
      render: (total: number) => `${total?.toLocaleString()} VND`,
    },
    {
      title: "Trạng thái",
      key: "paymentStatus",
      width: 120,
      render: (_: unknown, record: FormDataType) => (
        <Tag
          color={record.isPaid ? "green" : "orange"}
          className="text-center px-2 py-1"
        >
          {record.isPaid ? (
            <>
              <CheckCircleOutlined /> Đã thanh toán
            </>
          ) : (
            "Chưa thanh toán"
          )}
        </Tag>
      ),
    },
    {
  title: "Hành động",
  key: "action",
  width: 120,
  fixed: "right" as const,
  render: (_: unknown, record: FormDataType) => (
    <div className="flex items-center gap-2">
      {!record.isPaid ? (
        <Popconfirm
          title="Xác nhận thanh toán"
          description={`Xác nhận thanh toán cho đặt sân của ${record.fullName}?`}
          onConfirm={() => handlePaymentStatus(record)}
          okText="Xác nhận"
          cancelText="Hủy"
        >
          <Button
            type="primary"
            icon={<DollarOutlined />}
            className="bg-green-500 hover:bg-green-600"
            size="small"
          >
            Thanh toán
          </Button>
        </Popconfirm>
      ) : (
        <Button
          type="default"
          size="small"
          disabled
          className="text-green-500"
          icon={<CheckCircleOutlined />}
        >
          Đã thanh toán
        </Button>
      )}

      <Popconfirm
        title="Xác nhận xóa"
        description={`Bạn có chắc chắn muốn xóa đặt sân của ${record.fullName}?`}
        onConfirm={() => handleDelete(record)}
        okText="Xóa"
        cancelText="Hủy"
      >
        <Button
          danger
          icon={<DeleteOutlined />}
          size="small"
        >
          Xóa
        </Button>
      </Popconfirm>
    </div>
  )
}
  ];

  return (
    // Wrapper để tạo full page scrolling
    <div
      className="h-full overflow-auto pb-10"
      style={{ maxHeight: "calc(100vh - 64px)" }}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
        <h1 className="text-xl font-bold">Quản lý sân</h1>
        <Button
          type="primary"
          onClick={() => setIsOpenModal(true)}
          className="bg-blue-500 hover:bg-blue-600"
        >
          Đặt Sân
        </Button>
      </div>

      {/* Thống kê doanh thu */}
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <DollarOutlined className="text-xl sm:text-2xl text-green-500 mr-2" />
            <div>
              <h3 className="text-base sm:text-lg font-semibold">
                Tổng doanh thu
              </h3>
              <p className="text-xl sm:text-2xl font-bold text-green-600">
                {revenueStats.totalRevenue.toLocaleString()} VND
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <CheckCircleOutlined className="text-xl sm:text-2xl text-blue-500 mr-2" />
            <div>
              <h3 className="text-base sm:text-lg font-semibold">
                Đặt sân đã thanh toán
              </h3>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">
                {revenueStats.paidCount} / {bookings.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Form */}
      <div className="mb-4 bg-white rounded-lg shadow">
        <div className="p-3 sm:p-4">
          <Form form={searchForm} layout="vertical" className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
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
                      ...courtsData.map((court) => ({
                        label: court.name,
                        value: court.name,
                      })),
                    ].filter(
                      (v, i, a) => a.findIndex((t) => t.value === v.value) === i
                    )}
                    className="w-full"
                  />
                </Form.Item>
              </div>
              <div>
                <Form.Item label="Trạng thái thanh toán" className="mb-2">
                  <Select
                    placeholder="Trạng thái thanh toán"
                    value={searchPaymentStatus}
                    onChange={(value) => setSearchPaymentStatus(value)}
                    allowClear
                    options={[
                      { label: "Đã thanh toán", value: "paid" },
                      { label: "Chưa thanh toán", value: "unpaid" },
                    ]}
                    className="w-full"
                  />
                </Form.Item>
              </div>
            </div>
            <div className="flex justify-end mt-2">
              <Space className="flex-wrap gap-2">
                <Button
                  icon={<SearchOutlined />}
                  type="primary"
                  onClick={handleSearch}
                  className="bg-blue-500"
                >
                  Tìm kiếm
                </Button>
                <Button onClick={resetSearch}>Đặt lại</Button>
              </Space>
            </div>
          </Form>
        </div>
      </div>

      {/* Bảng với thanh cuộn cải tiến */}
      <div className="w-full border rounded-lg shadow-sm bg-white overflow-hidden">
        <div className="p-3 sm:p-4 border-b bg-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <h3 className="text-sm sm:text-base font-semibold text-gray-700">
            {searchCourt
              ? `Danh sách đặt ${searchCourt}`
              : "Tất cả các đặt sân"}
            {searchPaymentStatus === "paid"
              ? " (Đã thanh toán)"
              : searchPaymentStatus === "unpaid"
              ? " (Chưa thanh toán)"
              : ""}
          </h3>
          <div className="text-xs sm:text-sm text-gray-500">
            Tổng số: {filteredBookings.length} đặt sân
          </div>
        </div>
        <div className="overflow-x-auto w-full">
          <Table
            columns={columns}
            dataSource={filteredBookings}
            scroll={{ x: "max-content", y: tableHeight }}
            className="w-full min-w-full"
            sticky={true}
            summary={(pageData) => {
              let totalAmount = 0;
              let paidAmount = 0;
              let unpaidAmount = 0;

              pageData.forEach((record: FormDataType) => {
                totalAmount += record.totalPrice || 0;
                if (record.isPaid) {
                  paidAmount += record.totalPrice || 0;
                } else {
                  unpaidAmount += record.totalPrice || 0;
                }
              });

              return (
                <>
                  <Table.Summary.Row>
                    <Table.Summary.Cell
                      index={0}
                      colSpan={7}
                      className="text-right font-semibold"
                    >
                      Tổng tiền (trang hiện tại):
                    </Table.Summary.Cell>
                    <Table.Summary.Cell
                      index={1}
                      className="font-semibold text-blue-600"
                    >
                      {totalAmount.toLocaleString()} VND
                    </Table.Summary.Cell>
                    <Table.Summary.Cell
                      index={2}
                      colSpan={2}
                    ></Table.Summary.Cell>
                  </Table.Summary.Row>
                  <Table.Summary.Row>
                    <Table.Summary.Cell
                      index={0}
                      colSpan={7}
                      className="text-right font-semibold"
                    >
                      <span className="text-green-600">Đã thanh toán:</span>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell
                      index={1}
                      className="font-semibold text-green-600"
                    >
                      {paidAmount.toLocaleString()} VND
                    </Table.Summary.Cell>
                    <Table.Summary.Cell
                      index={2}
                      colSpan={2}
                    ></Table.Summary.Cell>
                  </Table.Summary.Row>
                  <Table.Summary.Row>
                    <Table.Summary.Cell
                      index={0}
                      colSpan={7}
                      className="text-right font-semibold"
                    >
                      <span className="text-orange-500">Chưa thanh toán:</span>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell
                      index={1}
                      className="font-semibold text-orange-500"
                    >
                      {unpaidAmount.toLocaleString()} VND
                    </Table.Summary.Cell>
                    <Table.Summary.Cell
                      index={2}
                      colSpan={2}
                    ></Table.Summary.Cell>
                  </Table.Summary.Row>
                </>
              );
            }}
            locale={{
              emptyText: (
                <div className="py-6 sm:py-8 text-center">
                  <div className="text-gray-500">Không có dữ liệu</div>
                  {(searchCourt || searchPaymentStatus) && (
                    <div className="mt-2">
                      <Button
                        type="primary"
                        onClick={resetSearch}
                        className="bg-blue-500"
                      >
                        Xem tất cả đặt sân
                      </Button>
                    </div>
                  )}
                </div>
              ),
            }}
          />
        </div>
      </div>

      <Modal
        open={isOpenModal}
        onCancel={() => setIsOpenModal(false)}
        onOk={handleSubmit}
        title="Đặt sân"
        width={600}
        maskClosable={false}
        className="w-full max-w-lg sm:max-w-xl md:max-w-2xl"
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
                options={courtsData.map((court) => ({
                  label: court.name,
                  value: court.id,
                }))}
                value={formData.courtId}
                onChange={handleCourtChange}
              />
              {error.courtId && (
                <p className="text-red-500 text-sm">{error.courtId}</p>
              )}
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
                {error.phone && (
                  <p className="text-red-500 text-sm">{error.phone}</p>
                )}
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
                {error.email && (
                  <p className="text-red-500 text-sm">{error.email}</p>
                )}
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
                {error.date && (
                  <p className="text-red-500 text-sm">{error.date}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
    </div>
  );
}
