import { useState, useEffect } from "react";
import { db } from "@/app/source/firebaseConfig";
import { collection, getDocs, addDoc, query, where } from "firebase/firestore";
import { message } from "antd";

export default function BookingPage() {
  const [courts, setCourts] = useState([]);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  // Lấy danh sách sân từ Firestore
  useEffect(() => {
    const fetchCourts = async () => {
      try {
        const courtsCollection = collection(db, "courts");
        const courtsSnapshot = await getDocs(courtsCollection);
        const courtsList = courtsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCourts(courtsList);
      } catch (error) {
        message.error("Lỗi khi tải danh sách sân!");
        console.error(error);
      }
    };
    fetchCourts();
  }, []);

  // Kiểm tra sân trống trước khi đặt
  const checkAvailability = async () => {
    if (!selectedCourt || !date || !time || !name || !email || !phone) {
      message.warning("Vui lòng nhập đầy đủ thông tin!");
      return false;
    }
    const bookingsRef = collection(db, "bookings");
    const q = query(
      bookingsRef,
      where("courtId", "==", selectedCourt),
      where("date", "==", date),
      where("time", "==", time)
    );
    const snapshot = await getDocs(q);
    return snapshot.empty;
  };

  // Xử lý đặt sân
  const handleBooking = async () => {
    setLoading(true);
    message.loading("Đang xử lý đặt sân...");

    const isAvailable = await checkAvailability();
    if (!isAvailable) {
      message.error("Sân đã có người đặt. Vui lòng chọn giờ khác!");
      setLoading(false);
      return;
    }

    await addDoc(collection(db, "bookings"), {
      name,
      email,
      phone,
      courtId: selectedCourt,
      date,
      time,
      status: "Đã đặt"
    });

    message.success("Đặt sân thành công!");
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Đặt sân cầu lông</h2>
      
      <input 
        className="border p-2 w-full mb-2" 
        placeholder="Họ và tên" 
        value={name} 
        onChange={e => setName(e.target.value)} 
      />
      <input 
        className="border p-2 w-full mb-2" 
        placeholder="Email" 
        value={email} 
        onChange={e => setEmail(e.target.value)} 
      />
      <input 
        className="border p-2 w-full mb-2" 
        placeholder="Số điện thoại" 
        value={phone} 
        onChange={e => setPhone(e.target.value)} 
      />
      <input 
        type="date" 
        className="border p-2 w-full mb-2" 
        value={date} 
        onChange={e => setDate(e.target.value)} 
      />

      {/* Chọn Giờ */}
      <select 
        className="border p-2 w-full mb-2" 
        onChange={e => setTime(e.target.value)}
      >
        <option value="">Chọn giờ</option>
        <option value="14:00">14:00</option>
        <option value="15:00">15:00</option>
      </select>

      {/* Chọn Sân */}
      {courts.length === 0 ? (
        <p className="text-gray-500">Chưa có sân nào.</p>
      ) : (
        // <select 
        //   className="border p-2 w-full mb-2" 
        //   onChange={e => {
        //     const selected = courts.find(c => c.id === e.target.value);
        //     setSelectedCourt(selected ? selected.id : null);
        //   }}
        // >
        //   <option value="">Chọn sân</option>
        //   {courts.map(court => (
        //     <option key={court.id} value={court.id}>
        //       {court.name} ({court.type})
        //     </option>
        //   ))}
        // </select>
      )}

      {/* Nút đặt sân */}
      <button 
        className={`bg-blue-500 text-white px-4 py-2 rounded w-full ${loading ? "opacity-50 cursor-not-allowed" : ""}`} 
        onClick={handleBooking}
        disabled={loading}
      >
        {loading ? "Đang đặt sân..." : "Đặt sân"}
      </button>
    </div>
  );
}
