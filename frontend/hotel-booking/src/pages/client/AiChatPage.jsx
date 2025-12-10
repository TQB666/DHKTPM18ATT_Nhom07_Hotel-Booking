"use client";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Send, Loader, MessageCircle } from "lucide-react";
import Header from "@/components/homepage/Header";
import Footer from "@/components/homepage/Footer";

export default function AiChatPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Xin chào! 👋 Tôi là trợ lý AI của ứng dụng đặt phòng khách sạn. Tôi có thể giúp bạn tìm kiếm khách sạn, phòng, và trả lời các câu hỏi về dịch vụ. Hãy hỏi tôi bất cứ điều gì!",
      sender: "ai",
      timestamp: new Date(),
      hotels: [],
      rooms: [],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:8080/api/ai/chat",
        {
          message: input,
          context: "hotel-booking",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Add AI response
      const aiMessage = {
        id: messages.length + 2,
        text: response.data.response,
        sender: "ai",
        timestamp: new Date(),
        hotels: response.data.hotelSuggestions || [],
        rooms: response.data.roomSuggestions || [],
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage = {
        id: messages.length + 2,
        text: "Xin lỗi, đã xảy ra lỗi khi xử lý câu hỏi của bạn. Vui lòng thử lại.",
        sender: "ai",
        timestamp: new Date(),
        hotels: [],
        rooms: [],
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <Header />

      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg h-[600px] flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg flex items-center gap-3">
            <MessageCircle size={28} />
            <div>
              <h1 className="text-2xl font-bold">AI Trợ Lý Đặt Phòng</h1>
              <p className="text-blue-100 text-sm">
                Hỏi tôi bất cứ điều gì về khách sạn và phòng
              </p>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-white to-blue-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-2xl ${
                    message.sender === "user"
                      ? "bg-blue-600 text-white rounded-bl-lg rounded-br-none"
                      : "bg-gray-100 text-gray-900 rounded-br-lg rounded-bl-none"
                  } rounded-lg px-4 py-3 shadow-md`}
                >
                  <p className="text-sm leading-relaxed mb-2">{message.text}</p>
                  <p
                    className={`text-xs ${
                      message.sender === "user"
                        ? "text-blue-100"
                        : "text-gray-500"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>

                  {/* Hotel Suggestions */}
                  {message.hotels && message.hotels.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p
                        className={`text-xs font-semibold mb-2 ${
                          message.sender === "user"
                            ? "text-blue-200"
                            : "text-gray-700"
                        }`}
                      >
                        📍 Gợi ý khách sạn:
                      </p>
                      <div className="space-y-2">
                        {message.hotels.map((hotel) => (
                          <div
                            key={hotel.id}
                            className={`p-2 rounded ${
                              message.sender === "user"
                                ? "bg-blue-500 bg-opacity-30"
                                : "bg-yellow-50"
                            }`}
                          >
                            <p className="font-medium text-sm">
                              {hotel.name} ⭐ {hotel.rating}
                            </p>
                            <p className="text-xs text-gray-600">
                              {hotel.city} - {hotel.address}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Room Suggestions */}
                  {message.rooms && message.rooms.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p
                        className={`text-xs font-semibold mb-2 ${
                          message.sender === "user"
                            ? "text-blue-200"
                            : "text-gray-700"
                        }`}
                      >
                        🛏️ Gợi ý phòng:
                      </p>
                      <div className="space-y-2">
                        {message.rooms.map((room) => (
                          <div
                            key={room.id}
                            className={`p-2 rounded ${
                              message.sender === "user"
                                ? "bg-blue-500 bg-opacity-30"
                                : "bg-green-50"
                            }`}
                          >
                            <p className="font-medium text-sm">
                              {room.name} - {room.capacity} người
                            </p>
                            <p className="text-xs text-gray-600">
                              {Number(room.price).toLocaleString("vi-VN")}{" "}
                              VND/đêm
                            </p>
                            <p className="text-xs text-gray-500">
                              Còn {room.quantity} phòng
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg rounded-bl-none px-4 py-3 flex items-center gap-2">
                  <Loader size={20} className="animate-spin text-gray-600" />
                  <span className="text-sm text-gray-600">Đang xử lý...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <div className="border-t border-gray-200 bg-white px-6 py-4 rounded-b-lg">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập câu hỏi của bạn... (vd: Tìm phòng 2 người rẻ ở Hà Nội)"
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? (
                  <>
                    <Loader size={20} className="animate-spin" />
                    Gửi
                  </>
                ) : (
                  <>
                    <Send size={20} />
                    Gửi
                  </>
                )}
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-2">
              💡 Gợi ý: Hỏi về khách sạn, phòng, giá cả, vị trí, hoặc dịch vụ
            </p>
          </div>
        </div>

        {/* Quick Suggestions */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold text-gray-800 mb-4">
            📝 Câu hỏi gợi ý:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              "Tìm khách sạn ở Hà Nội với giá rẻ",
              "Phòng 2 người có sẵn không?",
              "Khách sạn 5 sao ở Hồ Chí Minh",
              "Phòng thoải mái cho gia đình 4 người",
            ].map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  setInput(suggestion);
                  setTimeout(() => inputRef.current?.focus(), 0);
                }}
                className="text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-sm text-gray-700 hover:text-gray-900 transition"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
