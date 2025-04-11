"use client";

import { useState, useEffect } from "react";
import { Layout, Menu, Table } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  FieldTimeOutlined,
  BarChartOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/app/source/firebaseConfig"; // Cập nhật đúng path đến firebaseConfig.ts

const { Sider, Content } = Layout;

const AdminPage = () => {
  const [selectedPage, setSelectedPage] = useState("dashboard");
  const [data, setData] = useState<any[]>([]);

  // Fetch data from Firestore when selectedPage is "users"
  useEffect(() => {
    const fetchBookings = async () => {
      if (selectedPage !== "users") return;

      try {
        const q = query(collection(db, "bookings"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        const bookingsData = querySnapshot.docs.map((doc) => ({
          key: doc.id,
          ...doc.data(),
        }));
        setData(bookingsData);
      } catch (error) {
        console.error("Lỗi lấy dữ liệu bookings:", error);
      }
    };

    fetchBookings();
  }, [selectedPage]);

  const columns = [
    {
      title: "Họ Tên",
      dataIndex: "fullName",
      key: "fullName",
      render: (text: string) => <a>{text}</a>,
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

  const renderContent = () => {
    switch (selectedPage) {
      case "dashboard":
        return <h1 className="text-2xl font-bold">🏠 Dashboard</h1>;
      case "users":
        return (
          <>
            <h1 className="text-2xl font-bold mb-4">👥 Quản lý sân</h1>
            <Table columns={columns} dataSource={data} />
          </>
        );
      case "courts":
        return <h1 className="text-2xl font-bold">🛠️ Quản lý người dùng</h1>;
      case "revenue":
        return <h1 className="text-2xl font-bold">💰 Doanh thu</h1>;
      case "reviews":
        return <h1 className="text-2xl font-bold">⭐ Đánh giá & phản hồi</h1>;
      default:
        return <h1>Page not found</h1>;
    }
  };

  return (
    <div className="min-h-screen w-screen">
      <div className="h-full w-full flex">
        <div className="w-fit h-full">
          <Sider width={220} className="bg-white h-screen">
            <div className="text-center py-6 text-xl font-semibold text-black">
              🎯 Admin Panel
            </div>
            <Menu
              mode="inline"
              defaultSelectedKeys={["dashboard"]}
              style={{ height: "100%" }}
              onClick={({ key }) => setSelectedPage(key)}
              items={[
                {
                  key: "dashboard",
                  icon: <DashboardOutlined />,
                  label: "Dashboard",
                },
                {
                  key: "users",
                  icon: <FieldTimeOutlined />,
                  label: "Quản lý sân",
                },
                {
                  key: "courts",
                  icon: <UserOutlined />,
                  label: "Người dùng",
                },
                {
                  key: "revenue",
                  icon: <BarChartOutlined />,
                  label: "Doanh thu",
                },
                {
                  key: "reviews",
                  icon: <MessageOutlined />,
                  label: "Đánh giá",
                },
              ]}
            />
          </Sider>
        </div>

        <div className="min-h-screen w-full bg-gray-50">
          <Content className="p-4">{renderContent()}</Content>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
