import React, { useRef, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react"; // Import icon cho nút
import HotelHeader from "../../components/hotelDetail/HotelHeader";
import HotelAmenities from "../../components/hotelDetail/HotelAmenities";
import RoomList from "../../components/hotelDetail/RoomList";
import HotelReviews from "../../components/hotelDetail/HotelReviews";
import Header from "../../components/homepage/Header";
import Footer from "../../components/homepage/Footer";
import { getHotelById } from "../../api/hotelApi";

const DetailHotelPage = () => {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  
  // 1. State cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const roomsPerPage = 3; // Giới hạn 3 phòng mỗi trang

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const data = await getHotelById(id);
        setHotel(data);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin khách sạn:", error);
      }
    };

    fetchHotel();
  }, [id]);

  const roomListRef = useRef(null);

  const scrollToRooms = () => {
    if (roomListRef.current) {
      roomListRef.current.scrollIntoView({ behavior: "smooth" });
      roomListRef.current.classList.add("ring-2", "ring-yellow-400", "transition");
      setTimeout(() => {
        roomListRef.current.classList.remove("ring-2", "ring-yellow-400");
      }, 1200);
    }
  };

  // --- LOGIC PHÂN TRANG ---
  
  // Lấy danh sách phòng gốc (nếu chưa có data thì là mảng rỗng)
  const allRooms = hotel?.rooms || [];
  const totalRooms = allRooms.length;
  const totalPages = Math.ceil(totalRooms / roomsPerPage);

  // Tính toán phòng cần hiển thị cho trang hiện tại
  const indexOfLastRoom = currentPage * roomsPerPage;
  const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
  const currentRooms = allRooms.slice(indexOfFirstRoom, indexOfLastRoom);

  // Tạo một object hotel mới (bản sao) chứa list rooms đã được cắt
  // Điều này giúp component RoomList vẫn hoạt động bình thường mà không cần sửa code bên trong nó
  const displayedHotel = hotel ? { ...hotel, rooms: currentRooms } : null;

  // Hàm chuyển trang
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Tùy chọn: Cuộn lại lên đầu danh sách phòng khi chuyển trang
    scrollToRooms(); 
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Truyền hotel gốc vào Header/Amenities vì các phần này không cần phân trang */}
      <HotelHeader hotel={hotel} onSelectRoomClick={scrollToRooms} />
      <HotelAmenities hotel={hotel} />

      {/* Khu vực danh sách phòng */}
      <div ref={roomListRef} className="container mx-auto px-4 py-8">
        {/* Truyền displayedHotel (đã cắt rooms) vào RoomList */}
        <RoomList hotel={displayedHotel} />

        {/* --- GIAO DIỆN PHÂN TRANG --- */}
        {totalRooms > roomsPerPage && (
          <div className="flex justify-center items-center mt-6 gap-2">
            {/* Nút Previous */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-full border ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-blue-600 hover:bg-blue-50 border-blue-200"
              }`}
            >
              <ChevronLeft size={20} />
            </button>

            {/* Các nút số trang */}
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                  currentPage === index + 1
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {index + 1}
              </button>
            ))}

            {/* Nút Next */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-full border ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-blue-600 hover:bg-blue-50 border-blue-200"
              }`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      <HotelReviews hotel={hotel} />
      <Footer />
    </div>
  );
};

export default DetailHotelPage;