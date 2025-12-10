"use client";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "@/components/admin/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Star, Search, Plus, X } from "lucide-react";
import {
  createHotelTag,
  updateTag,
  deleteTag,
  getAllFacilities,
  createFacility,
  deleteFacilityFromHotel,
  addFacilityToHotel,
} from "@/api/hotelApi";

export default function AdminHotelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);

  // CRUD tag cho khách sạn
  const [tagEditMode, setTagEditMode] = useState(false);
  const [editingTagId, setEditingTagId] = useState(null);
  const [newTagName, setNewTagName] = useState("");
  const [addingNewTag, setAddingNewTag] = useState(false); // State để hiển thị input thêm tag mới
  const [newTagInput, setNewTagInput] = useState(""); // Giá trị input thêm tag mới

  // State quản lý facilities
  const [facilitiesEditMode, setFacilitiesEditMode] = useState(false);
  const [allFacilities, setAllFacilities] = useState([]); // Tất cả facilities trong hệ thống
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFacilityId, setSelectedFacilityId] = useState("");
  const [newFacilityName, setNewFacilityName] = useState("");
  const [newFacilityType, setNewFacilityType] = useState("Tiện nghi phòng");
  const [showAddForm, setShowAddForm] = useState(false);
  const [facilitiesLoading, setFacilitiesLoading] = useState(false);

  // Fetch hotel details
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios
      .get(`http://localhost:8080/api/admin/hotels/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setHotel(res.data);
        setLoading(false);
        console.log(res.data);
      })
      .catch((err) => {
        console.error("Lỗi load hotel detail:", err);
        setLoading(false);
      });
    fetchAllFacilities();
  }, [id]);

  // Fetch all facilities từ hệ thống
  const fetchAllFacilities = async () => {
    try {
      setFacilitiesLoading(true);
      const facilities = await getAllFacilities();
      setAllFacilities(facilities);
    } catch (error) {
      console.error("Lỗi khi tải facilities:", error);
    } finally {
      setFacilitiesLoading(false);
    }
  };

  // Tìm kiếm facilities
  const getFilteredFacilities = () => {
    if (!searchTerm.trim()) return allFacilities;

    return allFacilities.filter(
      (facility) =>
        facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        facility.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Lấy facilities chưa có trong khách sạn
  const getAvailableFacilities = () => {
    const hotelFacilityIds = hotel?.facilities?.map((f) => f.id) || [];
    return getFilteredFacilities().filter(
      (facility) => !hotelFacilityIds.includes(facility.id)
    );
  };

  // Thêm facility từ hệ thống vào khách sạn
  const handleAddExistingFacility = async () => {
    if (!selectedFacilityId) {
      alert("Vui lòng chọn tiện ích để thêm");
      return;
    }

    try {
      const facility = allFacilities.find(
        (f) => f.id === Number(selectedFacilityId)
      );
      if (!facility) return;

      await addFacilityToHotel(hotel.id, { facilityId: facility.id });

      // Cập nhật hotel data với facility mới
      setHotel((prevHotel) => ({
        ...prevHotel,
        facilities: [...prevHotel.facilities, facility],
      }));

      setSelectedFacilityId("");
      alert("Thêm tiện ích thành công!");
    } catch (error) {
      alert(error.message || "Lỗi khi thêm tiện ích");
    }
  };

  // Thêm facility mới vào hệ thống và khách sạn
  const handleAddNewFacility = async () => {
    if (!newFacilityName.trim()) {
      alert("Vui lòng nhập tên tiện ích");
      return;
    }

    try {
      const newFacility = await createFacility({
        name: newFacilityName.trim(),
        type: newFacilityType,
      });

      // Cập nhật danh sách facilities hệ thống
      setAllFacilities((prev) => [...prev, newFacility]);

      // Thêm vào khách sạn
      setHotel((prevHotel) => ({
        ...prevHotel,
        facilities: [...prevHotel.facilities, newFacility],
      }));

      // Reset form
      setNewFacilityName("");
      setNewFacilityType("Tiện nghi phòng");
      setShowAddForm(false);

      alert("Thêm tiện ích mới thành công!");
    } catch (error) {
      alert(error.message || "Lỗi khi thêm tiện ích mới");
    }
  };

  // Xóa facility khỏi khách sạn (không xóa khỏi hệ thống)
  const handleRemoveFacilityFromHotel = async (facilityId) => {
    const facilityToRemove = hotel.facilities.find((f) => f.id === facilityId);
    if (!facilityToRemove) return;

    if (
      window.confirm(
        `Bạn có chắc muốn xóa tiện ích "${facilityToRemove.name}" khỏi khách sạn?`
      )
    ) {
      try {
        await deleteFacilityFromHotel(hotel.id, facilityId);

        // Cập nhật hotel data - chỉ xóa khỏi khách sạn
        setHotel((prevHotel) => ({
          ...prevHotel,
          facilities: prevHotel.facilities.filter((f) => f.id !== facilityId),
        }));

        alert("Xóa tiện ích khỏi khách sạn thành công!");
      } catch (error) {
        alert(error.message || "Lỗi khi xóa tiện ích");
      }
    }
  };

  // Loại tiện ích (types)
  const facilityTypes = [
    "Tiện nghi phòng",
    "Dịch vụ khách sạn",
    "Tiện nghi công cộng",
    "Tiện nghi chung",
    "Các tiện ích lân cận",
    "Vận chuyển",
  ];

  // Thêm tag mới vào khách sạn
  const handleAddTag = async () => {
    if (!newTagInput || newTagInput.trim() === "") {
      alert("Vui lòng nhập tên tag");
      return;
    }

    try {
      const newTag = await createHotelTag(hotel.id, {
        name: newTagInput.trim(),
      });

      // Cập nhật hotel data với tag mới
      setHotel((prevHotel) => ({
        ...prevHotel,
        tags: [...prevHotel.tags, newTag],
      }));

      // Reset input và ẩn form thêm
      setNewTagInput("");
      setAddingNewTag(false);

      alert("Thêm tag thành công!");
    } catch (error) {
      alert(error.message || "Lỗi khi thêm tag");
    }
  };

  // Cancel thêm tag mới
  const cancelAddTag = () => {
    setAddingNewTag(false);
    setNewTagInput("");
  };

  // Cập nhật tag
  const handleUpdateTag = async (tagId, newName) => {
    if (!newName || newName.trim() === "") {
      alert("Tên tag không được để trống");
      return false;
    }

    try {
      const updatedTag = await updateTag(tagId, { name: newName.trim() });

      // Cập nhật hotel data
      setHotel((prevHotel) => ({
        ...prevHotel,
        tags: prevHotel.tags.map((tag) =>
          tag.id === tagId ? updatedTag : tag
        ),
      }));

      return true;
    } catch (error) {
      alert(error.message || "Lỗi khi cập nhật tag");
      return false;
    }
  };

  // Xóa tag khỏi khách sạn
  const handleDeleteTag = async (tagId) => {
    const tagToDelete = hotel.tags.find((tag) => tag.id === tagId);
    if (!tagToDelete) return;

    if (window.confirm(`Bạn có chắc muốn xóa tag "${tagToDelete.name}"?`)) {
      try {
        await deleteTag(tagId);

        // Cập nhật hotel data - xóa tag
        setHotel((prevHotel) => ({
          ...prevHotel,
          tags: prevHotel.tags.filter((tag) => tag.id !== tagId),
        }));

        alert("Xóa tag thành công!");
      } catch (error) {
        alert(error.message || "Lỗi khi xóa tag");
      }
    }
  };

  // Save editing
  const saveEditTag = async () => {
    if (editingTagId && newTagName.trim()) {
      const success = await handleUpdateTag(editingTagId, newTagName);
      if (success) {
        setEditingTagId(null);
        setNewTagName("");
      }
    }
  };

  // Cancel editing
  const cancelEditTag = () => {
    setEditingTagId(null);
    setNewTagName("");
  };

  // Xử lý phím Enter/Escape khi thêm tag mới
  const handleNewTagKeyDown = (e) => {
    if (e.key === "Enter") {
      handleAddTag();
    } else if (e.key === "Escape") {
      cancelAddTag();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-700">
        Đang tải...
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="flex justify-center items-center h-screen text-red-600">
        Không tìm thấy khách sạn
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar />

      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-sm sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <button
              className="flex items-center px-3 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl"
              onClick={() => navigate("/admin/hotel")}
            >
              ←
            </button>
            <h1 className="text-3xl font-bold">Chi tiết khách sạn</h1>
          </div>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left: Featured Image */}
          <div className="col-span-1 space-y-4">
            {/* Ảnh đại diện */}
            <Card>
              <CardContent className="p-0">
                {hotel.image ? (
                  <img
                    src={hotel.image}
                    alt={hotel.name}
                    className="w-full h-64 object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-300 flex items-center justify-center rounded-t-lg">
                    <span className="text-gray-600">Không có ảnh</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bộ sưu tập ảnh */}
            <Card>
              <CardHeader>
                <CardTitle>Hình ảnh khác</CardTitle>
              </CardHeader>
              <CardContent>
                {hotel.images?.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {hotel.images.map((img) => (
                      <div key={img.id} className="w-full h-28">
                        <img
                          src={img.imageUrl}
                          alt={img.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>Không có hình ảnh thêm</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Hotel Info */}
          <div className="col-span-2 space-y-6">
            {/* Card 1: Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{hotel.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin size={20} className="text-blue-600" />
                  <div>
                    <p className="text-slate-500 text-sm">Thành phố</p>
                    <p className="font-medium text-lg">{hotel.city || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin size={20} className="text-blue-600" />
                  <div>
                    <p className="text-slate-500 text-sm">Địa chỉ</p>
                    <p className="font-medium text-lg">
                      {hotel.address || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Phone size={20} className="text-green-600" />
                  <div>
                    <p className="text-slate-500 text-sm">Điện thoại</p>
                    <p className="font-medium text-lg">
                      {hotel.phone || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Star size={20} className="text-yellow-400" />
                  <div>
                    <p className="text-slate-500 text-sm">Đánh giá</p>
                    <p className="font-medium text-lg flex items-center gap-1">
                      {"⭐".repeat(hotel.rating || 0)} ({hotel.rating || 0}/5)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Descriptions */}
            <Card>
              <CardHeader>
                <CardTitle>Mô tả ngắn</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700">
                  {hotel.shortDesc || "Không có mô tả"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mô tả chi tiết</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700">
                  {hotel.detailDesc || "Không có mô tả chi tiết"}
                </p>
              </CardContent>
            </Card>

            {/* Card 3: Facilities - PHÂN LOẠI THEO TYPE */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-lg font-semibold">
                  Tiện ích của khách sạn
                </CardTitle>

                {/* Nút setting */}
                <button
                  onClick={() => {
                    setFacilitiesEditMode(!facilitiesEditMode);
                    setShowAddForm(false);
                    setSearchTerm("");
                    setSelectedFacilityId("");
                  }}
                  className="rounded-lg p-2 transition-colors duration-200 hover:bg-gray-100"
                  aria-label={
                    facilitiesEditMode
                      ? "Thoát chế độ chỉnh sửa"
                      : "Chỉnh sửa tiện ích"
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-settings text-gray-600"
                  >
                    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c0 .69.39 1.31 1 1.51h.09a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                </button>
              </CardHeader>

              <CardContent>
                {/* Phần hiển thị tiện ích hiện có - PHÂN LOẠI THEO TYPE */}
                <div className="mb-6">
                  <h4 className="mb-3 font-medium text-gray-700">
                    Tiện ích hiện có ({hotel.facilities?.length || 0})
                  </h4>

                  {hotel.facilities?.length > 0 ? (
                    // Group facilities by type
                    (() => {
                      // Nhóm tiện ích theo type
                      const groupedFacilities = hotel.facilities.reduce(
                        (acc, facility) => {
                          const type = facility.type || "Khác";
                          if (!acc[type]) {
                            acc[type] = [];
                          }
                          acc[type].push(facility);
                          return acc;
                        },
                        {}
                      );

                      // Sắp xếp các type theo thứ tự mong muốn
                      const typeOrder = [
                        "Tiện nghi phòng",
                        "Dịch vụ khách sạn",
                        "Tiện nghi công cộng",
                        "Tiện nghi chung",
                        "Các tiện ích lân cận",
                        "Vận chuyển",
                        "Khác",
                      ];

                      // Sắp xếp các type
                      const sortedTypes = Object.keys(groupedFacilities).sort(
                        (a, b) => {
                          const indexA = typeOrder.indexOf(a);
                          const indexB = typeOrder.indexOf(b);
                          if (indexA !== -1 && indexB !== -1)
                            return indexA - indexB;
                          if (indexA !== -1) return -1;
                          if (indexB !== -1) return 1;
                          return a.localeCompare(b);
                        }
                      );

                      return (
                        <div className="space-y-6">
                          {sortedTypes.map((type) => {
                            const typeFacilities = groupedFacilities[type];

                            return (
                              <div
                                key={type}
                                className="overflow-hidden rounded-lg border border-gray-200"
                              >
                                {/* Type header */}
                                <div
                                  className={`px-4 py-3 ${
                                    type === "Tiện nghi phòng"
                                      ? "bg-purple-50 border-b border-purple-100"
                                      : type === "Dịch vụ khách sạn"
                                      ? "bg-green-50 border-b border-green-100"
                                      : type === "Tiện nghi công cộng"
                                      ? "bg-blue-50 border-b border-blue-100"
                                      : type === "Tiện nghi chung"
                                      ? "bg-yellow-50 border-b border-yellow-100"
                                      : type === "Các tiện ích lân cận"
                                      ? "bg-indigo-50 border-b border-indigo-100"
                                      : type === "Vận chuyển"
                                      ? "bg-pink-50 border-b border-pink-100"
                                      : "bg-gray-50 border-b border-gray-100"
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div
                                        className={`h-2 w-2 rounded-full ${
                                          type === "Tiện nghi phòng"
                                            ? "bg-purple-500"
                                            : type === "Dịch vụ khách sạn"
                                            ? "bg-green-500"
                                            : type === "Tiện nghi công cộng"
                                            ? "bg-blue-500"
                                            : type === "Tiện nghi chung"
                                            ? "bg-yellow-500"
                                            : type === "Các tiện ích lân cận"
                                            ? "bg-indigo-500"
                                            : type === "Vận chuyển"
                                            ? "bg-pink-500"
                                            : "bg-gray-500"
                                        }`}
                                      ></div>
                                      <span
                                        className={`font-medium ${
                                          type === "Tiện nghi phòng"
                                            ? "text-purple-800"
                                            : type === "Dịch vụ khách sạn"
                                            ? "text-green-800"
                                            : type === "Tiện nghi công cộng"
                                            ? "text-blue-800"
                                            : type === "Tiện nghi chung"
                                            ? "text-yellow-800"
                                            : type === "Các tiện ích lân cận"
                                            ? "text-indigo-800"
                                            : type === "Vận chuyển"
                                            ? "text-pink-800"
                                            : "text-gray-800"
                                        }`}
                                      >
                                        {type}
                                      </span>
                                    </div>
                                    <span
                                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                                        type === "Tiện nghi phòng"
                                          ? "bg-purple-100 text-purple-700"
                                          : type === "Dịch vụ khách sạn"
                                          ? "bg-green-100 text-green-700"
                                          : type === "Tiện nghi công cộng"
                                          ? "bg-blue-100 text-blue-700"
                                          : type === "Tiện nghi chung"
                                          ? "bg-yellow-100 text-yellow-700"
                                          : type === "Các tiện ích lân cận"
                                          ? "bg-indigo-100 text-indigo-700"
                                          : type === "Vận chuyển"
                                          ? "bg-pink-100 text-pink-700"
                                          : "bg-gray-100 text-gray-700"
                                      }`}
                                    >
                                      {typeFacilities.length} tiện ích
                                    </span>
                                  </div>
                                </div>

                                {/* Facilities list */}
                                <div className="p-4">
                                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                    {typeFacilities.map((facility) => (
                                      <div
                                        key={facility.id}
                                        className="group relative rounded-lg border border-gray-200 bg-white p-3 transition-all hover:border-gray-300 hover:shadow-sm"
                                      >
                                        <div className="flex items-start justify-between">
                                          <div className="flex-1">
                                            <div className="mb-1 flex items-center gap-2">
                                              <div
                                                className={`h-2 w-2 rounded-full ${
                                                  type === "Tiện nghi phòng"
                                                    ? "bg-purple-500"
                                                    : type ===
                                                      "Dịch vụ khách sạn"
                                                    ? "bg-green-500"
                                                    : type ===
                                                      "Tiện nghi công cộng"
                                                    ? "bg-blue-500"
                                                    : type === "Tiện nghi chung"
                                                    ? "bg-yellow-500"
                                                    : type ===
                                                      "Các tiện ích lân cận"
                                                    ? "bg-indigo-500"
                                                    : type === "Vận chuyển"
                                                    ? "bg-pink-500"
                                                    : "bg-gray-500"
                                                }`}
                                              ></div>
                                              <span className="font-medium text-gray-800">
                                                {facility.name}
                                              </span>
                                            </div>
                                            {facility.description && (
                                              <p className="text-sm text-gray-600 line-clamp-2">
                                                {facility.description}
                                              </p>
                                            )}
                                          </div>

                                          {/* Nút xóa (chỉ hiện khi edit mode) */}
                                          {facilitiesEditMode && (
                                            <button
                                              onClick={() =>
                                                handleRemoveFacilityFromHotel(
                                                  facility.id
                                                )
                                              }
                                              className="ml-2 flex-shrink-0 rounded-full p-1 text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
                                              aria-label={`Xóa ${facility.name}`}
                                            >
                                              <X size={16} />
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()
                  ) : (
                    <div className="rounded-lg border-2 border-dashed border-gray-300 py-8 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="mt-2 italic text-gray-500">
                        Khách sạn chưa có tiện ích
                      </p>
                    </div>
                  )}
                </div>

                {/* Phần thêm tiện ích mới (chỉ hiện khi edit mode) */}
                {facilitiesEditMode && (
                  <div className="border-t pt-6">
                    <h4 className="mb-4 font-medium text-gray-700">
                      Thêm tiện ích mới
                    </h4>

                    {/* Tìm kiếm và chọn từ hệ thống */}
                    <div className="mb-6">
                      <div className="mb-3 flex gap-3">
                        <div className="relative flex-1">
                          <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400"
                            size={18}
                          />
                          <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Tìm kiếm tiện ích..."
                            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <button
                          onClick={() => setShowAddForm(!showAddForm)}
                          className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200"
                        >
                          <Plus size={18} />
                          Thêm mới
                        </button>
                      </div>

                      {/* Danh sách facilities có sẵn */}
                      {!showAddForm && getAvailableFacilities().length > 0 && (
                        <div className="mb-4">
                          <div className="mb-2 flex items-center gap-3">
                            <select
                              value={selectedFacilityId}
                              onChange={(e) =>
                                setSelectedFacilityId(e.target.value)
                              }
                              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">
                                Chọn tiện ích từ hệ thống
                              </option>
                              {getAvailableFacilities().map((facility) => (
                                <option key={facility.id} value={facility.id}>
                                  {facility.name} ({facility.type})
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={handleAddExistingFacility}
                              disabled={!selectedFacilityId}
                              className={`flex items-center gap-2 rounded-lg px-4 py-2 ${
                                selectedFacilityId
                                  ? "bg-blue-600 text-white hover:bg-blue-700"
                                  : "cursor-not-allowed bg-gray-200 text-gray-400"
                              }`}
                            >
                              <Plus size={18} />
                              Thêm
                            </button>
                          </div>
                          <p className="text-sm text-gray-500">
                            Tìm thấy {getAvailableFacilities().length} tiện ích
                            có sẵn
                          </p>
                        </div>
                      )}

                      {/* Form thêm tiện ích mới */}
                      {showAddForm && (
                        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                          <h5 className="mb-3 font-medium text-blue-800">
                            Thêm tiện ích mới vào hệ thống
                          </h5>
                          <div className="space-y-3">
                            <div>
                              <label className="mb-1 block text-sm font-medium text-gray-700">
                                Tên tiện ích *
                              </label>
                              <input
                                type="text"
                                value={newFacilityName}
                                onChange={(e) =>
                                  setNewFacilityName(e.target.value)
                                }
                                placeholder="Nhập tên tiện ích mới..."
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-sm font-medium text-gray-700">
                                Loại tiện ích
                              </label>
                              <select
                                value={newFacilityType}
                                onChange={(e) =>
                                  setNewFacilityType(e.target.value)
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                              >
                                {facilityTypes.map((type) => (
                                  <option key={type} value={type}>
                                    {type}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="flex gap-3 pt-2">
                              <button
                                onClick={handleAddNewFacility}
                                disabled={!newFacilityName.trim()}
                                className={`flex-1 rounded-lg px-4 py-2 ${
                                  newFacilityName.trim()
                                    ? "bg-green-600 text-white hover:bg-green-700"
                                    : "cursor-not-allowed bg-gray-200 text-gray-400"
                                }`}
                              >
                                Thêm vào hệ thống & khách sạn
                              </button>
                              <button
                                onClick={() => setShowAddForm(false)}
                                className="rounded-lg bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
                              >
                                Hủy
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Thông báo khi không tìm thấy */}
                    {!showAddForm &&
                      searchTerm &&
                      getAvailableFacilities().length === 0 && (
                        <div className="rounded-lg border border-gray-200 bg-gray-50 py-4 text-center">
                          <p className="mb-2 text-gray-600">
                            Không tìm thấy tiện ích phù hợp
                          </p>
                          <button
                            onClick={() => setShowAddForm(true)}
                            className="font-medium text-blue-600 hover:text-blue-800"
                          >
                            Thêm tiện ích mới "{searchTerm}"
                          </button>
                        </div>
                      )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Card 4: Tags */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="flex flex-row justify-between items-center pb-3">
                <CardTitle className="text-lg font-semibold">
                  Tags của khách sạn
                </CardTitle>

                {/* Nút setting */}
                <button
                  onClick={() => {
                    setTagEditMode(!tagEditMode);
                    setEditingTagId(null);
                    setNewTagName("");
                    setAddingNewTag(false);
                    setNewTagInput("");
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  aria-label={
                    tagEditMode ? "Thoát chế độ chỉnh sửa" : "Chỉnh sửa tags"
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-settings text-gray-600"
                  >
                    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c0 .69.39 1.31 1 1.51h.09a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                </button>
              </CardHeader>

              <CardContent className="flex flex-wrap gap-3">
                {/* Hiển thị tags của khách sạn */}
                {hotel.tags?.length > 0 ? (
                  hotel.tags.map((tag) => (
                    <div key={tag.id} className="relative group">
                      {/* Nếu đang sửa thẻ này */}
                      {editingTagId === tag.id ? (
                        <div className="flex items-center">
                          <input
                            autoFocus
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            className="px-3 py-1.5 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Nhập tên tag..."
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                saveEditTag();
                              } else if (e.key === "Escape") {
                                cancelEditTag();
                              }
                            }}
                          />
                          <div className="ml-2 flex gap-1">
                            <button
                              onClick={saveEditTag}
                              className="bg-green-500 text-white p-1 rounded hover:bg-green-600 transition-colors"
                              aria-label="Lưu thay đổi"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            </button>
                            <button
                              onClick={cancelEditTag}
                              className="bg-gray-500 text-white p-1 rounded hover:bg-gray-600 transition-colors"
                              aria-label="Hủy thay đổi"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="relative">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-lg font-medium border border-blue-200 transition-all group-hover:bg-blue-200">
                            {tag.name}
                          </span>

                          {/* Icon chỉnh sửa & xóa */}
                          {tagEditMode && (
                            <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              {/* Edit */}
                              <button
                                onClick={() => {
                                  setEditingTagId(tag.id);
                                  setNewTagName(tag.name);
                                }}
                                className="bg-blue-500 text-white p-1 rounded-full hover:bg-blue-600 transition-colors shadow-sm"
                                aria-label={`Chỉnh sửa tag ${tag.name}`}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleDeleteTag(tag.id)}
                                className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors shadow-sm"
                                aria-label={`Xóa tag ${tag.name}`}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <polyline points="3 6 5 6 21 6"></polyline>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">Khách sạn chưa có tags</p>
                )}

                {/* Form thêm tag mới - chỉ hiện khi edit mode */}
                {tagEditMode && (
                  <>
                    {addingNewTag ? (
                      <div className="flex items-center">
                        <input
                          autoFocus
                          value={newTagInput}
                          onChange={(e) => setNewTagInput(e.target.value)}
                          className="px-3 py-1.5 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                          placeholder="Nhập tên tag mới..."
                          onKeyDown={handleNewTagKeyDown}
                        />
                        <div className="ml-2 flex gap-1">
                          <button
                            onClick={handleAddTag}
                            className="bg-green-500 text-white p-1 rounded hover:bg-green-600 transition-colors"
                            aria-label="Thêm tag"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </button>
                          <button
                            onClick={cancelAddTag}
                            className="bg-gray-500 text-white p-1 rounded hover:bg-gray-600 transition-colors"
                            aria-label="Hủy thêm"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200 transition-colors border border-green-200 flex items-center gap-1"
                        onClick={() => setAddingNewTag(true)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Thêm tag
                      </button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Card 5: Rooms */}
            <Card>
              <CardHeader>
                <CardTitle>Danh sách phòng</CardTitle>
              </CardHeader>
              <CardContent>
                {hotel.rooms?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left">Tên phòng</th>
                          <th className="px-4 py-2 text-left">Giá</th>
                          <th className="px-4 py-2 text-left">Sức chứa</th>
                          <th className="px-4 py-2 text-left">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {hotel.rooms.map((room) => (
                          <tr
                            key={room.id}
                            className="cursor-pointer hover:bg-slate-100 transition"
                            onClick={() => navigate(`/admin/room/${room.id}`)}
                          >
                            <td className="px-4 py-2">{room.name}</td>
                            <td className="px-4 py-2">
                              {room.price?.toLocaleString()} VND
                            </td>
                            <td className="px-4 py-2">{room.capacity} người</td>
                            <td className="px-4 py-2">{room.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p>Không có phòng</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
