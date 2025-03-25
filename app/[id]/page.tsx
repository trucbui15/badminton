"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/source/firebaseConfig"; 
import { Card, Image, Typography, Spin, Alert } from "antd";

const { Title, Text } = Typography;

export default function CourtDetail() {
  const params = useParams(); 
  const courtId = params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : null; // Đảm bảo lấy đúng ID
  const [court, setCourt] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courtId) return;

    const fetchCourt = async () => {
      try {
        const courtRef = doc(db, "courts", courtId);
        const courtSnap = await getDoc(courtRef);

        if (courtSnap.exists()) {
          const data = courtSnap.data();
          setCourt({
            id: courtSnap.id,
            ...data,
            price: Number(data.price) || 0, 
            goldenHour: data.goldenHour
              ? {
                  start: data.goldenHour.start || "Không xác định",
                  end: data.goldenHour.end || "Không xác định",
                  goldenHourPrice: Number(data.goldenHour.goldenHourPrice) || data.price, 
                }
              : null,
          });
        } else {
          console.warn("Không tìm thấy sân!");
          setCourt(null);
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu sân:", error);
        setCourt(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCourt();
  }, [courtId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!court) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Alert message="Không tìm thấy sân." type="error" showIcon />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Card className="shadow-lg rounded-lg overflow-hidden">
        <Image src={court.imageUrl || "https://via.placeholder.com/500"} alt={court.id} className="w-full h-64 object-cover rounded-lg mb-4" />
        <div className="space-y-3">
          <Title level={2} className="text-center">{court.type}</Title>
          <Text strong>Số sân: </Text><Text>{court.id}</Text>
          <br />
          <Text strong>Giá thuê: </Text><Text className="text-green-600 font-semibold">{court.price.toLocaleString()} VND</Text>
          <br />
          {court.goldenHour ? (
            <>
              <Text strong>Giờ vàng: </Text><Text>{court.goldenHour.start} - {court.goldenHour.end}</Text>
              <br />
              <Text strong>Giá giờ vàng: </Text><Text className="text-orange-500 font-semibold">{court.goldenHour.goldenHourPrice.toLocaleString()} VND</Text>
            </>
          ) : (
            <Text className="text-gray-500">Không có giờ vàng</Text>
          )}
        </div>
      </Card>
    </div>
  );
}
