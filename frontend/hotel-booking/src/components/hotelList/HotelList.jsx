import React, { useEffect, useState } from "react";
import HotelCard from "./HotelCard";
import { useParams } from "react-router-dom";
import { getHotels } from "../../api/hotelApi";

const HotelList = ({ filters, searchData }) => {
  const { city } = useParams();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0); // Trang bắt đầu từ 0 (theo Spring Boot)
  const [totalPages, setTotalPages] = useState(0);   // Tổng số trang
  const pageSize = 3; 
  // Khi bộ lọc thay đổi, reset về trang đầu tiên
  useEffect(() => {
    setCurrentPage(0);
  }, [city, filters]); 
  // Gom city từ URL + filters từ props
  // Gọi API mỗi khi trang hoặc bộ lọc thay đổi
  useEffect(() => {
    setLoading(true);
    
    // Gom tất cả tham số
    const queryParams = { 
        ...filters, 
        city, 
        page: currentPage, 
        size: pageSize 
    };

    getHotels(queryParams)
      .then((data) => {
        // Spring Boot Page trả về: { content: [], totalPages: 10, ... }
        setHotels(data.content);
        setTotalPages(data.totalPages);
      })
      .catch((err) => console.error("API error:", err))
      .finally(() => setLoading(false));
      
  }, [city, filters, currentPage]); // Thêm currentPage vào dependency
const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      // Cuộn lên đầu trang khi chuyển trang (trải nghiệm tốt hơn)
      window.scrollTo(0, 0); 
    }
  };
  if (loading) return <p className="text-center my-5">Đang tải dữ liệu...</p>;

  if (hotels.length === 0) {
    return <p className="text-center my-5">Không tìm thấy khách sạn nào.</p>;
  }

 return (
    <>
      <div className="space-y-4">
        {hotels.map((hotel) => (
          <HotelCard key={hotel.id} hotel={hotel} searchData={searchData} />
        ))}
      </div>

      {/* Thanh Phân Trang */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-8 space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className={`px-4 py-2 rounded border ${
              currentPage === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-blue-600 hover:bg-blue-50 border-blue-200"
            }`}
          >
            Trước
          </button>

          <span className="px-4 py-2 text-gray-700 font-medium">
            Trang {currentPage + 1} / {totalPages}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
            className={`px-4 py-2 rounded border ${
              currentPage === totalPages - 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-blue-600 hover:bg-blue-50 border-blue-200"
            }`}
          >
            Sau
          </button>
        </div>
      )}
    </>
  );
};

export default HotelList;
