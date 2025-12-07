"use client";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

export default function EditHotel() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // 🟦 Tải dữ liệu khách sạn
  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get(`http://localhost:8080/api/admin/hotels/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setForm({
          name: res.data.name,
          address: res.data.address,
          phone: res.data.phone,
          rating: res.data.rating,
          city: res.data.city,
          shortDesc: res.data.shortDesc,
          detailDesc: res.data.detailDesc,
          image: res.data.image,
        });
        setPreview(res.data.image);
        setLoading(false);
        
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 🟦 Xử lý chọn ảnh → upload lên backend
  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Hiển thị preview trước
    setPreview(URL.createObjectURL(file));

    setUploading(true);

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await axios.post("http://localhost:8080/api/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      // Lưu URL Cloudinary vào form
      setForm({ ...form, image: res.data.url });

    } catch (err) {
      console.error("Upload lỗi", err);
    }

    setUploading(false);
  };

  // 🟦 Gửi form cập nhật
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("token");

    axios
      .put(`http://localhost:8080/api/admin/hotels/${id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setLoading(false);
        navigate("/admin/hotel");
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  if (loading || !form) return <div className="p-8 text-gray-700">Đang tải...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">Sửa khách sạn</h1>

        <form className="space-y-4" onSubmit={handleSubmit}>
          
          {/* Input: Tên */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Tên khách sạn</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          {/* Input: Địa chỉ */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Địa chỉ</label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          {/* Thành phố + Điện thoại */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Thành phố</label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                className="mt-1 w-full border border-gray-300 rounded-md p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Điện thoại</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="mt-1 w-full border border-gray-300 rounded-md p-2"
              />
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Đánh giá (1-5)</label>
            <input
              type="number"
              name="rating"
              min={1}
              max={5}
              value={form.rating}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          {/* Ảnh: Preview + Chọn file */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh đại diện</label>

            {/* IMAGE PREVIEW */}
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="w-40 h-32 object-cover rounded border mb-3"
              />
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="block w-full"
            />

            {uploading && <p className="text-blue-600 mt-1">Đang upload ảnh...</p>}
          </div>

          {/* Mô tả ngắn */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Mô tả ngắn</label>
            <textarea
              name="shortDesc"
              value={form.shortDesc}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-md p-2"
              rows={2}
            ></textarea>
          </div>

          {/* Mô tả chi tiết */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Mô tả chi tiết</label>
            <textarea
              name="detailDesc"
              value={form.detailDesc}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-md p-2"
              rows={4}
            ></textarea>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-4">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              disabled={loading}
            >
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
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
