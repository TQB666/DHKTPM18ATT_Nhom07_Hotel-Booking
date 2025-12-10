import React, { useState, useEffect } from "react";
import Header from "../../components/homepage/Header";
import Footer from "../../components/homepage/Footer";
import cartApi from "../../api/cartApi";
import bookingApi from "../../api/bookingApi";
import { useNavigate } from "react-router-dom";

const CheckoutPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [activeItems, setActiveItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Lấy giỏ hàng
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const data = await cartApi.getCart();
        setCartItems(data);

        // Lọc khách sạn còn hoạt động
        const onlyActive = data.filter(
          (item) => item.statusHotel === "ACTIVE"
        );
        setActiveItems(onlyActive);

        // Tính tổng theo khách sạn hoạt động
        const totalPrice = onlyActive.reduce((sum, item) => {
          const checkIn = new Date(item.checkIn);
          const checkOut = new Date(item.checkOut);
          const diffDays = Math.max(
            1,
            Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))
          );
          return sum + item.price * item.quantity * diffDays;
        }, 0);

        setTotal(totalPrice);
      } catch (err) {
        console.error("❌ Lỗi khi tải giỏ hàng:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  // Không còn khách sạn hoạt động
  const noActiveHotel = activeItems.length === 0;

  // Cập nhật form input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Gửi yêu cầu đặt phòng
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (noActiveHotel) {
      alert("❗Không có khách sạn nào còn hoạt động để đặt phòng.");
      return;
    }

    try {
      const payload = {
        ...formData,
        cartItemIds: activeItems.map((item) => item.id),
        totalPrice: total,
      };

      await bookingApi.checkout(payload);
      alert("Đặt phòng thành công 🎉");
      navigate("/booking-success");
    } catch (err) {
      console.error("❌ Lỗi khi đặt phòng:", err);
      alert("Đặt phòng thất bại. Vui lòng thử lại.");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Đang tải thông tin đặt phòng...
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-10 grid md:grid-cols-3 gap-6">
        {/* Form thông tin người đặt */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-2xl font-semibold mb-4">
            Thông tin người đặt phòng
          </h2>

          {noActiveHotel && (
            <p className="text-red-600 font-medium mb-4">
              ⚠️ Không có khách sạn nào còn hoạt động. Bạn không thể đặt phòng.
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-600 font-medium mb-1">
                Họ và tên
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-600 font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-600 font-medium mb-1">
                Số điện thoại
              </label>
              <input
                type="tel"
                name="phoneNumber"
                pattern="^0[0-9]{9}$"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                required
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={noActiveHotel}
              className={`mt-6 w-full py-3 rounded-xl font-semibold transition 
                ${
                  noActiveHotel
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
            >
              {noActiveHotel ? "Không thể đặt phòng" : "Xác nhận đặt phòng"}
            </button>
          </form>
        </div>

        {/* Chi tiết đặt phòng */}
        <div className="bg-white p-6 rounded-2xl shadow-md h-fit">
          <h2 className="text-xl font-semibold mb-4">Chi tiết đặt phòng</h2>

          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {cartItems.map((item) => {
              const checkIn = new Date(item.checkIn);
              const checkOut = new Date(item.checkOut);
              const diffDays = Math.max(
                1,
                Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))
              );
              const totalItem = item.price * item.quantity * diffDays;

              return (
                <div
                  key={item.id}
                  className="border-b pb-2 text-sm text-gray-700"
                >
                  <p className="font-medium">{item.roomName}</p>
                  <p>{item.hotelName}</p>
                  <p>
                    {item.quantity} phòng × {diffDays} đêm
                  </p>

                  {item.statusHotel === "ACTIVE" ? (
                    <p className="text-blue-600 font-semibold">
                      {totalItem.toLocaleString("vi-VN")}₫
                    </p>
                  ) : (
                    <p className="text-red-500 text-xs mt-1">
                      ❌ Khách sạn này đã ngưng hoạt động.
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 border-t pt-3 flex justify-between font-semibold text-lg">
            <span>Tổng cộng:</span>
            <span className="text-blue-700">
              {total.toLocaleString("vi-VN")}₫
            </span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CheckoutPage;
