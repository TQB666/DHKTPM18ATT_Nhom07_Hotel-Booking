import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const FilterSidebar = ({ onFilter }) => {
  const [name, setName] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [stars, setStars] = useState([]);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const cityURL = params.get("city");

  // Tự động filter khi stars thay đổi
  useEffect(() => {
    handleSearch();
  }, [stars]); // Thêm dependencies

  // Toggle chọn sao
  const toggleStar = (star) => {
    setStars((prev) => {
      const newStars = prev.includes(star) 
        ? prev.filter((s) => s !== star) 
        : [...prev, star];
      return newStars;
    });
  };

  const handleSearch = () => {
    // Gọi onFilter với tất cả filter hiện tại
    onFilter({ name, minPrice, maxPrice, stars, cityURL });
  };

  // Hàm chọn nhanh theo khoảng giá
  const handleQuickPrice = (range) => {
    let newMinPrice = "";
    let newMaxPrice = "";
    
    switch (range) {
      case "500K - 1M":
        newMinPrice = 500000;
        newMaxPrice = 1000000;
        break;
      case "1M - 2M":
        newMinPrice = 1000000;
        newMaxPrice = 2000000;
        break;
      case "2M - 3M":
        newMinPrice = 2000000;
        newMaxPrice = 3000000;
        break;
      case "Trên 3M":
        newMinPrice = 3000000;
        newMaxPrice = ""; // maxPrice để trống nghĩa là >3M
        break;
      default:
        newMinPrice = "";
        newMaxPrice = "";
    }
    
    setMinPrice(newMinPrice);
    setMaxPrice(newMaxPrice);
    
    // Gọi filter ngay sau khi set giá
    setTimeout(() => {
      onFilter({ name, minPrice: newMinPrice, maxPrice: newMaxPrice, stars, cityURL });
    }, 0);
  };

  // Thêm hàm reset
  const handleReset = () => {
    setName("");
    setMinPrice("");
    setMaxPrice("");
    setStars([]);
    onFilter({ name: "", minPrice: "", maxPrice: "", stars: [], cityURL });
  };

  return (
    <div className="space-y-4">
      {/* Tìm theo tên */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h6 className="font-semibold mb-3">🔍 Tìm theo tên</h6>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nhập tên khách sạn"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            className="bg-orange-500 text-white px-5 py-2 rounded-lg font-medium 
                       transition hover:bg-orange-600"
            onClick={handleSearch}
          >
            Tìm
          </button>
        </div>
      </div>

      {/* Lọc theo giá */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h6 className="font-semibold mb-3">$ Giá phòng</h6>
        <div className="flex items-center gap-2 mb-4">
          <input
            type="number"
            placeholder="Từ"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            placeholder="Đến"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {["500K - 1M", "1M - 2M", "2M - 3M", "Trên 3M"].map((price, i) => (
            <button
              key={i}
              className="px-3 py-2 bg-gray-50 hover:bg-blue-100 rounded-lg border 
                         text-gray-700 transition"
              onClick={() => handleQuickPrice(price)}
            >
              {price}
            </button>
          ))}
        </div>
      </div>

      {/* Hạng sao */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h6 className="font-semibold mb-3">⭐ Hạng sao</h6>
        <div className="space-y-1">
          {[5, 4, 3, 2, 1].map((star) => (
            <label key={star} className="flex items-center gap-2 text-sm">
              <input 
                type="checkbox" 
                className="accent-blue-600" 
                checked={stars.includes(star)}
                onChange={() => toggleStar(star)}
              />
              {"⭐".repeat(star)} {star} sao
            </label>
          ))}
        </div>
      </div>

      {/* Tiện ích - có thể tạm bỏ qua nếu chưa cần */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h6 className="font-semibold mb-3">📋 Tiện ích</h6>
        <div className="space-y-1 text-sm">
          {["Phòng gia đình", "Bãi đậu xe", "Hồ bơi", "Đưa đón sân bay"].map(
            (facility, i) => (
              <label key={i} className="flex items-center gap-2">
                <input type="checkbox" className="accent-blue-600" />
                {facility}
              </label>
            )
          )}
        </div>
      </div>

      {/* Nút reset */}
      <button
        onClick={handleReset}
        className="w-full py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition"
      >
        🔄 Xóa bộ lọc
      </button>
    </div>
  );
};

export default FilterSidebar;