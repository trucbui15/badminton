'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getDocs, collection } from 'firebase/firestore';
import { db } from "@/app/source/firebaseConfig";
import { Table } from 'antd';

export default function DashboardPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [data, setData] = useState<any[]>([]); // Dữ liệu doanh thu theo ngày, tuần, tháng
  const [totalAmount, setTotalAmount] = useState(0); // Tổng tiền

  useEffect(() => {
    const fetchOrders = async () => {
      const snapshot = await getDocs(collection(db, 'bookings'));
      const rawData = snapshot.docs.map((doc) => doc.data());
      setOrders(rawData);
    };

    fetchOrders();
  }, []);

  // Tính toán doanh thu theo ngày, tuần, tháng
  useEffect(() => {
    if (orders.length > 0) {
      const revenueByDay: { [key: string]: number } = {};
      const revenueByWeek: { [key: string]: number } = {};
      const revenueByMonth: { [key: string]: number } = {};

      orders.forEach((order) => {
        if (!order.createdAt || !order.total) return;

        const date = new Date(order.createdAt.seconds * 1000); // Firestore timestamp to Date
        const day = date.toISOString().split('T')[0]; // Format as "YYYY-MM-DD"
        const weekNumber = getWeekNumber(date); // Get week number
        const year = date.getFullYear();
        const weekKey = `Week ${weekNumber}, ${year}`;
        const month = date.toLocaleString('default', { month: 'short', year: 'numeric' });

        // Update daily revenue
        if (!revenueByDay[day]) revenueByDay[day] = 0;
        revenueByDay[day] += order.total;

        // Update weekly revenue
        if (!revenueByWeek[weekKey]) revenueByWeek[weekKey] = 0;
        revenueByWeek[weekKey] += order.total;

        // Update monthly revenue
        if (!revenueByMonth[month]) revenueByMonth[month] = 0;
        revenueByMonth[month] += order.total;
      });

      // Prepare revenue data for all three periods
      const dailyRevenue = Object.keys(revenueByDay).map((day) => ({
        period: day,
        revenue: revenueByDay[day],
        type: 'Daily',
      }));

      const weeklyRevenue = Object.keys(revenueByWeek).map((week) => ({
        period: week,
        revenue: revenueByWeek[week],
        type: 'Weekly',
      }));

      const monthlyRevenue = Object.keys(revenueByMonth).map((month) => ({
        period: month,
        revenue: revenueByMonth[month],
        type: 'Monthly',
      }));

      // Combine all revenue data and sort by period (you can modify this sort logic to order the periods)
      const revenueData = [...dailyRevenue, ...weeklyRevenue, ...monthlyRevenue].sort((a, b) => {
        return new Date(a.period) > new Date(b.period) ? 1 : -1;
      });

      setData(revenueData);

      // Calculate total revenue across all orders
      const total = orders.reduce((sum, order) => sum + (order.total || 0), 0);
      setTotalAmount(total);
    }
  }, [orders]);

  // Helper function to get the week number
  function getWeekNumber(date: Date) {
    const startDate = new Date(date.getFullYear(), 0, 1);
    const diff = date.getTime() - startDate.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    return Math.ceil((dayOfYear + 1) / 7);
  }

  // Định nghĩa cột bảng cho Ant Design
  const columns = [
    { title: 'Tháng', dataIndex: 'period', key: 'period' }, // Updated to 'period'
    { title: 'Doanh thu', dataIndex: 'revenue', key: 'revenue', render: (text: number) => text.toLocaleString() + ' VND' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Biểu đồ và bảng doanh thu</h1>

      {/* Biểu đồ doanh thu */}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" /> {/* Changed from 'month' to 'period' */}
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>

      {/* Bảng doanh thu */}
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        summary={(pageData) => {
          const pageTotalAmount = pageData.reduce(
            (sum, record) => sum + (record.revenue || 0),
            0
          );

          return (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={2} className="text-right font-semibold">
                Tổng tiền (trang hiện tại):
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1} className="font-semibold text-blue-600">
                {pageTotalAmount.toLocaleString()} VND
              </Table.Summary.Cell>
            </Table.Summary.Row>
          );
        }}
      />
      
      {/* Hiển thị tổng tiền toàn bộ dữ liệu */}
      <div className="mt-4 font-semibold text-xl text-blue-600">
        Tổng tiền toàn bộ dữ liệu: {totalAmount.toLocaleString()} VND
      </div>
    </div>
  );
}
