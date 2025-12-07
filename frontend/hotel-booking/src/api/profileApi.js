import api from "../config/axiosConfig";

const profileApi = {
  // Lấy thông tin profile của user hiện tại
  getProfile: async () => {
    const response = await api.get("/user/profile");
    return response.data;
  },

  // Cập nhật thông tin profile
  updateProfile: async (profileData) => {
    const response = await api.put("/user/profile", profileData);
    return response.data;
  },

  // Cập nhật avatar
  updateAvatar: async (avatarUrl) => {
    const response = await api.put("/user/profile/avatar", {
      avatar: avatarUrl,
    });
    return response.data;
  },

  // Đổi mật khẩu
  changePassword: async (payload) => {
    const response = await api.put("/user/change-password", payload);
    return response.data;
  },
};

export default profileApi;
