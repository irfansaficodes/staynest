import axios, { InternalAxiosRequestConfig } from "axios";

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  metadata?: { retryCount: number };
}

const getBaseURL = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  if (
    window.location.hostname === "mern-booking-hotel.netlify.app" ||
    window.location.hostname.includes("vercel.app")
  ) {
    return "https://hotel-booking-backend.duckdns.org";
  }

  if (window.location.hostname === "localhost") {
    return "http://localhost:5000";
  }

  return "https://hotel-booking-backend.duckdns.org";
};

export const getApiBaseUrl = getBaseURL;

const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 30000,
});

axiosInstance.interceptors.request.use((config: CustomAxiosRequestConfig) => {
  const token = localStorage.getItem("session_id");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.metadata = { retryCount: 0 };
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config } = error;

    if (error.response?.status === 401) {
      localStorage.removeItem("session_id");
      localStorage.removeItem("user_id");
      localStorage.removeItem("user_email");
      localStorage.removeItem("user_name");
      localStorage.removeItem("user_image");
      localStorage.removeItem("user_role");
      if (window.location.pathname !== "/sign-in") {
        window.location.href = "/sign-in";
      }
    }

    if (error.response?.status === 429 && config) {
      const customConfig = config as CustomAxiosRequestConfig;
      if (customConfig.metadata && customConfig.metadata.retryCount < 3) {
        customConfig.metadata.retryCount += 1;
        const delay =
          Math.pow(2, customConfig.metadata.retryCount - 1) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return axiosInstance(config);
      }
    }

    if (!error.response && config) {
      const customConfig = config as CustomAxiosRequestConfig;
      if (customConfig.metadata && customConfig.metadata.retryCount < 2) {
        customConfig.metadata.retryCount += 1;
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return axiosInstance(config);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
