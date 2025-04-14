"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, Button, Card, message, notification } from "antd";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/app/source/firebaseConfig";

const Login = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { email: string; password: string}) => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "admins"),
        where("email","==", values.email),
        where("password", "==", values.password)
      );

      const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          console.log("Đăng nhập thành công");
          notification.open({
            message: 'Notification Title',
            description:
              'A function will be be called after the notification is closed (automatically after the "duration" time of manually).',
            onClose: close,
          });
        
        router.push("/admin");
      }else{
        alert("Sai email hoặc mật khẩu!");
      }
    }catch (error) {
      console.error("Lỗi đăng nhập:", error);
      alert("Đã xảy ra lỗi khi đăng nhập!");
    } finally {
      setLoading(false);
    }
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
