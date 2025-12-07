import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/homepage/Header";
import Footer from "../../components/homepage/Footer";
import profileApi from "../../api/profileApi";

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (
      !formData.currentPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      setError("Vui lòng điền đầy đủ các trường");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Mật khẩu mới không trùng khớp");
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      setError("Mật khẩu mới không được trùng với mật khẩu hiện tại");
      return;
    }

    setLoading(true);
    try {
      await profileApi.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      setSuccess(true);
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        navigate("/profile");
      }, 2000);
    } catch (err) {
      setError(err.message || "Lỗi khi đổi mật khẩu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
          {/* Page Header */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Đổi mật khẩu
            </h1>
            <p className="text-gray-500">Cập nhật mật khẩu tài khoản của bạn</p>
          </div>

          {/* Change Password Form */}
          <div className="bg-white rounded-lg shadow-md p-8">
            {/* Success Message */}
            {success && (
              <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                <strong className="font-bold">Thành công!</strong>
                <span className="block sm:inline">
                  {" "}
                  Mật khẩu đã được đổi thành công. Quay về trang profile.
                </span>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <strong className="font-bold">Lỗi!</strong>
                <span className="block sm:inline"> {error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu hiện tại
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  placeholder="Nhập mật khẩu hiện tại"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder="Nhập mật khẩu mới"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Nhập lại mật khẩu mới"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Đang xử lý...
                    </>
                  ) : (
                    "Đổi mật khẩu"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/profile")}
                  className="flex-1 bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium hover:bg-gray-400 transition"
                >
                  Quay lại
                </button>
              </div>
            </form>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
            <h3 className="text-sm font-bold text-blue-900 mb-2">
              Gợi ý bảo mật
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Sử dụng mật khẩu mạnh với ít nhất 8 ký tự</li>
              <li>• Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</li>
              <li>• Không chia sẻ mật khẩu với ai</li>
              <li>• Thay đổi mật khẩu định kỳ để bảo mật</li>
            </ul>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ChangePasswordPage;
