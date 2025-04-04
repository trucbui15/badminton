"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, Button, Card, message } from "antd";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = (values: { email: string; password: string }) => {
    setLoading(true);

    // Giả lập kiểm tra tài khoản admin
    if (values.email === "admin@gmail.com" && values.password === "admin123") {
      message.success("Đăng nhập thành công!");
      router.push("/admin");
    } else {
      message.error("Sai email hoặc mật khẩu!");
    }

    setLoading(false);
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <Card title="Admin Login" style={{ width: 400 }}>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item label="Email" name="email" rules={[{ required: true, message: "Vui lòng nhập email!" }]}>
            <Input placeholder="Nhập email" />
          </Form.Item>
          <Form.Item label="Mật khẩu" name="password" rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}>
            <Input.Password placeholder="Nhập mật khẩu" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Đăng nhập
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
