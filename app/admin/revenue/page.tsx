"use client";
import { useState, useEffect } from "react";
import { Button, Table, Modal, Form, Input, InputNumber, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { db } from "@/app/source/firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc
} from "firebase/firestore";

interface Court {
  id: number;
  name: string;
  image: string;
  price: number;
  type: string;
  firestoreId?: string; // Firestore's internal ID
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
        };
      });
      setCourts(courtList);
    } catch (error) {
      console.error("Error fetching courts:", error);
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
    const { firestoreId, ...courtData } = values;
    const docId = String(courtData.id); // dùng id làm document ID

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
      render: (url: string) => <img src={url} alt="Sân" width={80} />,
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
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: any, record: Court) => (
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
    <div>
      <h2 style={{ marginBottom: 16 }}>Quản lý sân cầu lông</h2>
      <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()} style={{ marginBottom: 16 }}>
        Thêm sân mới
      </Button>

      <Table dataSource={courts} columns={columns} rowKey="firestoreId" pagination={false} />

      <Modal
        title={editingCourt ? "Chỉnh sửa sân" : "Thêm sân mới"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="id" label="ID" rules={[{ required: true, message: "Nhập ID!" }]}>
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="image" label="Đường dẫn ảnh" rules={[{ required: true, message: "Nhập link ảnh!" }]}>
            <Input placeholder="/images/san1.jpg" />
          </Form.Item>
          <Form.Item name="name" label="Tên sân" rules={[{ required: true, message: "Nhập tên sân!" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="price" label="Giá thuê (VND)" rules={[{ required: true, message: "Nhập giá!" }]}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="type" label="Loại sân" rules={[{ required: true, message: "Nhập loại sân!" }]}>
            <Input />
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit" type="primary">
              {editingCourt ? "Cập nhật" : "Thêm mới"}
            </Button>
            <Button onClick={handleCancel} style={{ marginLeft: 8 }}>
              Hủy
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminPage;
