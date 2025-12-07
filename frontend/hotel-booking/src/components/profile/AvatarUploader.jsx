import React, { useState, useRef, useEffect } from "react";

const AvatarUploader = ({
  currentAvatar,
  onAvatarUpdate,
  userName = "User",
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showMenu]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
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

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewImage(event.target.result);
      setShowPreview(true);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadConfirm = async () => {
    if (!previewImage) return;

    setIsUploading(true);
    try {
      const file = fileInputRef.current?.files?.[0];
      if (!file) return;

      // Tạo FormData để gửi file tới backend
      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("token");

      // Upload tới backend thay vì Cloudinary trực tiếp
      const response = await fetch(
        "http://localhost:8080/api/user/profile/avatar/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Lỗi khi tải ảnh lên");
      }

      const data = await response.json();
      const avatarUrl = data.avatar;

      // Call callback to update parent component
      onAvatarUpdate(avatarUrl);

      // Close preview and reset
      setShowPreview(false);
      setPreviewImage(null);
      fileInputRef.current = null;
      alert("Cập nhật ảnh đại diện thành công!");
    } catch (error) {
      alert("Lỗi: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setShowPreview(false);
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleViewAvatar = () => {
    if (currentAvatar) {
      window.open(currentAvatar, "_blank");
    }
    setShowMenu(false);
  };

  const handleSelectAvatar = () => {
    fileInputRef.current?.click();
    setShowMenu(false);
  };

  return (
    <>
      {/* Avatar Container with Dropdown */}
      <div className="relative" ref={menuRef}>
        {/* Avatar Display */}
        <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-4xl shadow-md overflow-hidden cursor-pointer group">
          {/* Display Avatar or Initials */}
          {currentAvatar ? (
            <img
              src={currentAvatar}
              alt="Avatar"
              className="w-full h-full object-cover group-hover:brightness-75 transition-all duration-200"
            />
          ) : (
            <span className="group-hover:brightness-75 transition-all duration-200">
              {userName.charAt(0).toUpperCase()}
            </span>
          )}

          {/* Edit Icon on Hover */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="absolute inset-0 flex items-center justify-center text-white text-2xl opacity-0 group-hover:opacity-100 transition"
            title="Chỉnh sửa ảnh đại diện"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="12" cy="5" r="1"></circle>
              <circle cx="12" cy="19" r="1"></circle>
            </svg>
          </button>
        </div>

        {/* Dropdown Menu */}
        {showMenu && (
          <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-xl z-50 w-48 py-2">
            {/* View Avatar Option */}
            {currentAvatar && (
              <button
                onClick={handleViewAvatar}
                className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                Xem ảnh đại diện
              </button>
            )}

            {/* Select Avatar Option */}
            <button
              onClick={handleSelectAvatar}
              className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 transition flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              Chọn ảnh đại diện
            </button>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {/* Preview Modal */}
      {showPreview && previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">
                Xem trước ảnh đại diện
              </h3>
              <button
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Body - Preview Image */}
            <div className="px-6 py-8 flex justify-center bg-gray-50">
              <div className="relative">
                <img
                  src={previewImage}
                  alt="Preview"
                  className="max-w-sm max-h-96 rounded-lg object-cover"
                />
              </div>
            </div>

            {/* Footer - Action Buttons */}
            <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={handleCancel}
                disabled={isUploading}
                className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg font-medium hover:bg-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleUploadConfirm}
                disabled={isUploading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Đang tải...
                  </>
                ) : (
                  "Xác nhận"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AvatarUploader;
