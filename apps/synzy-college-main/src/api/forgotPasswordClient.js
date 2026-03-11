import axios from "axios";

const forgotPasswordClient = axios.create({
  baseURL: "https://api.synzy.in/api",
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
