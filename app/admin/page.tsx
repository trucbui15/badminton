"use client";

import { useState } from "react";
import { Layout, Menu, Table, Tag, Space } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  FieldTimeOutlined,
  BarChartOutlined,
  MessageOutlined,
} from "@ant-design/icons";

const { Sider, Content } = Layout;

interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
  tags: string[];
}

const data: DataType[] = [
  {
    key: "1",
    name: "John Brown",
    age: 32,
    address: "New York No. 1 Lake Park",
    tags: ["nice", "developer"],
  },
  {
    key: "2",
    name: "Jim Green",
    age: 42,
    address: "London No. 1 Lake Park",
    tags: ["loser"],
  },
  {
    key: "3",
    name: "Joe Black",
    age: 32,
    address: "Sydney No. 1 Lake Park",
    tags: ["cool", "teacher"],
  },
  {
    key: "4",
    name: "Joe Black",
    age: 32,
    address: "Sydney No. 1 Lake Park",
    tags: ["cool", "teacher"],
  },
  {
    key: "5",
    name: "Joe Black",
    age: 32,
    address: "Sydney No. 1 Lake Park",
    tags: ["cool", "teacher"],
  },
  {
    key: "6",
    name: "Joe Black",
    age: 32,
    address: "Sydney No. 1 Lake Park",
    tags: ["cool", "teacher"],
  },
  {
    key: "7",
    name: "Joe Black",
    age: 32,
    address: "Sydney No. 1 Lake Park",
    tags: ["cool", "teacher"],
  },
  {
    key: "8",
    name: "Joe Black",
    age: 32,
    address: "Sydney No. 1 Lake Park",
    tags: ["cool", "teacher"],
  },
  {
    key: "9",
    name: "Joe Black",
    age: 32,
    address: "Sydney No. 1 Lake Park",
    tags: ["cool", "teacher"],
  },
  {
    key: "10",
    name: "Joe Black",
    age: 32,
    address: "Sydney No. 1 Lake Park",
    tags: ["cool", "teacher"],
  },
  {
    key: "11",
    name: "Joe Black",
    age: 32,
    address: "Sydney No. 1 Lake Park",
    tags: ["cool", "teacher"],
  },
  
  
];

const AdminPage = () => {
  const [selectedPage, setSelectedPage] = useState("dashboard");

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <a>{text}</a>,
    },
    {
      title: "Age",
      dataIndex: "age",
      key: "age",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Tags",
      key: "tags",
      dataIndex: "tags",
      render: (_: any, { tags }: { tags: string[] }) => (
        <>
          {tags.map((tag) => {
            let color = tag.length > 5 ? "geekblue" : "green";
            if (tag === "loser") color = "volcano";
            return (
              <Tag color={color} key={tag}>
                {tag.toUpperCase()}
              </Tag>
            );
          })}
        </>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: DataType) => (
        <Space size="middle">
          <a>Invite {record.name}</a>
          <a>Delete</a>
        </Space>
      ),
    },
  ];

  const renderContent = () => {
    switch (selectedPage) {
      case "dashboard":
        return <h1 className="text-2xl font-bold">🏠 Dashboard</h1>;
      case "users":
        return (
          <>
            <h1 className="text-2xl font-bold mb-4">👥 Quản lý người dùng</h1>
            <Table columns={columns} dataSource={data} />
          </>
        );
      case "courts":
        return <h1 className="text-2xl font-bold">🛠️ Quản lý sân</h1>;
      case "revenue":
        return <h1 className="text-2xl font-bold">💰 Doanh thu</h1>;
      case "reviews":
        return <h1 className="text-2xl font-bold">⭐ Đánh giá & phản hồi</h1>;
      default:
        return <h1>Page not found</h1>;
    }
  };

  return (
    <div className="min-h-screen w-screen  ">
      <div className="h-full w-full flex">
        <div className="w-fit h-full">
        <Sider width={220} className="bg-white h-screen ">
          <div className="text-center py-6 text-xl font-semibold text-white">
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
              { key: "users", icon: <UserOutlined />, label: "Người dùng" },
              {
                key: "courts",
                icon: <FieldTimeOutlined />,
                label: "Quản lý sân",
              },
              {
                key: "revenue",
                icon: <BarChartOutlined />,
                label: "Doanh thu",
              },
              { key: "reviews", icon: <MessageOutlined />, label: "Đánh giá" },
            ]}
          />
        </Sider>
        </div>

        <div className="min-h-screen w-full bg-gray-50 ">
          <Content className="p-2  ">{renderContent()}</Content>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
