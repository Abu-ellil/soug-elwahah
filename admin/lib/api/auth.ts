import { apiClient } from "./client";
import { Admin } from "../../types";

interface LoginCredentials {
  email?: string;
  phone?: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    admin: Admin;
  };
  token: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    admin: Admin;
  };
}

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response: LoginResponse = await apiClient.post(
      "/admin/auth/login",
      credentials
    );
    // Store the token in the API client after successful login
    if (response.success && response.token) {
      apiClient.setToken(response.token);
    }
    return response;
  },

  logout: async (): Promise<void> => {
    await apiClient.post("/admin/auth/logout");
    // Clear the token after logout
    apiClient.clearToken();
  },

  me: async (): Promise<AuthResponse> => {
    const response = await apiClient.get<AuthResponse>("/admin/auth/me");
    return response;
  },
};
