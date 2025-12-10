"use client";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "@/components/admin/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MapPin, Users, DollarSign, Package } from "lucide-react";

export default function AdminRoomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get(`http://localhost:8080/api/admin/rooms/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        console.log("Room Detail:", res.data);
        setRoom(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi load chi tiết room:", err);
        setLoading(false);
      });
  }, [id]);

  const statusColor = (status) => {
    if (!status) return "bg-gray-200 text-gray-700";
    const statusMap = {
      available: "bg-green-100 text-green-700",
      occupied: "bg-amber-100 text-amber-700",
      maintenance: "bg-red-100 text-red-700",
      unavailable: "bg-slate-200 text-slate-700",
    };
    return statusMap[status] || "bg-gray-200 text-gray-700";
  };

  const getStatusLabel = (status) => {
    const labels = {
      available: "Có sẵn",
      occupied: "Đã đặt",
      maintenance: "Bảo trì",
      unavailable: "Không khả dụng",
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Đang tải...
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600">
        Không tìm thấy phòng
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />

      <div className="flex-1 p-8">
        {/* Header with Action Buttons */}
        <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-sm sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button
              className="flex items-center px-3 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl"
              onClick={() => navigate(`/admin/room`)}
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-3xl font-bold">Chi tiết phòng</h1>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/admin/room/edit/${id}`)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              Sửa phòng
            </button>
            <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold">
              Xóa phòng
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left: Room Image */}
          <div className="col-span-1">
            <Card>
              <CardContent className="p-0">
                {room.image ? (
                  <img
                    src={room.image}
                    alt={room.name}
                    className="w-full h-64 object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-300 flex items-center justify-center rounded-t-lg">
                    <span className="text-gray-600">Không có ảnh</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Room Details */}
          <div className="col-span-2 space-y-6">
            {/* Card 1: Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{room.name}</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Hotel Info */}
                <div className="flex items-center gap-2">
                  <MapPin size={20} className="text-blue-600" />
                  <div>
                    <p className="text-slate-500 text-sm">Khách sạn</p>
                    <p className="font-medium text-lg">
                      {room.hotel?.name || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Status Badge */}
                <div>
                  <p className="text-slate-500 text-sm mb-2">Trạng thái</p>
                  <span
                    className={`px-4 py-2 rounded-full font-semibold text-sm ${statusColor(
                      room.status
                    )}`}
                  >
                    {getStatusLabel(room.status) || "N/A"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Room Specs */}
            <Card>
              <CardHeader>
                <CardTitle>Thông số phòng</CardTitle>
              </CardHeader>

              <CardContent className="grid grid-cols-2 gap-6">
                {/* Capacity */}
                <div className="flex items-start gap-3">
                  <Users size={24} className="text-purple-600 mt-1" />
                  <div>
                    <p className="text-slate-500 text-sm">Sức chứa</p>
                    <p className="font-semibold text-lg">
                      {room.capacity || 0} người
                    </p>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-start gap-3">
                  <DollarSign size={24} className="text-green-600 mt-1" />
                  <div>
                    <p className="text-slate-500 text-sm">Giá/đêm</p>
                    <p className="font-semibold text-lg">
                      {room.price?.toLocaleString()} VND
                    </p>
                  </div>
                </div>

                {/* Quantity */}
                <div className="flex items-start gap-3">
                  <Package size={24} className="text-orange-600 mt-1" />
                  <div>
                    <p className="text-slate-500 text-sm">Số lượng phòng</p>
                    <p className="font-semibold text-lg">
                      {room.quantity || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 3: Description */}
            <Card>
              <CardHeader>
                <CardTitle>Mô tả</CardTitle>
              </CardHeader>

              <CardContent>
                <p className="text-slate-700 leading-relaxed">
                  {room.description || "Không có mô tả"}
                </p>
              </CardContent>
            </Card>

            {/* Card 4: Hotel Details */}
            {room.hotel && (
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin khách sạn</CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div>
                    <p className="text-slate-500 text-sm">Địa chỉ</p>
                    <p className="font-medium">{room.hotel.address || "N/A"}</p>
                  </div>

                  <div>
                    <p className="text-slate-500 text-sm">Thành phố</p>
                    <p className="font-medium">{room.hotel.city || "N/A"}</p>
                  </div>

                  <div>
                    <p className="text-slate-500 text-sm">Điện thoại</p>
                    <p className="font-medium">{room.hotel.phone || "N/A"}</p>
                  </div>

                  <div>
                    <p className="text-slate-500 text-sm">Đánh giá</p>
                    <p className="font-medium flex items-center gap-1">
                      {"⭐".repeat(room.hotel.rating || 0)} (
                      {room.hotel.rating || 0}/5)
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-500 text-sm">Mô tả ngắn</p>
                    <p className="font-medium">
                      {room.hotel.shortDesc || "N/A"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
