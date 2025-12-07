"use client";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AdminHotelAdd() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    rating: 1,
    city: "",
    shortDesc: "",
    detailDesc: "",
    image: "",
  });

  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 🟦 Xử lý nhập dữ liệu form
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🟦 Upload ảnh → backend → Cloudinary
  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Hiển thị ảnh preview
    setPreview(URL.createObjectURL(file));

    setUploading(true);
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("image", file);

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
      setForm({ ...form, image: res.data.url });
    } catch (err) {
      console.error("Upload lỗi:", err);
    }

    setUploading(false);
  };

  // 🟦 Submit thêm mới khách sạn
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        "http://localhost:8080/api/admin/hotels",
        form,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      navigate("/admin/hotel");
    } catch (err) {
      console.error("Lỗi khi thêm khách sạn:", err);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">Thêm mới khách sạn</h1>

        <form className="space-y-4" onSubmit={handleSubmit}>
          
          {/* Tên khách sạn */}
          <div>
            <label className="block text-sm font-medium">Tên khách sạn</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="mt-1 w-full border rounded-md p-2"
              required
            />
          </div>

          {/* Địa chỉ */}
          <div>
            <label className="block text-sm font-medium">Địa chỉ</label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              className="mt-1 w-full border rounded-md p-2"
              required
            />
          </div>

          {/* Thành phố + Điện thoại */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Thành phố</label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                className="mt-1 w-full border rounded-md p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Điện thoại</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="mt-1 w-full border rounded-md p-2"
              />
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium">Đánh giá (1–5)</label>
            <input
              type="number"
              name="rating"
              min={1}
              max={5}
              value={form.rating}
              onChange={handleChange}
              className="mt-1 w-full border rounded-md p-2"
            />
          </div>

          {/* Upload ảnh */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Ảnh đại diện
            </label>

            {preview && (
              <img
                src={preview}
                className="w-40 h-32 object-cover rounded border mb-3"
              />
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="block w-full"
            />

            {uploading && (
              <p className="text-blue-600 mt-1">Đang upload ảnh...</p>
            )}
          </div>

          {/* Mô tả ngắn */}
          <div>
            <label className="block text-sm font-medium">Mô tả ngắn</label>
            <textarea
              name="shortDesc"
              value={form.shortDesc}
              onChange={handleChange}
              className="mt-1 w-full border rounded-md p-2"
              rows={2}
            ></textarea>
          </div>

          {/* Mô tả chi tiết */}
          <div>
            <label className="block text-sm font-medium">Mô tả chi tiết</label>
            <textarea
              name="detailDesc"
              value={form.detailDesc}
              onChange={handleChange}
              className="mt-1 w-full border rounded-md p-2"
              rows={4}
            ></textarea>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-4">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              disabled={loading || uploading}
            >
              {loading ? "Đang thêm..." : "Thêm mới"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin/hotel")}
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
