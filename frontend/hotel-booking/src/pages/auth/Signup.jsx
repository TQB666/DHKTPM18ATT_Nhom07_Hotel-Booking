import Header from "../../components/homepage/Header";
import Footer from "../../components/homepage/Footer";
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../config/axiosConfig";
import { Loader } from "lucide-react";

export default function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); // Clear error when user starts typing
  };

  const validateForm = () => {
    // Validation logic
    if (!form.firstName.trim()) {
      setError("Vui lòng nhập tên");
      return false;
    }
    if (!form.lastName.trim()) {
      setError("Vui lòng nhập họ");
      return false;
    }
    if (!form.phone.trim()) {
      setError("Vui lòng nhập số điện thoại");
      return false;
    }
    if (!/^[0-9]{10}$/.test(form.phone.trim())) {
      setError("Số điện thoại phải gồm 10 chữ số");
      return false;
    }
    if (!form.email.trim()) {
      setError("Vui lòng nhập email");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Email không hợp lệ");
      return false;
    }
    if (!form.password.trim()) {
      setError("Vui lòng nhập mật khẩu");
      return false;
    }
    if (form.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return false;
    }
    if (!form.confirmPassword.trim()) {
      setError("Vui lòng xác nhận mật khẩu");
      return false;
    }
    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/auth/signup", form);
      // Navigate to login after successful signup
      navigate("/login");
    } catch (err) {
      const errorMessage = err.response?.data || "Đăng ký thất bại";
      setError(errorMessage);
      console.error("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Header />

      {/* Main Signup Form */}
      <main className="flex-grow flex justify-center items-center bg-gray-50">
        <div className="w-full max-w-lg bg-white shadow-lg rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Đăng ký tài khoản
          </h3>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Họ & Tên */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                disabled={loading}
                required
                placeholder="Nhập 10 chữ số"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                disabled={loading}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* Mật khẩu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                disabled={loading}
                required
                placeholder="Ít nhất 6 ký tự"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* Xác nhận mật khẩu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Xác nhận mật khẩu
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* Nút Đăng ký */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition duration-200 disabled:bg-green-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader size={18} className="animate-spin" />}
              {loading ? "Đang đăng ký..." : "Đăng ký"}
            </button>
          </form>

          <p className="mt-4 text-center text-gray-600 text-sm">
            Đã có tài khoản?{" "}
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Đăng nhập
            </Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
