import React from "react";
import { Link } from "react-router-dom";

const CartSummary = ({ total, item }) => {

  // Kiểm tra nếu tất cả đều UNAVAILABLE
  const allInactive = item?.length > 0 && item.every(i => i.statusHotel === "UNAVAILABLE");

  return (
    <div className="bg-white p-6 shadow-md rounded-2xl border border-gray-200">
      <h3 className="text-lg font-semibold mb-4">Thông tin đặt phòng của bạn</h3>

      <div className="flex justify-between mb-3 text-gray-600">
        <span>Tổng tiền:</span>
        <span className="font-medium text-blue-700">
          {total.toLocaleString("vi-VN")}₫
        </span>
      </div>

      {/* Thông báo nếu tất cả đều UNAVAILABLE */}
      {allInactive && (
        <p className="text-red-600 text-sm mb-3 font-medium">
          Tất cả khách sạn trong giỏ hàng hiện đang ngưng hoạt động. Bạn không thể đặt phòng.
        </p>
      )}

      {allInactive ? (
        <button 
          className="w-full bg-gray-400 text-white py-2 rounded-xl font-medium cursor-not-allowed"
          disabled
        >
          Tiến hành đặt phòng
        </button>
      ) : (
        <Link 
          className="w-full bg-blue-600 text-white py-2 rounded-xl font-medium hover:bg-blue-700 transition"
          to={`/checkout`}
        >
          Tiến hành đặt phòng
        </Link>
      )}
    </div>
  );
};

export default CartSummary;
