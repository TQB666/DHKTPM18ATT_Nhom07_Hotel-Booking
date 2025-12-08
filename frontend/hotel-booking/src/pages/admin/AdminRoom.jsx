"use client";
import Sidebar from "@/components/admin/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  Eye,
  Edit,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ROOMS_PER_PAGE = 5;

export default function AdminRoomPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHotel, setSelectedHotel] = useState("");
  const [rooms, setRooms] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  // Fetch hotels
  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("http://localhost:8080/api/admin/hotels", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setHotels(res.data);
      })
      .catch((err) => console.error("Lỗi load hotels:", err));
  }, []);

  // Fetch rooms
  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get("http://localhost:8080/api/admin/rooms", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        console.log("Room Data:", res.data);
        setRooms(res.data);
        setCurrentPage(1); // Reset to first page when data changes
      })
      .catch((err) => console.error("Lỗi load rooms:", err));
  }, []);

  // Filter rooms based on search term and selected hotel
  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = room.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesHotel =
      !selectedHotel || room.hotel?.id === parseInt(selectedHotel);
    return matchesSearch && matchesHotel;
  });

  // Pagination
  const totalPages = Math.ceil(filteredRooms.length / ROOMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ROOMS_PER_PAGE;
  const endIndex = startIndex + ROOMS_PER_PAGE;
  const currentRooms = filteredRooms.slice(startIndex, endIndex);

  const statusColor = (status) => {
    if (!status) return "bg-gray-200 text-gray-700";
    const statusMap = {
      AVAILABLE: "bg-green-100 text-green-700",
      OCCUPIED: "bg-amber-100 text-amber-700",
      MAINTENANCE: "bg-red-100 text-red-700",
      UNAVAILABLE: "bg-slate-200 text-slate-700",
    };
    return statusMap[status] || "bg-gray-200 text-gray-700";
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />

      <div className="flex-1">
        <div className="bg-white border-b border-slate-200 sticky top-0 px-8 py-4 z-40">
          <h1 className="text-3xl font-bold">Quản lý phòng</h1>
        </div>

        <div className="p-8">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center flex-wrap gap-4">
                <CardTitle>Danh sách phòng</CardTitle>

                <div className="flex gap-4 items-center flex-wrap">
                  {/* Hotel Filter */}
                  <select
                    value={selectedHotel}
                    onChange={(e) => {
                      setSelectedHotel(e.target.value);
                      setCurrentPage(1); // Reset to first page
                    }}
                    className="px-4 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Tất cả khách sạn</option>
                    {hotels.map((hotel) => (
                      <option key={hotel.id} value={hotel.id}>
                        {hotel.name}
                      </option>
                    ))}
                  </select>

                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500"
                      placeholder="Tìm tên phòng..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1); // Reset to first page
                      }}
                    />
                  </div>

                  {/* Add Button */}
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold whitespace-nowrap">
                    <Plus size={20} />
                    Thêm phòng
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-slate-100">
                      <th className="p-3 text-left">ID</th>
                      <th className="p-3 text-left">Tên phòng</th>
                      <th className="p-3 text-left">Khách sạn</th>
                      <th className="p-3 text-left">Giá/đêm</th>
                      <th className="p-3 text-left">Sức chứa</th>
                      <th className="p-3 text-left">Số lượng</th>
                      <th className="p-3 text-left">Trạng thái</th>
                      <th className="p-3 text-left">Hành động</th>
                    </tr>
                  </thead>

                  <tbody>
                    {currentRooms.length > 0 ? (
                      currentRooms.map((room) => (
                        <tr
                          key={room.id}
                          className="border-b hover:bg-slate-50"
                        >
                          <td className="p-3">#{room.id}</td>
                          <td className="p-3 font-semibold">{room.name}</td>
                          <td className="p-3 text-slate-600">
                            {room.hotel?.name || "N/A"}
                          </td>
                          <td className="p-3 text-slate-700 font-semibold">
                            {room.price?.toLocaleString()} VND
                          </td>
                          <td className="p-3 text-center">
                            {room.capacity ?? 0} người
                          </td>
                          <td className="p-3 text-center">
                            {room.quantity ?? 0}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-3 py-1 text-xs rounded-full font-semibold ${statusColor(
                                room.status
                              )}`}
                            >
                              {room.status || "N/A"}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  navigate(`/admin/room/${room.id}`)
                                }
                                className="p-2 hover:bg-blue-100 rounded-xl"
                              >
                                <Eye size={20} className="text-blue-600" />
                              </button>
                              <button
                                onClick={() =>
                                  navigate(`/admin/room/edit/${room.id}`)
                                }
                                className="p-2 hover:bg-amber-100 rounded-xl"
                              >
                                <Edit size={20} className="text-amber-600" />
                              </button>
                              <button className="p-2 text-red-600 hover:bg-red-100 rounded-lg">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="8"
                          className="p-6 text-center text-slate-500"
                        >
                          Không có phòng nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredRooms.length > 0 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="text-sm text-slate-600">
                    Hiển thị {startIndex + 1} đến{" "}
                    {Math.min(endIndex, filteredRooms.length)} trong{" "}
                    {filteredRooms.length} phòng
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={18} />
                      Trước
                    </button>

                    <div className="flex items-center gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-10 h-10 rounded-lg font-semibold ${
                              currentPage === page
                                ? "bg-blue-600 text-white"
                                : "border border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            {page}
                          </button>
                        )
                      )}
                    </div>

                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1 px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sau
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
