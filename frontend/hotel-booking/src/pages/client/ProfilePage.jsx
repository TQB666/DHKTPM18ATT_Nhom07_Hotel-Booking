import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/homepage/Header";
import Footer from "../../components/homepage/Footer";
import AvatarUploader from "../../components/profile/AvatarUploader";
import profileApi from "../../api/profileApi";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const data = await profileApi.getProfile();
        setProfile(data);
        setFormData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSaveProfile = async () => {
    try {
      const data = await profileApi.updateProfile(formData);
      setProfile(data);
      setIsEditing(false);
      alert("Cập nhật thông tin thành công!");
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
  };

  const handleAvatarUpdate = (newAvatarUrl) => {
    // Cập nhật profile với avatar mới
    setProfile({ ...profile, avatar: newAvatarUrl });
    setFormData({ ...formData, avatar: newAvatarUrl });
  };

  // Auto-refresh profile khi avatar thay đổi
  useEffect(() => {
    if (profile?.avatar) {
      // Làm mới dữ liệu profile
      const refreshProfile = async () => {
        try {
          const data = await profileApi.getProfile();
          setProfile(data);
          setFormData(data);
        } catch (err) {
          console.error("Lỗi khi làm mới profile:", err);
        }
      };
      refreshProfile();
    }
  }, [profile?.avatar]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-2xl mx-auto mt-10">
          <strong className="font-bold">Lỗi!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* Header Section */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <div className="flex items-center gap-6 mb-6">
              {/* Avatar with Upload */}
              <AvatarUploader
                currentAvatar={profile?.avatar}
                onAvatarUpdate={handleAvatarUpdate}
                userName={profile?.fullName}
              />

              {/* Basic Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">
                  {profile?.fullName}
                </h1>
                <p className="text-gray-500 text-lg mt-2">{profile?.email}</p>
                <div className="mt-3">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {profile?.roleName === "ADMIN"
                      ? "Quản trị viên"
                      : "Khách hàng"}
                  </span>
                </div>
              </div>

              {/* Edit Button */}
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition shadow-md"
                >
                  Chỉnh sửa
                </button>
              )}
            </div>
          </div>

          {/* Profile Information Section */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
              Thông tin cá nhân
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và Tên
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                    {profile?.fullName}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                  {profile?.email}
                </p>
              </div>

              {/* Phone Number */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                    {profile?.phone || "Chưa cập nhật"}
                  </p>
                )}
              </div>

              {/* Member Since */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thành viên từ
                </label>
                <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                  {profile?.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString("vi-VN")
                    : "Không xác định"}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleSaveProfile}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition"
                >
                  Lưu thay đổi
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-400 transition"
                >
                  Hủy bỏ
                </button>
              </div>
            )}
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-lg shadow-md p-8 mt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
              Tài khoản
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">Đổi mật khẩu</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Cập nhật mật khẩu tài khoản của bạn
                  </p>
                </div>
                <button
                  onClick={() => navigate("/change-password")}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition"
                >
                  Thay đổi
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">
                    Xem lịch sử đặt phòng
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Kiểm tra các đơn đặt phòng của bạn
                  </p>
                </div>
                <button
                  onClick={() => navigate("/history")}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  Xem
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProfilePage;
