"use client";
import Sidebar from "@/components/admin/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Eye, Edit, ToggleLeft, ToggleRight } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminHotelPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [hotels, setHotels] = useState([]);
  const navigate = useNavigate();

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
      .catch((err) => console.error("Lỗi load Hotels:", err));
  }, []);

  const filteredHotels = hotels.filter((hotel) =>
    hotel.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 🔥 Toggle trạng thái khách sạn: ACTIVE ↔ UNAVAILABLE
  const toggleStatus = async (hotel) => {
    const token = localStorage.getItem("token");

    try {
      if (hotel.status === "ACTIVE") {
        // chuyển sang UNAVAILABLE
        await axios.delete(
          `http://localhost:8080/api/admin/hotels/${hotel.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        alert("Khách sạn đã chuyển sang trạng thái UNAVAILABLE!");
      } else {
        // ACTIVE lại
        await axios.put(
          `http://localhost:8080/api/admin/hotels/${hotel.id}/activate`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        alert("Khách sạn đã ACTIVE trở lại!");
      }

      // Cập nhật lại danh sách
      setHotels((prev) =>
        prev.map((h) =>
          h.id === hotel.id
            ? { ...h, status: hotel.status === "ACTIVE" ? "UNAVAILABLE" : "ACTIVE" }
            : h
        )
      );
    } catch (err) {
      console.error("Lỗi toggle hotel:", err);
      alert("Lỗi thay đổi trạng thái!");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />

      <div className="flex-1">
        <div className="bg-white border-b border-slate-200 sticky top-0 px-8 py-4 z-40">
          <h1 className="text-3xl font-bold">Quản lý khách sạn</h1>
        </div>

        <div className="p-8">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Danh sách khách sạn</CardTitle>

                <div className="flex gap-4 items-center">
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500"
                      placeholder="Tìm tên khách sạn..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-slate-100">
                      <th className="p-3 text-left">ID</th>
                      <th className="p-3 text-left">Tên khách sạn</th>
                      <th className="p-3 text-left">Địa chỉ</th>
                      <th className="p-3 text-left">Rating</th>
                      <th className="p-3 text-left">Trạng thái</th>
                      <th className="p-3 text-left">Hành động</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredHotels.length > 0 ? (
                      filteredHotels.map((hotel) => (
                        <tr key={hotel.id} className="border-b hover:bg-slate-50">
                          <td className="p-3">#{hotel.id}</td>

                          <td className="p-3 font-semibold">{hotel.name}</td>

                          <td className="p-3 text-slate-600">
                            {hotel.address || "N/A"}
                          </td>

                          <td className="p-3 text-slate-700 font-semibold">
                            {hotel.rating ?? "N/A"}
                          </td>

                          <td className="p-3">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                hotel.status === "ACTIVE"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {hotel.status === "ACTIVE" ? "Hoạt động" : "Ngừng hoạt động"}
                            </span>
                          </td>

                          <td className="p-3">
                            <div className="flex gap-3">

                              {/* Xem */}
                              <button
                                onClick={() =>
                                  navigate(`/admin/hotel/${hotel.id}`)
                                }
                                className="p-2 hover:bg-blue-100 rounded-xl"
                              >
                                <Eye size={20} className="text-blue-600" />
                              </button>

                              {/* Sửa */}
                              <button
                                onClick={() =>
                                  navigate(`/admin/hotel/edit/${hotel.id}`)
                                }
                                className="p-2 hover:bg-amber-100 rounded-xl"
                              >
                                <Edit size={20} className="text-amber-600" />
                              </button>

                              {/* Toggle ON/OFF */}
                              <button
                                onClick={() => toggleStatus(hotel)}
                                className="p-2 rounded-xl hover:bg-slate-200"
                                title="Bật/Tắt khách sạn"
                              >
                                {hotel.status === "ACTIVE" ? (
                                  <ToggleRight
                                    size={26}
                                    className="text-green-600"
                                  />
                                ) : (
                                  <ToggleLeft
                                    size={26}
                                    className="text-red-600"
                                  />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="6"
                          className="p-6 text-center text-slate-500"
                        >
                          Không có khách sạn nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
