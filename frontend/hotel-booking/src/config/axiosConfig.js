import axios from "axios";
import qs from "qs";
// Tạo instance axios
const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
  paramsSerializer: (params) => {
    return qs.stringify(params, {
      arrayFormat: 'repeat', // stars=5&stars=4 (không có [])
      skipNulls: true,
      encode: false
    });
  }
});

// Request interceptor: gắn token vào header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && token.trim() !== "") {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: xử lý lỗi 401 (token hết hạn)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Token hết hạn hoặc không hợp lệ, chuyển hướng login...");
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
