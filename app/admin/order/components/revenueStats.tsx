'use client';

import { DollarOutlined, CheckCircleOutlined } from '@ant-design/icons';
import React from 'react';

interface RevenueStatsProps {
  revenueStats: {
    totalRevenue: number;
    paidCount: number;
  };
  totalBookings: number;
}

const RevenueStats: React.FC<RevenueStatsProps> = ({ revenueStats, totalBookings }) => {
  return (
    <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center">
          <DollarOutlined className="text-xl sm:text-2xl text-green-500 mr-2" />
          <div>
            <h3 className="text-base sm:text-lg font-semibold">Tổng doanh thu</h3>
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
            <h3 className="text-base sm:text-lg font-semibold">Đặt sân đã thanh toán</h3>
            <p className="text-xl sm:text-2xl font-bold text-blue-600">
              {revenueStats.paidCount} / {totalBookings}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueStats;
