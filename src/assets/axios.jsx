import axios from "axios";

export const BASE_URL = "http://localhost:5000/"; 
// export const BASE_URL = "https://api.zerotohero.ebhoom.com";

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to dynamically add token for each request
axiosInstance.interceptors.request.use(
  (config) => {
    // Get fresh token from localStorage for each request
    const token = localStorage.getItem("token");
    
    // Add Authorization header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401) {
      // Clear token if unauthorized
      localStorage.removeItem("token");
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;