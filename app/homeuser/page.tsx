'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from "@/app/source/firebaseConfig";
import { Card, Image, Modal, Button, Typography } from 'antd';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;

interface Court {
  key: string;
  id: string;
  courtNumber: string;
  type: string;
  imageUrl: string;
  price: number;
  playTime: string;
  goldenHourPrice: number;
  goldenHour: { start: string; end: string };
}

export default function HomeUser() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [userName, setUserName] = useState<string | null>(null);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const router = useRouter(); // ✅ Sử dụng router để chuyển hướng

  useEffect(() => {
    const fetchCourts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "courts"));
        const courtsData: Court[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            key: doc.id,
            id: doc.id,
            courtNumber: data.courtNumber || "N/A",
            type: data.type || "Unknown",
            imageUrl: data.imageUrl || "https://via.placeholder.com/150",
            price: data.price || 0,
            goldenHourPrice: data.goldenHourPrice || data.price,
            playTime: data.playTime || "N/A",
            goldenHour: data.goldenHour || { start: "18:00", end: "20:00" },
          };
        });
        setCourts(courtsData);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu sân:", error);
      }
    };

    const fetchUser = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          setUserName(userData.name);
        }
      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu người dùng:', error);
      }
    };

    fetchCourts();
    fetchUser();
  }, []);

  // ✅ Chuyển hướng khi nhấn vào nút "Đặt sân"
  const handleNavigate = (courtId: string) => {
    router.push(`/court/${courtId}`); // Chuyển hướng tới trang chi tiết sân
  };

  // ✅ Hiển thị Modal
  const showModal = (court: Court) => {
    setSelectedCourt(court);
    setIsModalVisible(true);
  };

  // ✅ Đóng Modal
  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedCourt(null);
  };

  return (
    <div className="p-6">
      {/* <div className="flex justify-between items-center mb-6">
        <Title level={2}>🏸 Danh sách sân cầu lông</Title>
        {userName && <Text strong>👤 {userName}</Text>}
      </div> */}

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {courts.map(court => (
          <Card
            key={court.id}
            hoverable
            cover={<Image alt="Sân cầu lông" src={court.imageUrl} className="h-40 object-cover" />}
            onClick={() => showModal(court)}
          >
            <Title level={4}>{court.type}</Title>
            <Text>Số sân: {court.courtNumber}</Text>
            <p className="text-green-600 font-semibold">{court.price.toLocaleString()} VND</p>
          </Card>
        ))}
      </div>

      {selectedCourt && (
        <Modal
          title={`Chi tiết sân: ${selectedCourt.type}`}
          open={isModalVisible}
          onCancel={closeModal}
          footer={[
            <Button key="cancel" onClick={closeModal}>
              Đóng
            </Button>,
            <Button key="book" type="primary" onClick={() => handleNavigate(selectedCourt.id)}>
              Đặt sân
            </Button>
          ]}
        >
          <Image src={selectedCourt.imageUrl} alt="Sân cầu lông" className="mb-4 rounded-lg" />
          <p><strong>ID Sân:</strong> {selectedCourt.id}</p>
          <p><strong>Loại sân:</strong> {selectedCourt.type}</p>
          <p><strong>Số sân:</strong> {selectedCourt.courtNumber}</p>
          <p><strong>Thời gian chơi:</strong> {selectedCourt.playTime}</p>
        </Modal>
      )}
    </div>
  );
}
