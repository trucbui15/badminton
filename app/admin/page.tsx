"use client";

import { useState, useEffect } from "react";
import { Layout, Menu, Table, Statistic, Row, Col } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  FieldTimeOutlined,
  BarChartOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/app/source/firebaseConfig"; 
import moment from "moment";

const { Sider, Content } = Layout;

const AdminPage = () => {
  const [selectedPage, setSelectedPage] = useState("dashboard");
  const [bookings, setBookings] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any>({});

  useEffect(() => {
    const fetchBookings = async () => {
      if (selectedPage !== "users" && selectedPage !== "revenue") return;

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

    fetchBookings();
  }, [selectedPage]);

  useEffect(() => {
    const calculateRevenue = () => {
      const revenueByDay: any = {};
      const revenueByWeek: any = {};
      const revenueByMonth: any = {};
      const revenueByYear: any = {};

      bookings.forEach((booking: any) => {
        const totalPrice = booking.totalPrice;
        const date = moment(booking.date); // Assuming 'date' is stored in a proper date format
        
        const dayKey = date.format("YYYY-MM-DD");
        const weekKey = date.format("YYYY-wo");
        const monthKey = date.format("YYYY-MM");
        const yearKey = date.format("YYYY");

        // Grouping total revenue by day, week, month, and year
        revenueByDay[dayKey] = (revenueByDay[dayKey] || 0) + totalPrice;
        revenueByWeek[weekKey] = (revenueByWeek[weekKey] || 0) + totalPrice;
        revenueByMonth[monthKey] = (revenueByMonth[monthKey] || 0) + totalPrice;
        revenueByYear[yearKey] = (revenueByYear[yearKey] || 0) + totalPrice;
      });

      setRevenueData({
        revenueByDay,
        revenueByWeek,
        revenueByMonth,
        revenueByYear,
      });
    };

    if (bookings.length > 0) {
      calculateRevenue();
    }
  }, [bookings]);

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
            <h1 className="text-xl font-bold mb-4"> Quản lý sân</h1>
            <Table columns={columns} dataSource={bookings} />
          </>
        );
      
      case "revenue":
        return (
          <>
            <h1 className="text-2xl font-bold mb-4">💰 Doanh thu</h1>
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="Doanh thu theo ngày"
                  value={revenueData.revenueByDay ? revenueData.revenueByDay[moment().format("YYYY-MM-DD")] : 0}
                  prefix="₫"
                  suffix="VND"
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Doanh thu theo tuần"
                  value={revenueData.revenueByWeek ? revenueData.revenueByWeek[moment().format("YYYY-wo")] : 0}
                  prefix="₫"
                  suffix="VND"
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Doanh thu theo tháng"
                  value={revenueData.revenueByMonth ? revenueData.revenueByMonth[moment().format("YYYY-MM")] : 0}
                  prefix="₫"
                  suffix="VND"
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Doanh thu theo năm"
                  value={revenueData.revenueByYear ? revenueData.revenueByYear[moment().format("YYYY")] : 0}
                  prefix="₫"
                  suffix="VND"
                />
              </Col>
            </Row>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen w-screen">
      <div className="h-full w-full flex">
        <div className="w-fit h-full">
          <Sider width={220} className="bg-white h-screen">
            <div className="flex flex-col items-center py-6 bg-white">
              <img
                src="/images/logo.png"
                alt="Logo"
                className="size-full px-8"
              />
            
            </div>

            <Menu
              className="custom-menu"
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
                  key: "revenue",
                  icon: <BarChartOutlined />,
                  label: "Doanh thu",
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
