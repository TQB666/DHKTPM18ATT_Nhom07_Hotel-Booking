import axios from "axios";

const API_URL = "http://localhost:8080/api/ai";

const aiApi = {
  /**
   * Send message to AI and get response with suggestions
   * @param {string} message - User's message
   * @param {string} context - Optional context (e.g., "hotel-booking")
   * @returns {Promise} Response with AI answer and suggestions
   */
  chat: async (message, context = "hotel-booking") => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/chat`,
        {
          message,
          context,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error in AI chat:", error);
      throw error;
    }
  },
};

export default aiApi;
