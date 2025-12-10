"use client";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function AdminRoomAdd() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    capacity: 1,
    price: 0,
    quantity: 1,
    description: "",
    status: "available",
    image: "",
    hotelId: "",
  });

  // Map status để hiển thị tiếng Việt
  const statusLabels = {
    available: "Có sẵn",
    occupied: "Đã đặt",
    maintenance: "Bảo trì",
    unavailable: "Không khả dụng",
  };

  const [hotels, setHotels] = useState([]);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

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

  // Xử lý nhập dữ liệu form
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Convert number fields
    if (["capacity", "price", "quantity", "hotelId"].includes(name)) {
      setForm({
        ...form,
        [name]: name === "hotelId" ? value : parseFloat(value) || 0,
      });
    } else {
      setForm({ ...form, [name]: value });
    }
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
    setPreview(URL.createObjectURL(file));
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
      setForm({ ...form, image: res.data.url });
      alert("Upload ảnh thành công!");
      setShowImagePreview(false);
      setPreview("");
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
    setPreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Submit thêm mới phòng
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    // Tên phòng: Không null, bắt đầu bằng ký tự in hoa, nhiều hơn 10 ký tự
    if (!form.name) {
      alert("Tên phòng không được bỏ trống");
      return;
    }
    if (form.name.length <= 10) {
      alert("Tên phòng phải nhiều hơn 10 ký tự");
      return;
    }
    if (!/^[A-Z]/.test(form.name)) {
      alert("Tên phòng phải bắt đầu bằng ký tự in hoa");
      return;
    }

    // Khách sạn: Không null
    if (!form.hotelId) {
      alert("Vui lòng chọn khách sạn");
      return;
    }

    // Số lượng chứa: Không null, lớn hơn 0
    if (form.capacity <= 0) {
      alert("Sức chứa phải lớn hơn 0");
      return;
    }

    // Giá phòng: Không null, lớn hơn 10000
    if (form.price <= 10000) {
      alert("Giá phòng phải lớn hơn 10000 VND");
      return;
    }

    // Số lượng phòng: Không null, lớn hơn hoặc bằng 0
    if (form.quantity < 0) {
      alert("Số lượng phòng phải lớn hơn hoặc bằng 0");
      return;
    }

    // Image: Không null, bắt đầu bằng http
    if (!form.image) {
      alert("Vui lòng upload ảnh phòng");
      return;
    }
    if (!form.image.startsWith("http")) {
      alert("URL ảnh không hợp lệ");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      await axios.post(
        "http://localhost:8080/api/admin/rooms",
        {
          name: form.name,
          capacity: parseInt(form.capacity),
          price: parseFloat(form.price),
          quantity: parseInt(form.quantity),
          description: form.description,
          status: form.status,
          image: form.image,
          hotel: { id: parseInt(form.hotelId) },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Thêm phòng thành công!");
      navigate("/admin/room");
    } catch (err) {
      console.error("Lỗi khi thêm phòng:", err);
      alert(
        "Lỗi khi thêm phòng: " + (err.response?.data?.message || err.message)
      );
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">Thêm mới phòng</h1>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Khách sạn */}
          <div>
            <label className="block text-sm font-medium">Khách sạn *</label>
            <select
              name="hotelId"
              value={form.hotelId}
              onChange={handleChange}
              className="mt-1 w-full border rounded-md p-2"
              required
            >
              <option value="">-- Chọn khách sạn --</option>
              {hotels.map((hotel) => (
                <option key={hotel.id} value={hotel.id}>
                  {hotel.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tên phòng */}
          <div>
            <label className="block text-sm font-medium">
              Tên phòng * (bắt đầu in hoa, tối thiểu 11 ký tự)
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="mt-1 w-full border rounded-md p-2"
              placeholder="vd: Phòng Deluxe Suite, Phòng Standard Plus..."
              required
            />
            {form.name && (
              <p
                className={`text-sm mt-1 ${
                  /^[A-Z]/.test(form.name) && form.name.length > 10
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {form.name.length <= 10
                  ? `Tối thiểu 11 ký tự (hiện có ${form.name.length})`
                  : !/^[A-Z]/.test(form.name)
                  ? "Phải bắt đầu bằng ký tự in hoa"
                  : "✓ Hợp lệ"}
              </p>
            )}
          </div>

          {/* Sức chứa + Giá + Số lượng */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium">
                Sức chứa (người) * (lớn hơn 0)
              </label>
              <input
                type="number"
                name="capacity"
                min={1}
                value={form.capacity}
                onChange={handleChange}
                className="mt-1 w-full border rounded-md p-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">
                Giá/đêm (VND) * (lớn hơn hoặc bằng 10000)
              </label>
              <input
                type="number"
                name="price"
                min={10000}
                step={1000}
                value={form.price}
                onChange={handleChange}
                className="mt-1 w-full border rounded-md p-2"
                placeholder="10000"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">
                Số lượng phòng * (≥0)
              </label>
              <input
                type="number"
                name="quantity"
                min={0}
                value={form.quantity}
                onChange={handleChange}
                className="mt-1 w-full border rounded-md p-2"
                required
              />
            </div>
          </div>

          {/* Trạng thái */}
          <div>
            <label className="block text-sm font-medium">Trạng thái</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="mt-1 w-full border rounded-md p-2"
            >
              <option value="available">Có sẵn</option>
              <option value="occupied">Đã đặt</option>
              <option value="maintenance">Bảo trì</option>
              <option value="unavailable">Không khả dụng</option>
            </select>
          </div>

          {/* Upload ảnh */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Ảnh phòng *
            </label>

            {form.image && (
              <div className="mb-4 flex items-center gap-3">
                <img
                  src={form.image}
                  alt="Room"
                  className="w-32 h-24 object-cover rounded border"
                />
                <div>
                  <p className="text-sm text-slate-600 font-medium">
                    Ảnh đã upload
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ ...form, image: "" });
                      setPreview("");
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
              <p className="text-blue-600 mt-2 text-sm">Đang upload ảnh...</p>
            )}
          </div>

          {/* Image Preview Modal */}
          {showImagePreview && preview && (
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
                      src={preview}
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

          {/* Mô tả */}
          <div>
            <label className="block text-sm font-medium">Mô tả phòng</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="mt-1 w-full border rounded-md p-2"
              rows={4}
              placeholder="Mô tả chi tiết về phòng..."
            ></textarea>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 mt-6 pt-4 border-t">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || uploading}
            >
              {loading ? "Đang thêm..." : "Thêm mới"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin/room")}
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
