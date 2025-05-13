"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, Button, Card } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
} from "firebase/firestore";
import { db } from "@/app/source/firebaseConfig";
import Link from "next/link";
import Image from "next/image";

const Register = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);

    try {
      // Kiểm tra xem email đã tồn tại chưa
      const q = query(
        collection(db, "admins"),
        where("email", "==", values.email)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        alert("Email đã được sử dụng!");
        setLoading(false);
        return;
      }

      const adminsSnapshot = await getDocs(collection(db, "admins"));
      const newId = `admin${adminsSnapshot.size + 1}`; // ví dụ: admin1, admin2, ...

      await setDoc(doc(db, "admins", newId), {
        email: values.email,
        password: values.password,
        createdAt: new Date(),
      });

      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      router.push("/login");
    } catch (error) {
      console.error("Lỗi khi đăng ký:", error);
      alert("Đã xảy ra lỗi khi đăng ký.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex justify-center items-center w-screen h-screen bg-center bg-cover bg-gray-50"
      style={{ backgroundImage: "url('/images/bg123.jpg')" }}
    >
      <Card
        variant="borderless"
        className="w-full max-w-3xl bg-white shadow-md rounded-xl"
      >
        <div className="flex flex-col items-center py-6 bg-white">
          <Image
            src="/images/logo.png"
            alt="Logo"
            width={800}
            height={400}
            className="px-8 object-contain"
            priority
          />
          <h2 className="text-xl font-bold mt-2">Đăng ký tài khoản Admin</h2>
        </div>

        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: "Vui lòng nhập email!" }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Nhập email"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập mật khẩu"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="bg-blue-600 hover:bg-blue-700 uppercase font-bold"
              size="large"
            >
              ĐĂNG KÝ
            </Button>
          </Form.Item>

          <div className="text-center text-sm text-gray-600">
            Đã có tài khoản?{" "}
            <Link href="/login" className="text-blue-500 hover:underline">
              Đăng nhập
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Register;
