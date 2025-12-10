"use client";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import { uploadHotelImages, deleteHotelImage } from "@/api/hotelApi";
import { X } from "lucide-react";

export default function EditHotel() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [errors, setErrors] = useState({});

  // Gallery state
  const [galleryImages, setGalleryImages] = useState([]); // ảnh hiện tại của khách sạn
  const [newGalleryFiles, setNewGalleryFiles] = useState([]); // ảnh mới được chọn
  const [uploadingGallery, setUploadingGallery] = useState(false);

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
        // Fetch gallery images
        if (res.data.images && res.data.images.length > 0) {
          setGalleryImages(res.data.images);
        }
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

  // Dropzone handler
  const onDropGallery = (acceptedFiles) => {
    setNewGalleryFiles((prev) => [...prev, ...acceptedFiles]);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: onDropGallery,
    multiple: true,
    accept: { "image/*": [] },
  });

  // Upload ảnh gallery
  const handleUploadGallery = async () => {
    if (newGalleryFiles.length === 0) {
      alert("Vui lòng chọn ít nhất một ảnh");
      return;
    }

    setUploadingGallery(true);
    try {
      const uploadedImages = await uploadHotelImages(id, newGalleryFiles);
      setGalleryImages((prev) => [...prev, ...uploadedImages]);
      setNewGalleryFiles([]);
      alert("Upload ảnh thành công!");
    } catch (error) {
      console.error("Lỗi upload ảnh:", error);
      alert("Lỗi khi upload ảnh");
    } finally {
      setUploadingGallery(false);
    }
  };

  // Xóa ảnh gallery
  const handleDeleteGalleryImage = async (imageId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa ảnh này?")) {
      try {
        await deleteHotelImage(id, imageId);
        setGalleryImages((prev) => prev.filter((img) => img.id !== imageId));
        alert("Xóa ảnh thành công!");
      } catch (error) {
        console.error("Lỗi xóa ảnh:", error);
        alert("Lỗi khi xóa ảnh");
      }
    }
  };

  // Remove file từ selection
  const handleRemoveNewFile = (index) => {
    setNewGalleryFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Tên khách sạn không được để trống";
    } else if (!/^[A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]/.test(form.name)) {
      newErrors.name = "Ký tự đầu tiên phải viết hoa";
    }

    if (!form.address.trim()) {
      newErrors.address = "Địa chỉ không được để trống";
    }

    if (!form.phone.trim()) {
      newErrors.phone = "Số điện thoại không được để trống";
    } else if (!/^[0-9]{10}$/.test(form.phone)) {
      newErrors.phone = "Số điện thoại phải gồm 10 chữ số";
    }

    if (!form.city.trim()) {
      newErrors.city = "Thành phố không được để trống";
    }

    if (form.rating < 1 || form.rating > 5) {
      newErrors.rating = "Đánh giá phải từ 1 đến 5";
    }

    if (!form.shortDesc.trim()) {
      newErrors.shortDesc = "Mô tả ngắn không được để trống";
    }

    if (!form.detailDesc.trim()) {
      newErrors.detailDesc = "Mô tả chi tiết không được để trống";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      console.error("Upload lỗi", err);
    }

    setUploading(false);
  };

  // 🟦 Gửi form cập nhật
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
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

  if (loading || !form)
    return <div className="p-8 text-gray-700">Đang tải...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">Sửa khách sạn</h1>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Input: Tên */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tên khách sạn
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-md p-2"
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Input: Địa chỉ */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Địa chỉ
            </label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-md p-2"
            />
            {errors.address && (
              <p className="text-red-600 text-sm mt-1">{errors.address}</p>
            )}
          </div>

          {/* Thành phố + Điện thoại */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Thành phố
              </label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                className="mt-1 w-full border border-gray-300 rounded-md p-2"
              />
              {errors.city && (
                <p className="text-red-600 text-sm mt-1">{errors.city}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Điện thoại
              </label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="mt-1 w-full border border-gray-300 rounded-md p-2"
              />
              {errors.phone && (
                <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
              )}
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Đánh giá (1-5)
            </label>
            <input
              type="number"
              name="rating"
              min={1}
              max={5}
              value={form.rating}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-md p-2"
            />
            {errors.rating && (
              <p className="text-red-600 text-sm mt-1">{errors.rating}</p>
            )}
          </div>

          {/* Ảnh: Preview + Chọn file */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ảnh đại diện
            </label>

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

            {uploading && (
              <p className="text-blue-600 mt-1">Đang upload ảnh...</p>
            )}
          </div>

          {/* Mô tả ngắn */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Mô tả ngắn
            </label>
            <textarea
              name="shortDesc"
              value={form.shortDesc}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-md p-2"
              rows={2}
            ></textarea>
            {errors.shortDesc && (
              <p className="text-red-600 text-sm mt-1">{errors.shortDesc}</p>
            )}
          </div>

          {/* Mô tả chi tiết */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Mô tả chi tiết
            </label>
            <textarea
              name="detailDesc"
              value={form.detailDesc}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 rounded-md p-2"
              rows={4}
            ></textarea>
            {errors.detailDesc && (
              <p className="text-red-600 text-sm mt-1">{errors.detailDesc}</p>
            )}
          </div>

          {/* Gallery Images */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quản lý ảnh phụ</h3>

            {/* Ảnh hiện tại */}
            {galleryImages.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Ảnh hiện tại
                </h4>
                <div className="grid grid-cols-4 gap-4">
                  {galleryImages.map((img) => (
                    <div key={img.id} className="relative group">
                      <img
                        src={img.imageUrl}
                        alt={img.name}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteGalleryImage(img.id)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload area */}
            <div
              {...getRootProps()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:bg-gray-50 transition text-center"
            >
              <input {...getInputProps()} />
              <p className="text-gray-600">
                Kéo ảnh vào đây hoặc bấm để chọn ảnh
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Có thể chọn nhiều ảnh cùng lúc
              </p>
            </div>

            {/* Ảnh đã chọn */}
            {newGalleryFiles.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Ảnh đã chọn ({newGalleryFiles.length})
                </h4>
                <div className="grid grid-cols-4 gap-4">
                  {newGalleryFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`preview-${index}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveNewFile(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleUploadGallery}
                  disabled={uploadingGallery}
                  className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold"
                >
                  {uploadingGallery ? "Đang upload..." : "Upload ảnh"}
                </button>
              </div>
            )}
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
