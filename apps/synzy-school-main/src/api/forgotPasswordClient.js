import axios from "axios";

const forgotPasswordClient = axios.create({
  // baseURL: "http://localhost:8080/api/",
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000, // avoids hanging requests
});

forgotPasswordClient.interceptors.response.use(
  (res) => res,
  (error) => {
    console.error(
      "❌ Forgot Password API Error:",
      error.response?.status,
      error.response?.data
    );
    return Promise.reject(error);
  }
);

export default forgotPasswordClient;
