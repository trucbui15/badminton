// import SideNav from '@/app/ui/dashboard/sidenav';
"use client"
import { Menu } from "antd";
import Sider from "antd/es/layout/Sider";
import {
  DashboardOutlined,
  UserOutlined,
  FieldTimeOutlined,
  BarChartOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";

export function SideBar() {
    const router = useRouter();
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
          onClick={({ key }) => {
            router.push(`/admin/${key}`)
          }}
        items={[
          {
            key: "dashboard",
            icon: <DashboardOutlined />,
            label: "Dashboard",
          },
          {
            key: "order",
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
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64">
        <SideBar />
      </div>
      <div className="flex-grow p-6">{children}</div>
    </div>
  );
}
