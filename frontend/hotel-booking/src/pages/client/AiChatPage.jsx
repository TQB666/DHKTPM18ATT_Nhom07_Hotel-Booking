"use client";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { 
  Send, Loader, Bot, MapPin, Star, 
  ShoppingCart, ArrowRight, User, Bed // Thêm icon Bed
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/homepage/Header";
import Footer from "@/components/homepage/Footer";

export default function AiChatPage() {
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Xin chào! 👋 Tôi có thể giúp bạn tìm khách sạn ở đâu hôm nay? (Ví dụ: Tìm khách sạn tại Đà Lạt cho 2 người)",
      sender: "ai",
      timestamp: new Date(),
      hotels: [],
      rooms: [], // Khởi tạo mảng rooms rỗng
    },
  ]);
  
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- HÀM CHUYỂN HƯỚNG ---
  const handleViewHotel = (hotelId) => {
    if (hotelId) {
        navigate(`/HotelDetail/${hotelId}`); 
    } else {
        console.error("Không tìm thấy ID khách sạn");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    // 1. Hiển thị tin nhắn user
    const userMsg = { id: Date.now(), text: input, sender: "user", timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    const userInput = input;
    setInput("");
    setLoading(true);

    try {
      // 2. Gọi API
      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:8080/api/ai/chat", 
        { message: userInput },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 3. Hiển thị tin nhắn AI + Dữ liệu khách sạn & PHÒNG
      const aiMsg = {
        id: Date.now() + 1,
        text: res.data.response,
        sender: "ai",
        timestamp: new Date(),
        hotels: res.data.hotelSuggestions || [],
        rooms: res.data.roomSuggestions || [] // Lấy dữ liệu phòng từ API
      };
      setMessages(prev => [...prev, aiMsg]);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now(), 
        text: "Xin lỗi, hệ thống đang bận. Vui lòng thử lại sau.", 
        sender: "ai", 
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 h-[80vh] flex flex-col overflow-hidden">
          
          {/* Header Chat */}
          <div className="bg-blue-600 text-white p-4 flex items-center gap-3 shadow-md">
            <div className="bg-white/20 p-2 rounded-full"><Bot size={24}/></div>
            <div>
              <h1 className="font-bold">Trợ lý đặt phòng ảo</h1>
              <p className="text-xs text-blue-100">Luôn sẵn sàng hỗ trợ</p>
            </div>
          </div>

          {/* Nội dung Chat */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-100">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                
                {/* Bong bóng tin nhắn text */}
                <div className={`max-w-[85%] px-5 py-3 rounded-2xl shadow-sm relative ${
                  msg.sender === "user" 
                    ? "bg-blue-600 text-white rounded-tr-none" 
                    : "bg-white text-gray-800 border border-gray-200 rounded-tl-none"
                }`}>
                  <p className="whitespace-pre-wrap text-sm">{msg.text}</p>
                  <span className="text-[10px] opacity-70 block mt-1 text-right">
                    {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>

                {/* --- PHẦN 1: GỢI Ý KHÁCH SẠN --- */}
                {msg.sender === "ai" && msg.hotels && msg.hotels.length > 0 && (
                  <div className="mt-3 ml-2 w-full max-w-[90%]">
                    <p className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1">
                      <MapPin size={14}/> Gợi ý khách sạn:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {msg.hotels.map((hotel) => (
                        <div key={hotel.id} className="bg-white p-3 rounded-xl border border-gray-200 hover:shadow-lg transition-all group">
                          <div className="mb-2">
                            <h4 className="font-bold text-gray-800 text-sm line-clamp-1 group-hover:text-blue-600">
                              {hotel.name}
                            </h4>
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <MapPin size={10} className="mr-1"/> {hotel.city}
                            </div>
                            <div className="flex items-center mt-1">
                              <span className="text-yellow-500 font-bold text-xs flex items-center">
                                {hotel.rating} <Star size={10} className="fill-current ml-0.5"/>
                              </span>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleViewHotel(hotel.id)}
                            className="w-full bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1 transition-colors"
                          >
                            <ShoppingCart size={14}/> Xem khách sạn
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* --- PHẦN 2: GỢI Ý PHÒNG CỤ THỂ (MỚI THÊM VÀO) --- */}
                {msg.sender === "ai" && msg.rooms && msg.rooms.length > 0 && (
                  <div className="mt-3 ml-2 w-full max-w-[90%] border-t border-gray-200 pt-3">
                    <p className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1">
                       <Bed size={14}/> Phòng phù hợp nhất:
                    </p>
                    <div className="space-y-2">
                        {msg.rooms.map((room) => (
                            <div key={room.id} className="bg-white p-3 rounded-xl border border-green-100 shadow-sm flex justify-between items-center hover:border-green-300 transition-all">
                                {/* Thông tin bên trái */}
                                <div>
                                    <h4 className="font-bold text-gray-800 text-sm">{room.name}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-gray-500 flex items-center bg-gray-100 px-1.5 py-0.5 rounded">
                                            <User size={10} className="mr-1"/> {room.capacity} người
                                        </span>
                                        {/* Nếu có tên khách sạn đi kèm thì hiển thị nhỏ */}
                                        {room.hotel && (
                                            <span className="text-[10px] text-gray-400 line-clamp-1 max-w-[100px]">
                                                @ {room.hotel.name}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Giá và Nút bên phải */}
                                <div className="text-right flex flex-col items-end gap-1">
                                    <span className="text-sm font-bold text-green-600">
                                        {Number(room.price).toLocaleString('vi-VN')}đ
                                    </span>
                                    <button 
                                        // Sử dụng hotelId có trong RoomDTO để chuyển hướng
                                        onClick={() => handleViewHotel(room.hotelId)}
                                        className="bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold py-1.5 px-3 rounded-full flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                                    >
                                        Đặt ngay <ArrowRight size={10}/>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                  </div>
                )}

              </div>
            ))}
            
            {loading && (
              <div className="flex items-center gap-2 text-gray-500 text-sm ml-2">
                <Loader className="animate-spin" size={16}/> AI đang tìm kiếm...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Chat */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập yêu cầu (vd: Tìm phòng Đà Lạt cho 2 người)..."
              disabled={loading}
              className="flex-1 bg-gray-100 px-4 py-3 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              type="submit" 
              disabled={loading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg disabled:opacity-50 transition-all"
            >
              <Send size={20}/>
            </button>
          </form>

        </div>
      </main>
      <Footer />
    </div>
  );
}