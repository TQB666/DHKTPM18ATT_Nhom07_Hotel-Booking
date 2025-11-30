// services/BookingService.js
import axios from 'axios';

const API_URL = "http://localhost:8080/api/booking";

// Giả sử bạn lưu token trong localStorage
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
};

export const getBookingHistory = async () => {
    
        const response = await axios.get(`${API_URL}/history`, getAuthHeader());
        return response.data;
   
};