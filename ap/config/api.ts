// API Configuration
export const API_BASE_URL = "http://192.168.0.3:8080";

export const API_ENDPOINTS = {
  LOGIN: "/api/login",
  REGISTER: "/api/register",
  TRANSACTIONS: "/api/transactions",
  getUserTags: "/api/tags/:userId",
} as const;

// Helper function to get full API URL
export const getApiUrl = (endpoint: string) => `${API_BASE_URL}${endpoint}`;
