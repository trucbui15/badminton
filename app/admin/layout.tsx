"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Spin, Menu } from "antd";
import Sider from "antd/es/layout/Sider";
import {DashboardOutlined,FieldTimeOutlined,BarChartOutlined,} from "@ant-design/icons";

export function SideBar({ onNavigate }: { onNavigate: (key: string) => void }) {
  return (
    <Sider width={220} className="bg-white h-screen">
      <div className="flex flex-col items-center py-6 bg-white">
        <img src="/images/logo.png" alt="Logo" className="size-full px-8" />
      </div>

      <Menu
        className="custom-menu"
        mode="inline"
        defaultSelectedKeys={["dashboard"]}
        style={{ height: "100%" }}
        onClick={({ key }) => onNavigate(key.toString())}
        items={[
          {
            key: "dashboard",
            icon: <DashboardOutlined />,
            label: "Dashboard",
          },
          {
            key: "order",
            icon: <FieldTimeOutlined />,
            label: "Quản lý người dùng",
          },
          {
            key: "revenue",
            icon: <BarChartOutlined />,
            label: "Cập nhật dữ liệu",
          },
        ]}
      />
    </Sider>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleNavigate = (key: string) => {
    startTransition(() => {
      router.push(`/admin/${key}`);
    });
  };

  return (
    <>
      {isPending && (
        <div className="fixed inset-0 z-50 bg-white bg-opacity-70 flex items-center justify-center">
          <Spin size="large" />
        </div>
      )}

      <div className="flex h-screen flex-row md:overflow-hidden">
        <div className="flex-none">
          <SideBar onNavigate={handleNavigate} />
        </div>
        <div className="flex-grow p-6">{children}</div>
      </div>
    </>
  );
}
