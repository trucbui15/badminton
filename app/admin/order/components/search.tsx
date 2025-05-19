
import {
  Button,
  Select,
  Input,
  Space,
  Form,
  message
} from "antd";
import { CourtType, FormDataType } from "@/app/data/types"; // Import the FormDataType interface

import {
  SearchOutlined,
} from "@ant-design/icons";
import { useState } from "react";
const SearchForm = () => {
    const [searchForm] = Form.useForm();
    const [bookings, ] = useState<FormDataType[]>([]);
    const [courtsData, ] = useState<CourtType[]>([]);
    const [searchName, setSearchName] = useState("");
    const [searchPhone, setSearchPhone] = useState("");
    const [searchCourt, setSearchCourt] = useState("");
    const [searchPaymentStatus, setSearchPaymentStatus] = useState("");
    const [, setFilteredBookings] = useState<FormDataType[]>([]);
    
    
    const resetSearch = () => {
    searchForm.resetFields();
    setSearchName("");
    setSearchPhone("");
    setSearchCourt("");
    setSearchPaymentStatus("");
    setFilteredBookings(bookings);
  };
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

    return(
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
    )
    
}
export default SearchForm;