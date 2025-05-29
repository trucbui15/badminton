import React, { useState, useEffect, useRef } from 'react';
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "@/app/source/firebaseConfig";

interface Message {
  id: number;
  content: string;
  isUser: boolean;
  timestamp: string;
}

interface Court {
  id: number;
  name: string;
  price: number;
}

interface Booking {
  courtId: number;
  date: string;
  startTime: string;
  endTime: string;
}

const ChatBotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Lấy giờ phút hiện tại
  const getCurrentTime = (): string => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  // Thêm tin nhắn vào khung chat
  const addMessage = (content: string, isUser: boolean = false) => {
    const newMessage: Message = {
      id: Date.now() + Math.random(),
      content,
      isUser,
      timestamp: getCurrentTime()
    };
    setMessages(prev => [...prev, newMessage]);
    if (!isOpen && !isUser) setHasNewMessage(true);
  };

  // Lấy danh sách sân từ Firestore
  const fetchCourts = async (): Promise<Court[]> => {
    const courtsRef = collection(db, "courts");
    const q = query(courtsRef);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: data.id,
        name: data.name,
        price: data.price
      } as Court;
    });
  };

  // Lấy lịch đặt của một sân trong ngày
  const fetchBookings = async (courtId: number, date: string): Promise<Booking[]> => {
    const bookingsRef = collection(db, "bookings");
    const q = query(bookingsRef);
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map(doc => doc.data() as Booking)
      .filter(b => b.courtId === courtId && b.date === date);
  };

  // Xử lý các action nhanh
  const handleQuickAction = async (action: string) => {
    const actionNames: Record<string, string> = {
      'book': 'Đặt sân ngay',
      'price': 'Xem bảng giá',
      'schedule': 'Kiểm tra lịch sân',
      'contact': 'Thông tin liên hệ',
      'services': 'Dịch vụ khác',
      'chat': 'Chat với nhân viên'
    };
    addMessage(actionNames[action] || action, true);

    if (action === "price") {
      setIsTyping(true);
      const courts = await fetchCourts();
      let msg = "💰 <b>Bảng giá các sân:</b><br>";
      courts.forEach((c) => {
        msg += `• <b>${c.name}</b>: ${c.price?.toLocaleString()}đ/giờ<br>`;
      });
      setTimeout(() => {
        setIsTyping(false);
        addMessage(msg);
      }, 800);
      return;
    }

    if (action === "schedule") {
      setIsTyping(true);
      const courts = await fetchCourts();
      const today = new Date();
      const todayStr = today.toISOString().slice(0, 10);
      let msg = "📅 <b>Lịch trống hôm nay:</b><br>";
      for (const c of courts) {
        // eslint-disable-next-line no-await-in-loop
        const bookings = await fetchBookings(c.id, todayStr);
        msg += `• <b>${c.name}</b>: `;
        if (bookings.length === 0) {
          msg += "<span style='color:green'>Còn trống cả ngày</span><br>";
        } else {
          msg += bookings.map((b) => `${b.startTime}-${b.endTime}`).join(", ") + "<br>";
        }
      }
      setTimeout(() => {
        setIsTyping(false);
        addMessage(msg);
      }, 1200);
      return;
    }

    // Các action mặc định
    const responses: Record<string, string> = {
      'book': "🏸 <strong>Đặt sân cầu lông</strong><br>Vui lòng vào mục đặt sân để thao tác chi tiết hoặc liên hệ nhân viên để được hỗ trợ.",
      'contact': "📞 <strong>Thông tin liên hệ</strong><br><b>Thế Giới Cầu Lông</b><br>📍 Số 8 Trần Phú, P.Bình Định, Tx. An Nhơn<br>📱 Hotline: 0393118322<br>🕐 Giờ mở cửa: 5h - 22h hàng ngày",
      'services': "🔧 <strong>Dịch vụ khác</strong><br>• 🏸 Cho thuê vợt<br>• 🚿 Phòng tắm<br>• 🥤 Nước uống & snack<br>• 🏆 Tổ chức giải đấu<br>• 🎓 Dạy cầu lông<br>• 🚗 Chỗ để xe miễn phí",
      'chat': "💬 <strong>Kết nối nhân viên</strong><br>Đang chuyển sang chat trực tiếp...<br>⏰ Thời gian chờ: 1-2 phút"
    };
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage(responses[action] || "Tôi có thể hỗ trợ bạn:<br>🏸 Đặt sân<br>💰 Xem giá<br>📅 Kiểm tra lịch<br>📞 Liên hệ");
    }, 800);
  };

  // Xử lý gửi tin nhắn
  const sendMessage = async () => {
    if (inputValue.trim() === '') return;
    addMessage(inputValue, true);

    // Tìm từ khóa để trả lời
    const lower = inputValue.toLowerCase();
    if (lower.includes("giá") || lower.includes("price")) {
      await handleQuickAction("price");
    } else if (lower.includes("lịch") || lower.includes("trống") || lower.includes("schedule")) {
      await handleQuickAction("schedule");
    } else if (lower.includes("liên hệ") || lower.includes("hotline") || lower.includes("địa chỉ")) {
      await handleQuickAction("contact");
    } else if (lower.includes("dịch vụ")) {
      await handleQuickAction("services");
    } else if (lower.includes("đặt") || lower.includes("book")) {
      await handleQuickAction("book");
    } else if (lower.includes("chat") || lower.includes("nhân viên")) {
      await handleQuickAction("chat");
    } else {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addMessage("Tôi có thể hỗ trợ bạn:<br>🏸 Đặt sân<br>💰 Xem giá<br>📅 Kiểm tra lịch<br>📞 Liên hệ");
      }, 800);
    }
    setInputValue('');
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) setHasNewMessage(false);
  };

  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage = `<strong>Chào mừng bạn đến Thế Giới Cầu Lông!</strong> 🏸<br><br>Tôi có thể hỗ trợ bạn:<br>🏸 Đặt sân<br>💰 Xem giá<br>📅 Kiểm tra lịch<br>📞 Liên hệ<br><br>Bạn cần hỗ trợ gì?`;
      setTimeout(() => addMessage(welcomeMessage), 800);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Widget */}
      {isOpen && (
        <div className="mb-4 w-80 h-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col animate-slide-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white p-3 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-sm">
                🏸
              </div>
              <div>
                <h4 className="font-semibold text-sm">Thế Giới Cầu Lông</h4>
                <p className="text-xs opacity-90">Trợ lý ảo</p>
              </div>
            </div>
            <button 
              onClick={toggleChat}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 bg-gray-50 text-sm">
            {messages.map((message) => (
              <div key={message.id} className="mb-3">
                {message.isUser ? (
                  <div className="flex justify-end">
                    <div className="bg-blue-500 text-white p-2 rounded-2xl rounded-br-md max-w-xs">
                      {message.content}
                      <div className="text-xs mt-1 opacity-80">{message.timestamp}</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-start">
                    <div className="bg-white p-2 rounded-2xl rounded-bl-md shadow-sm max-w-xs">
                      <div dangerouslySetInnerHTML={{ __html: message.content }} />
                      <div className="text-xs text-gray-500 mt-1">{message.timestamp}</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white p-2 rounded-2xl rounded-bl-md shadow-sm">
                  <div className="text-gray-600 italic text-sm">Đang nhập...</div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="p-2 bg-white border-t border-gray-100">
            <div className="grid grid-cols-3 gap-1 mb-2">
              <button
                onClick={() => handleQuickAction('book')}
                className="bg-green-100 text-green-700 p-1.5 rounded-lg text-xs hover:bg-green-200 transition-colors"
              >
                🏸 Đặt sân
              </button>
              <button
                onClick={() => handleQuickAction('price')}
                className="bg-blue-100 text-blue-700 p-1.5 rounded-lg text-xs hover:bg-blue-200 transition-colors"
              >
                💰 Giá
              </button>
              <button
                onClick={() => handleQuickAction('schedule')}
                className="bg-purple-100 text-purple-700 p-1.5 rounded-lg text-xs hover:bg-purple-200 transition-colors"
              >
                📅 Lịch
              </button>
            </div>
            
            {/* Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Nhập tin nhắn..."
                className="flex-1 p-2 border border-gray-200 rounded-full text-sm outline-none focus:border-blue-500"
              />
              <button
                onClick={sendMessage}
                className="w-8 h-8 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors flex items-center justify-center text-sm"
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Button */}
{!isOpen && (
  <button
    onClick={toggleChat}
    className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white text-xl transition-all duration-300 hover:scale-110 bg-gradient-to-r from-blue-500 to-green-500"
    style={{ position: 'relative' }}
  >
    💬
    {hasNewMessage && (
      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
      </div>
    )}
  </button>
)}
      <style jsx>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ChatBotWidget;