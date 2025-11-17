const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

export class APIClient {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    // Check for existing token in localStorage on initialization
    if (typeof window !== "undefined") {
      this.token =
        localStorage.getItem("admin_token") || this.getTokenFromCookie();
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    // Ensure we have the latest token from localStorage or cookies
    if (!this.token && typeof window !== "undefined") {
      this.token =
        localStorage.getItem("admin_token") || this.getTokenFromCookie();
    }

    // Prepare headers with content type and authorization token if available
    const headers: any = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Add authorization header if token exists
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      credentials: "include", // This ensures cookies are sent with the request
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Request failed");
    }

    const data = await response.json();
    return data;
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  async patch<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  async uploadFile(endpoint: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);

    // For file uploads, we need to let the browser set the Content-Type header
    // since it needs to include the boundary for multipart data
    const headers: any = {};
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "POST",
      credentials: "include",
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    return response.json();
  }

  // Method to set the authentication token
  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("admin_token", token);
        // Also set the token in a cookie for middleware
        document.cookie = `admin_token=${token}; path=/; SameSite=strict`;
      } else {
        localStorage.removeItem("admin_token");
        // Remove the cookie as well
        document.cookie =
          "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00 GMT; SameSite=strict";
      }
    }
  }

  // Method to get the current token
  getToken(): string | null {
    if (!this.token && typeof window !== "undefined") {
      this.token =
        localStorage.getItem("admin_token") || this.getTokenFromCookie();
    }
    return this.token;
  }

  // Method to clear the token
  clearToken() {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin_token");
      // Remove the cookie as well
      document.cookie =
        "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00 GMT; SameSite=strict";
    }
  }

  // Helper method to get token from cookie
  private getTokenFromCookie(): string | null {
    if (typeof document === "undefined") return null;

    const name = "admin_token";
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
    return null;
  }
}

export const apiClient = new APIClient();
