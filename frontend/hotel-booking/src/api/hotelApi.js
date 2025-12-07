import api from "../config/axiosConfig";

// Đếm số lượng khách sạn theo city
export const countHotelByCity = async () => {
  try {
    const res = await api.get("/hotels/by-city");
    return res.data;
  } catch (error) {
    console.error("Lỗi khi gọi API countHotelByCity:", error);
    throw error;
  }
};

//Tim khach san theo city, name, stars, minPrice, maxPrice
// export const getHotels = async ({ city, name, stars, minPrice, maxPrice }) => {
//   try {
//     const params = {};

//     if (city && city.trim() !== "") params.city = city;
//     if (name && name.trim() !== "") params.name = name;
//     if (stars && stars.length > 0) params.stars = stars.join(",");
//     if (minPrice) params.minPrice = minPrice;
//     if (maxPrice) params.maxPrice = maxPrice;

//     const res = await api.get("/hotels/filter", { params }); // axios sẽ tự build query string
//     return res.data;
//   } catch (error) {
//     console.error("Lỗi khi gọi API getHotels:", error);
//     throw error;
//   }
// };
export const getHotels = async (filters) => {
  // filters bây giờ sẽ bao gồm cả { city, page, size, ... }
  const response = await api.get("/hotels/filter", { params: filters });
  return response.data; // Trả về đối tượng Page (có content, totalPages...)
};

// Tìm khách sạn theo id
export const getHotelById = async (id) => {
  try {
    const res = await api.get(`/hotels/${id}`); 
    return res.data;
  } catch (err) {
    console.error("Lỗi khi lấy khách sạn:", err);
    throw err;
  }
};


// ==================== TAG APIs ====================

// Lấy tất cả tags
export const getAllTags = async () => {
  try {
    const res = await api.get("/admin/tags");
    return res.data;
  } catch (error) {
    console.error("Lỗi khi gọi API getAllTags:", error);
    throw error;
  }
};

// Lấy tag theo ID
export const getTagById = async (id) => {
  try {
    const res = await api.get(`/admin/tags/${id}`);
    return res.data;
  } catch (error) {
    console.error("Lỗi khi gọi API getTagById:", error);
    throw error;
  }
};

// Tạo tag mới
export const createHotelTag = async (hotelId, tagData) => {
  try {
    const res = await api.post(`/admin/tags/${hotelId}`, tagData);
    return res.data;
  } catch (error) {
    console.error("Lỗi khi gọi API createHotelTag:", error);
    
    if (error.response?.status === 400) {
      throw new Error("Tên tag đã tồn tại");
    }
    
    throw error;
  }
};

// Cập nhật tag
export const updateTag = async (id, tagData) => {
  try {
    const res = await api.put(`/admin/tags/${id}`, tagData);
    return res.data;
  } catch (error) {
    console.error("Lỗi khi gọi API updateTag:", error);
    
    if (error.response?.status === 400) {
      throw new Error("Tên tag đã tồn tại");
    }
    
    if (error.response?.status === 404) {
      throw new Error("Tag không tồn tại");
    }
    
    throw error;
  }
};

// Xóa tag
export const deleteTag = async (id) => {
  try {
    const res = await api.delete(`/admin/tags/${id}`);
    return res.data;
  } catch (error) {
    console.error("Lỗi khi gọi API deleteTag:", error);
    
    if (error.response?.status === 404) {
      throw new Error("Tag không tồn tại");
    }
    
    throw error;
  }
};

// 

export const getAllFacilities = async () => {
  try {
    const res = await api.get("/admin/facilities");
    return res.data;
  } catch (error) {
    console.error("Lỗi khi gọi API getAllFacilities:", error);
    throw error;
  }
};

export const createFacility = async (facilityData) => {
  try {
    const res = await api.post("/admin/facilities", facilityData);
    return res.data;
  } catch (error) {
    console.error("Lỗi khi gọi API createFacility:", error);
    
    if (error.response?.status === 400) {
      throw new Error("Tên tiện ích đã tồn tại");
    }
    
    throw error;
  }
};

export const addFacilityToHotel = async (hotelId, data) => {
  try {
    const res = await api.post(`/admin/hotels/${hotelId}/facilities`, data);
    return res.data;
  } catch (error) {
    console.error("Lỗi khi gọi API addFacilityToHotel:", error);
    throw error;
  }
};

export const deleteFacilityFromHotel = async (hotelId, facilityId) => {
  try {
    const res = await api.delete(`/admin/hotels/${hotelId}/facilities/${facilityId}`);
    return res.data;
  } catch (error) {
    console.error("Lỗi khi gọi API deleteFacilityFromHotel:", error);
    throw error;
  }
};