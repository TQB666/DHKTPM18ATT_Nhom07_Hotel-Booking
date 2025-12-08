"use client";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Sidebar from "@/components/admin/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function AdminRoomEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState({
    name: "",
    capacity: 0,
    price: 0,
    quantity: 0,
    description: "",
    status: "AVAILABLE",
    image: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`http://localhost:8080/api/admin/rooms/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setRoom({
          name: res.data.name,
          capacity: res.data.capacity,
          price: res.data.price,
          quantity: res.data.quantity,
          description: res.data.description,
          status: res.data.status,
          image: res.data.image,
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi load phòng:", err);
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const finalValue =
      name === "capacity" || name === "price" || name === "quantity"
        ? name === "price"
          ? parseFloat(value)
          : parseInt(value)
        : value;

    setRoom((prev) => ({ ...prev, [name]: finalValue }));
  };

  // Upload ảnh → backend → Cloudinary
  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn một file ảnh");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Kích thước ảnh không được vượt quá 5MB");
      return;
    }

    // Hiển thị ảnh preview (không upload ngay)
    setImagePreview(URL.createObjectURL(file));
    setSelectedFile(file);
    setShowImagePreview(true);
  };

  // Thực hiện upload ảnh khi người dùng ấn xác nhận
  const handleConfirmUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const res = await axios.post(
        "http://localhost:8080/api/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Lưu URL Cloudinary vào form
      setRoom({ ...room, image: res.data.url });
      alert("Upload ảnh thành công!");
      setShowImagePreview(false);
      setImagePreview("");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Upload lỗi:", err);
      alert("Lỗi khi upload ảnh");
    }

    setUploading(false);
  };

  const handleCancelImagePreview = () => {
    setShowImagePreview(false);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    const token = localStorage.getItem("token");

    axios
      .put(`http://localhost:8080/api/admin/rooms/${id}`, room, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        console.log("Update response:", res.data);
        alert("Cập nhật phòng thành công");
        navigate(`/admin/room/${id}`);
      })
      .catch((err) => {
        console.error("Lỗi cập nhật phòng:", err.response?.data || err.message);
        alert(
          "Cập nhật thất bại: " + (err.response?.data?.message || err.message)
        );
      })
      .finally(() => setSubmitting(false));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Đang tải...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />

      <div className="flex-1 p-8">
        <div className="flex items-center gap-3 mb-6">
          <button
            className="flex items-center px-3 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-bold">Chỉnh sửa phòng</h1>
        </div>

        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle className="text-2xl">Thông tin cơ bản</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tên phòng */}
              <div>
                <label className="block text-slate-600 font-medium mb-2">
                  Tên phòng
                </label>
                <input
                  type="text"
                  name="name"
                  value={room.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nhập tên phòng"
                  required
                />
              </div>

              {/* Sức chứa */}
              <div>
                <label className="block text-slate-600 font-medium mb-2">
                  Sức chứa (người)
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={room.capacity}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  required
                />
              </div>

              {/* Giá */}
              <div>
                <label className="block text-slate-600 font-medium mb-2">
                  Giá/đêm (VND)
                </label>
                <input
                  type="number"
                  name="price"
                  value={room.price}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="1000"
                  required
                />
              </div>

              {/* Số lượng phòng */}
              <div>
                <label className="block text-slate-600 font-medium mb-2">
                  Số lượng phòng
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={room.quantity}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  required
                />
              </div>

              {/* Trạng thái */}
              <div>
                <label className="block text-slate-600 font-medium mb-2">
                  Trạng thái
                </label>
                <select
                  name="status"
                  value={room.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="AVAILABLE">Có sẵn</option>
                  <option value="OCCUPIED">Đã đặt</option>
                  <option value="MAINTENANCE">Bảo trì</option>
                  <option value="UNAVAILABLE">Không hoạt động</option>
                </select>
              </div>

              {/* Ảnh URL */}
              <div>
                <label className="block text-slate-600 font-medium mb-2">
                  Ảnh phòng
                </label>

                {room.image && (
                  <div className="mb-4 flex items-center gap-3">
                    <img
                      src={room.image}
                      alt="Room"
                      className="w-32 h-24 object-cover rounded border"
                    />
                    <div>
                      <p className="text-sm text-slate-600 font-medium">
                        Ảnh hiện tại
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setRoom({ ...room, image: "" });
                          setImagePreview("");
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                        className="text-sm text-red-600 hover:text-red-700 mt-1"
                      >
                        Xóa ảnh
                      </button>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="block w-full text-sm text-slate-600
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-600
                    hover:file:bg-blue-100"
                  disabled={uploading}
                />

                {uploading && (
                  <p className="text-blue-600 mt-2 text-sm">
                    Đang upload ảnh...
                  </p>
                )}
              </div>

              {/* Mô tả */}
              <div>
                <label className="block text-slate-600 font-medium mb-2">
                  Mô tả
                </label>
                <textarea
                  name="description"
                  value={room.description}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="5"
                  placeholder="Nhập mô tả phòng"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  className="px-6 py-2 bg-slate-300 hover:bg-slate-400 text-slate-800 rounded-lg font-semibold transition"
                  onClick={() => navigate(-1)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {submitting ? "Đang lưu..." : "Lưu phòng"}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Image Preview Modal */}
        {showImagePreview && imagePreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">
                  Xem trước ảnh phòng
                </h3>
                <button
                  onClick={handleCancelImagePreview}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* Body - Preview Image */}
              <div className="px-6 py-8 flex justify-center bg-gray-50">
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-w-sm max-h-96 rounded-lg object-cover"
                  />
                </div>
              </div>

              {/* Footer - Action Buttons */}
              <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
                <button
                  onClick={handleCancelImagePreview}
                  disabled={uploading}
                  className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg font-medium hover:bg-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleConfirmUpload}
                  disabled={uploading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Đang tải...
                    </>
                  ) : (
                    "Xác nhận upload"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
