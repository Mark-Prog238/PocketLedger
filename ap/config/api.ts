// API Configuration
// Update this URL to match your backend server
// For local development, use your computer's IP address
// For production, use your deployed server URL
export const API_BASE_URL = __DEV__
  ? "http://192.168.0.17:8080" // Development - update with your IP
  : "https://your-production-api.com"; // Production URL

export const API_ENDPOINTS = {
  LOGIN: "/api/login",
  REGISTER: "/api/register",
  TRANSACTIONS: "/api/transactions",
  TAGS: "/api/tags",
  ANALYTICS: "/api/analytics",
  BUDGETS: "/api/budgets",
  PROFILE: "/api/profile",
  CHANGE_PASSWORD: "/api/change-password",
  RESET_REQUEST: "/api/reset-request",
} as const;

// Helper function to get full API URL
export const getApiUrl = (endpoint: string) => `${API_BASE_URL}${endpoint}`;
