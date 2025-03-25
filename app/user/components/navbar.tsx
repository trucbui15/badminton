"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MenuOutlined } from "@ant-design/icons";
import { Button, Typography } from "antd";

const { Text } = Typography;

export default function Navbar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  // Kiểm tra thông tin user từ localStorage
  useEffect(() => {
    const userData = localStorage.getItem("userInfo");
    if (userData) {
      const user = JSON.parse(userData);
      setUserName(user.name || "Người dùng");
    }
  }, []);
  

  const handleNavigate = (path: string) => {
    if (path === "/homeuser" && !userName) {
      alert("Vui lòng nhập thông tin trước khi vào Tài khoản!");
      return;
    }

    router.push(path);
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md p-4 z-50 flex justify-between items-center">
      <div className="text-xl font-bold cursor-pointer" onClick={() => handleNavigate("/")}>
        🏸 Badminton Booking
      </div>

      <div className="hidden md:flex gap-6 items-center">
        <Button type="link" onClick={() => handleNavigate("/")}>Trang chủ</Button>
        <Button type="link" onClick={() => handleNavigate("/homeuser")}>
          {userName ? `Tài khoản (${userName})` : "Tài khoản"}
        </Button>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden">
        <MenuOutlined onClick={() => setIsOpen(!isOpen)} className="text-xl cursor-pointer" />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-white shadow-md flex flex-col items-center gap-4 py-4 md:hidden">
          <Button type="link" onClick={() => handleNavigate("/")}>Trang chủ</Button>
          <Button type="link" onClick={() => handleNavigate("/homeuser")}>
            {userName ? `Tài khoản (${userName})` : "Tài khoản"}
          </Button>
        </div>
      )}
    </nav>
  );
}
