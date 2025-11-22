import { BASE_URL } from "../constants/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { testConnectivity, testApiConnectivity } from "../utils/network";

// API Service for Merchant App
class ApiService {
  private baseUrl: string;
  private token: string | null = null;
  private refreshTokenPromise: Promise<string> | null = null;
  private isSessionValid: boolean = false;
  private sessionCheckInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.baseUrl = BASE_URL;
    this.initializeSessionMonitoring();
  }

  // Initialize session monitoring
  private initializeSessionMonitoring() {
    // Check session validity every 5 minutes
    this.sessionCheckInterval = setInterval(async () => {
      await this.validateSession();
    }, 5 * 60 * 1000);
  }

  // Validate current session
  private async validateSession(): Promise<boolean> {
    try {
      const token = await this.getToken();
      if (!token) {
        this.isSessionValid = false;
        return false;
      }

      // Try to get user profile to validate token
      const profile = await this.getProfileInternal();
      this.isSessionValid = !!(profile && profile.success);
      return this.isSessionValid;
    } catch (error) {
      this.isSessionValid = false;
      return false;
    }
  }

  // Internal method to get profile without the full request wrapper
  private async getProfileInternal() {
    const url = `${this.baseUrl}/auth/me`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.token}`,
      },
    });
    return response.ok ? response.json() : null;
  }

  // Set authentication token
  async setToken(token: string) {
    this.token = token;
    this.isSessionValid = true;
    await AsyncStorage.setItem("merchant_token", token);
    
    // Clear any existing refresh promise when new token is set
    this.refreshTokenPromise = null;
  }

  // Get authentication token
  async getToken(): Promise<string | null> {
    if (!this.token) {
      this.token = await AsyncStorage.getItem("merchant_token");
    }
    return this.token;
  }

  // Remove authentication token
  async clearToken() {
    this.token = null;
    this.isSessionValid = false;
    this.refreshTokenPromise = null;
    await AsyncStorage.removeItem("merchant_token");
  }

  // Cleanup resources
  destroy() {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = null;
    }
  }

  // Force session validation (useful for manual checks)
  async validateAndRefreshIfNeeded(): Promise<boolean> {
    const isValid = await this.validateSession();
    if (!isValid) {
      try {
        await this.refreshToken();
        return true;
      } catch (error) {
        await this.clearToken();
        return false;
      }
    }
    return true;
  }

  // Check if session is still valid
  async isSessionValidAsync(): Promise<boolean> {
    return await this.validateSession();
  }

  // Refresh token (you'll need to implement refresh token endpoint)
  private async refreshToken(): Promise<string> {
    // If refresh is already in progress, return the existing promise
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

    this.refreshTokenPromise = this.performTokenRefresh();
    
    try {
      const newToken = await this.refreshTokenPromise;
      this.refreshTokenPromise = null;
      return newToken;
    } catch (error) {
      this.refreshTokenPromise = null;
      await this.clearToken();
      throw error;
    }
  }

  private async performTokenRefresh(): Promise<string> {
    // This would typically call a refresh endpoint
    // For now, we'll just throw an error to force re-login
    throw new Error("Session expired. Please login again.");
  }

  // Proactive session check before making requests
  private async ensureValidSession(): Promise<void> {
    if (!this.isSessionValid) {
      await this.validateSession();
    }
    
    if (!this.isSessionValid) {
      throw new Error("انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.");
    }
  }

  // Generic API request method with retry logic and session management
  async request(
    endpoint: string,
    options: RequestInit = {},
    maxRetries: number = 3,
    skipAuth: boolean = false
  ) {
    // Proactive session validation for authenticated requests
    if (!skipAuth) {
      await this.ensureValidSession();
    }

    const url = `${this.baseUrl}${endpoint}`;

    // Check if body is FormData to handle Content-Type appropriately
    const isFormData = options.body instanceof FormData;

    const config: RequestInit = {
      headers: {
        // Only set Content-Type to application/json if not using FormData
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...options.headers,
      },
      ...options,
    };

    // Add authorization header if token exists and not skipping auth
    if (!skipAuth) {
      const token = await this.getToken();
      if (token) {
        (config.headers as Record<string, string>)["Authorization"] =
          `Bearer ${token}`;
      }
    }

    let lastError: Error = new Error("Unknown error");

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Check network connectivity before making request
        if (attempt === 0) {
          const isConnected = await testConnectivity();
          if (!isConnected) {
            throw new Error(
              "لا يوجد اتصال بالإنترنت. يرجى التحقق من اتصالك بالشبكة."
            );
          }
        }

        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(url, {
          ...config,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Handle different response status codes
        if (!response.ok) {
          // Try to get error data from response
          let errorData: any = {};
          try {
            errorData = await response.json();
          } catch (parseError) {
            // If response is not JSON, create a generic error
            errorData = { message: `HTTP Error: ${response.status} ${response.statusText}` };
          }

          // Handle specific error codes
          if (response.status === 403) {
            // This is likely the "لا توجد متاجر معتمدة" error
            throw new Error(errorData.message || "لا توجد متاجر معتمدة");
          } else if (response.status === 500) {
            throw new Error("خطأ في الخادم. يرجى المحاولة مرة أخرى مجدداً.");
          } else if (response.status === 404) {
            throw new Error(
              "الخدمة غير متوفرة. يرجى التحقق من إعدادات التطبيق."
            );
          } else if (response.status === 401) {
            // Handle session expiration more gracefully
            this.isSessionValid = false;
            
            // Don't automatically clear token, let the refresh logic handle it
            // This gives a chance to try token refresh first
            
            // If this isn't the first attempt, clear the token
            if (attempt > 0) {
              await this.clearToken();
              throw new Error("انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.");
            }
            
            // Try to refresh token on first 401
            try {
              await this.refreshToken();
              // If refresh succeeds, the retry logic will continue
              throw new Error("Token refreshed, retrying request...");
            } catch (refreshError) {
              await this.clearToken();
              throw new Error("انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.");
            }
          } else if (response.status >= 400 && response.status < 500) {
            throw new Error(
              errorData.message || `خطأ في الطلب: ${response.status}`
            );
          } else {
            throw new Error(
              errorData.message || `خطأ في الخادم: ${response.status}`
            );
          }
        }

        return await response.json();
      } catch (error: any) {
        lastError = error;
        console.error(
          `API request attempt ${attempt + 1} failed for ${url}:`,
          error
        );

        // Don't retry on client errors (4xx) except network errors
        if (
          error.message?.includes("Network request failed") ||
          error.message?.includes("اتصال") ||
          error.name === "TypeError" ||
          error.name === "AbortError"
        ) {
          // Wait before retrying (exponential backoff)
          if (attempt < maxRetries) {
            const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
            console.log(`Retrying in ${delay}ms...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }
        }

        // For non-network errors, don't retry
        break;
      }
    }

    // If we get here, all retries failed
    throw lastError || new Error("فشل في الاتصال بالخادم بعد عدة محاولات");
  }

  // Authentication methods
  login(credentials: { phone: string; password: string; role?: string }) {
    return this.request(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify(credentials),
      },
      3,
      true
    ); // skipAuth: true
  }

  register(merchantData: { name: string; phone: string; password: string }) {
    return this.request(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify(merchantData),
      },
      3,
      true
    ); // skipAuth: true
  }

  // Get current user profile
  getProfile() {
    return this.request("/auth/me");
  }

  // Password reset methods
  requestPasswordReset(phone: string) {
    return this.request(
      "/auth/request-password-reset",
      {
        method: "POST",
        body: JSON.stringify({ phone }),
      },
      3,
      true
    ); // skipAuth: true
  }

  resetPassword(data: {
    phone: string;
    resetCode: string;
    newPassword: string;
  }) {
    return this.request(
      "/auth/reset-password",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      3,
      true
    ); // skipAuth: true
  }

  async logout() {
    try {
      const url = `${this.baseUrl}/auth/logout`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        return await response.json();
      } else {
        // Don't throw, just log
        console.warn("Logout request failed, but proceeding with local logout");
        return { success: true };
      }
    } catch (error: any) {
      // Logout should not fail the client logout process
      console.warn(
        "Logout request failed, but proceeding with local logout:",
        error.message
      );
      return { success: true };
    }
  }

  updateProfile(profileData: any) {
    return this.request("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  }

  // Products methods
  getProducts() {
    return this.request("/store/products");
  }

  addProduct(productData: any) {
    const formData = new FormData();

    Object.keys(productData).forEach((key) => {
      if (key === "image" && productData[key]) {
        // Handle image as file URI
        const imageUri = productData[key];
        const fileName = imageUri.split("/").pop() || "image.jpg";
        const fileExtension = fileName.split(".").pop()?.toLowerCase() || "jpg";
        const fileType = `image/${fileExtension === "jpg" ? "jpeg" : fileExtension}`;

        formData.append("image", {
          uri: imageUri,
          type: fileType,
          name: fileName,
        } as any);
      } else {
        formData.append(key, productData[key]);
      }
    });

    return this.request("/store/products", {
      method: "POST",
      body: formData,
      headers: {
        // Don't include Content-Type header for FormData (it will be set automatically)
        // 'Content-Type': 'multipart/form-data' // This is handled automatically by fetch
      },
    });
  }

  updateProduct(productId: string, productData: any) {
    return this.request(`/store/products/${productId}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    });
  }

  deleteProduct(productId: string) {
    return this.request(`/store/products/${productId}`, {
      method: "DELETE",
    });
  }

  toggleProductAvailability(productId: string) {
    return this.request(`/store/products/${productId}/toggle-availability`, {
      method: "PATCH",
    });
  }

  getProductById(productId: string) {
    return this.request(`/store/products/${productId}`);
  }

  // Orders methods
  getOrders() {
    return this.request("/store/orders");
  }

  getOrder(orderId: string) {
    return this.request(`/store/orders/${orderId}`);
  }

  updateOrderStatus(orderId: string, status: string) {
    return this.request(`/store/orders/${orderId}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  }

  // Statistics methods
  getStatistics() {
    console.log("Fetching store statistics...");
    return this.request("/store/statistics");
  }

  // Update store coordinates
  updateStoreCoordinates(coordinates: { lat: number; lng: number }) {
    return this.request("/store/my-store/coordinates", {
      method: "PUT",
      body: JSON.stringify({ coordinates }),
    });
  }

  // Get all stores for the current owner
  getMyStores() {
    return this.request("/store/my-store");
  }

  // Upload image
  uploadImage(imageUri: string) {
    const formData = new FormData();
    const fileName = imageUri.split("/").pop() || "image.jpg";
    const fileExtension = fileName.split(".").pop()?.toLowerCase() || "jpg";
    const fileType = `image/${fileExtension === "jpg" ? "jpeg" : fileExtension}`;

    formData.append("image", {
      uri: imageUri,
      type: fileType,
      name: fileName,
    } as any);

    return this.request("/upload/image", {
      method: "POST",
      body: formData,
    });
  }

  // Create store application
  createStoreApplication(storeData: {
    name: string;
    description?: string;
    coordinates: { lat: number; lng: number };
    documents?: string[];
    image?: string;
    categoryId?: string;
  }) {
    const formData = new FormData();
    formData.append("name", storeData.name);
    if (storeData.description) {
      formData.append("description", storeData.description);
    }
    formData.append("coordinates", JSON.stringify(storeData.coordinates));
    if (storeData.documents) {
      formData.append("documents", JSON.stringify(storeData.documents));
    }

    if (storeData.image) {
      const fileName = storeData.image.split("/").pop() || "store_image.jpg";
      const fileExtension = fileName.split(".").pop()?.toLowerCase() || "jpg";
      const fileType = `image/${fileExtension === "jpg" ? "jpeg" : fileExtension}`;

      formData.append("image", {
        uri: storeData.image,
        type: fileType,
        name: fileName,
      } as any);
    }

    // Add categoryId if provided
    if (storeData.categoryId) {
      formData.append("categoryId", storeData.categoryId);
    }

    return this.request("/store/my-store/application", {
      method: "POST",
      body: formData,
      headers: {
        // Don't set Content-Type header for FormData (it will be set automatically)
      },
    });
  }

  // Get all categories
  getCategories() {
    return this.request("/categories", {}, 3, true); // skipAuth: true
  }
}

export default new ApiService();
