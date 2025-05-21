"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Button,
  Table,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  Tag,
  Card,
  Row,
  Col,
} from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { db } from "@/app/source/firebaseConfig";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  setDoc,
} from "firebase/firestore";

interface Court {
  id: number;
  name: string;
  image: string;
  price: number;
  type: string;
  firestoreId?: string;
}

const AdminPage = () => {
  const [courts, setCourts] = useState<Court[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);
  const [form] = Form.useForm();

  const fetchCourts = async () => {
    try {
      const snapshot = await getDocs(collection(db, "courts"));
      const courtList = snapshot.docs.map((docSnap) => {
        const data = docSnap.data() as Court;
        return {
          ...data,
          firestoreId: docSnap.id,
          image: data.image.startsWith("/public")
            ? data.image.replace("/public", "")
            : data.image,
        };
      });
      setCourts(courtList);
    } catch (error) {
      console.error("Error fetching courts:", error);
      message.error("Lấy dữ liệu sân thất bại!");
    }
  };

  useEffect(() => {
    fetchCourts();
  }, []);

  const showModal = (court?: Court) => {
    if (court) {
      setEditingCourt(court);
      form.setFieldsValue(court);
    } else {
      setEditingCourt(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingCourt(null);
    form.resetFields();
  };

   const handleSubmit = async (values: Court) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { firestoreId: _firestoreId, ...courtData } = values; // Đổi tên để tránh lỗi eslint

      // Dùng id làm docId để set hoặc update
      const docId = String(courtData.id);

      await setDoc(doc(db, "courts", docId), courtData);

      message.success(editingCourt ? "Cập nhật sân thành công!" : "Thêm sân thành công!");

      fetchCourts();
      handleCancel();
    } catch (error) {
      console.error("Lỗi khi lưu dữ liệu:", error);
      message.error("Lưu dữ liệu thất bại.");
    }
  };

  const handleDelete = async (firestoreId?: string) => {
    if (!firestoreId) return;
    try {
      await deleteDoc(doc(db, "courts", firestoreId));
      message.success("Xóa sân thành công!");
      fetchCourts();
    } catch (error) {
      console.error("Lỗi khi xóa sân:", error);
      message.error("Không thể xóa sân!");
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      render: (url: string) => (
        <Image
          src={url}
          alt="Sân"
          width={80}
          height={80}
          style={{ objectFit: "cover", borderRadius: 6 }}
          unoptimized
        />
      ),
    },
    {
      title: "Tên sân",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Giá (VND)",
      dataIndex: "price",
      key: "price",
      render: (val: number) => val.toLocaleString() + " đ",
    },
    {
      title: "Loại sân",
      dataIndex: "type",
      key: "type",
      render: (type: string) => {
        let color = "blue";
        if (type.toLowerCase().includes("thảm")) color = "green";
        else if (type.toLowerCase().includes("xi măng")) color = "volcano";
        else if (type.toLowerCase().includes("gỗ")) color = "gold";
        return <Tag color={color}>{type.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: unknown, record: Court) => (
        <>
          <Button onClick={() => showModal(record)} type="link">
            Sửa
          </Button>
          <Button danger type="link" onClick={() => handleDelete(record.firestoreId)}>
            Xóa
          </Button>
        </>
      ),
    },
  ];

  return (
    <Card
      bordered={false}
      style={{
        margin: 24,
        borderRadius: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        background: "#f7f9fb",
      }}
      title={
        <div
          style={{
            background: "linear-gradient( #5b8)",
            padding: "12px 24px",
            borderRadius: 8,
            color: "#fff",
            fontWeight: 600,
            fontSize: 20,
          }}
        >
          🏸 Quản lý sân cầu lông
        </div>
      }
    >
      <Row justify="end" style={{ marginBottom: 16 }}>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
            style={{ background: "#52c41a", borderColor: "#52c41a" }}
          >
            Thêm sân mới
          </Button>
        </Col>
      </Row>

      <Table
        dataSource={courts}
        columns={columns}
        rowKey="firestoreId"
        pagination={false}
        bordered
        style={{
          background: "#fff",
          borderRadius: 8,
          overflow: "hidden",
        }}
      />

      <Modal
        open={isModalVisible}
        title={editingCourt ? "🛠️ Cập nhật sân" : "➕ Thêm sân mới"}
        onCancel={handleCancel}
        footer={null}
        centered
        style={{ top: 20 }}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="id" label="ID" rules={[{ required: true, message: "Nhập ID!" }]}>
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="image" label="Đường dẫn ảnh" rules={[{ required: true }]}>
            <Input placeholder="/images/san1.jpg" />
          </Form.Item>
          <Form.Item name="name" label="Tên sân" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="price" label="Giá thuê (VND)" rules={[{ required: true }]}>
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>
          <Form.Item name="type" label="Loại sân" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item style={{ textAlign: "right" }}>
            <Button type="primary" htmlType="submit" style={{ background: "#1890ff" }}>
              {editingCourt ? "Cập nhật" : "Thêm mới"}
            </Button>
            <Button onClick={handleCancel} style={{ marginLeft: 8 }} danger ghost>
              Hủy
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default AdminPage;
