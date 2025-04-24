"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, Button, Card } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/app/source/firebaseConfig";

const Login = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "admins"),
        where("email", "==", values.email),
        where("password", "==", values.password)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        console.log("Đăng nhập thành công");
        router.push("/admin");
      } else {
        alert("Sai email hoặc mật khẩu!");
      }
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      alert("Đã xảy ra lỗi khi đăng nhập!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-center bg-gray-50"
    style={{ backgroundImage: "url('/images/sancaulong.jpg')" }}
>
    <Card
      variant="borderless"
      className="w-full max-w-md bg-white shadow-md rounded-xl"
    >
        {/* HoGo Logo and Title */}
        <div className="flex flex-col items-center py-6 bg-white">
          <img src="/images/logo.png" alt="Logo" className="size-full px-8" />
        </div>
        
        <Form
          name="login"
          layout="vertical"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="email"
            rules={[{ required: true, message: "Vui lòng nhập email!" }]}
          >
            <Input
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder="Nhập email của bạn"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Nhập mật khẩu của bạn"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              className="bg-orange-500 hover:bg-orange-600 border-orange-500 uppercase font-bold"
            >
              LOGIN
            </Button>
          </Form.Item>
          
          <div className="flex justify-between text-sm text-gray-500 mb-4">
            <a href="#" className="hover:text-gray-700">Quên mật khẩu?</a>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;