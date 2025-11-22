import Toast from "react-native-toast-message";
import { CommonActions } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiService from "./api";

export interface SessionManagerConfig {
  onSessionExpire?: () => void;
  onSessionRefresh?: () => void;
  showToastMessages?: boolean;
  autoLogoutDelay?: number; // milliseconds
}

class SessionManager {
  private config: SessionManagerConfig;
  private isInitialized = false;

  constructor(config: SessionManagerConfig = {}) {
    this.config = {
      showToastMessages: true,
      autoLogoutDelay: 3000, // 3 seconds
      onSessionExpire: () => {},
      onSessionRefresh: () => {},
      ...config,
    };
  }

  // Initialize session monitoring
  async initialize() {
    if (this.isInitialized) return;

    // Check for existing session on app start
    await this.checkAndHandleSession();

    this.isInitialized = true;
  }

  // Check current session and handle accordingly
  async checkAndHandleSession() {
    try {
      const token = await apiService.getToken();
      if (!token) {
        await this.handleNoSession();
        return;
      }

      const isValid = await apiService.isSessionValidAsync();

      if (!isValid) {
        await this.handleSessionExpired();
      } else {
        if (this.config.showToastMessages) {
          Toast.show({
            type: "success",
            text1: "متصل",
            text2: "جلسة العمل صالحة",
            position: "bottom",
          });
        }
      }
    } catch (error: any) {
      console.error("Session check error:", error);
      await this.handleSessionExpired();
    }
  }

  // Handle when there's no valid session
  private async handleNoSession() {
    if (this.config.showToastMessages) {
      Toast.show({
        type: "info",
        text1: "غير مسجل الدخول",
        text2: "يرجى تسجيل الدخول للمتابعة",
        position: "bottom",
      });
    }

    // Clear any stored user data
    await this.clearUserData();

    // Navigate to login if navigation is available
    this.navigateToLogin();
  }

  // Handle session expiration
  private async handleSessionExpired() {
    if (this.config.showToastMessages) {
      Toast.show({
        type: "error",
        text1: "انتهت الجلسة",
        text2: "انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.",
        position: "bottom",
        autoHide: true,
        visibilityTime: 4000,
      });
    }

    // Clear user data
    await this.clearUserData();

    // Call custom handler
    this.config.onSessionExpire?.();

    // Navigate to login after delay
    setTimeout(() => {
      this.navigateToLogin();
    }, this.config.autoLogoutDelay);
  }

  // Handle successful session refresh
  handleSessionRefreshed() {
    if (this.config.showToastMessages) {
      Toast.show({
        type: "success",
        text1: "تم تجديد الجلسة",
        text2: "تم تجديد جلسة العمل بنجاح",
        position: "bottom",
      });
    }

    this.config.onSessionRefresh?.();
  }

  // Clear user data from storage
  private async clearUserData() {
    try {
      await AsyncStorage.removeItem("user");
      await apiService.clearToken();
    } catch (error) {
      console.error("Error clearing user data:", error);
    }
  }

  // Navigate to login screen
  private navigateToLogin() {
    // This will be implemented by components that have navigation access
    // For now, just emit an event or callback
    if (
      typeof window !== "undefined" &&
      typeof window.dispatchEvent === "function"
    ) {
      window.dispatchEvent(new CustomEvent("navigate-to-login"));
    }
  }

  // Proactive session check (can be called manually)
  async validateSessionProactively(): Promise<boolean> {
    try {
      const isValid = await apiService.validateAndRefreshIfNeeded();

      if (isValid) {
        this.handleSessionRefreshed();
        return true;
      } else {
        await this.handleSessionExpired();
        return false;
      }
    } catch (error) {
      console.error("Proactive session validation error:", error);
      await this.handleSessionExpired();
      return false;
    }
  }

  // Get current session status
  async getSessionStatus() {
    try {
      const token = await apiService.getToken();
      if (!token) {
        return { hasToken: false, isValid: false };
      }

      const isValid = await apiService.isSessionValidAsync();
      return { hasToken: true, isValid };
    } catch (error) {
      return { hasToken: false, isValid: false };
    }
  }

  // Cleanup resources
  destroy() {
    this.isInitialized = false;
  }
}

// Export singleton instance
export default new SessionManager();

// Export utility functions for easier use
export const sessionManager = {
  initialize: () =>
    SessionManager.prototype.initialize.call(new SessionManager()),
  checkSession: () =>
    SessionManager.prototype.checkAndHandleSession.call(new SessionManager()),
  validateProactively: () =>
    SessionManager.prototype.validateSessionProactively.call(
      new SessionManager()
    ),
  getStatus: () =>
    SessionManager.prototype.getSessionStatus.call(new SessionManager()),
};
