import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { logoutAsync } from "../src/redux/slices/authSlice";
import sessionManager from "../services/sessionManager";

interface SessionMonitorProps {
  onSessionExpired?: () => void;
  onSessionRefreshed?: () => void;
}

/**
 * SessionMonitor Component
 *
 * This component handles session management across the app:
 * - Monitors session validity
 * - Handles session expiration
 * - Provides smooth re-authentication flow
 * - Shows appropriate toast messages
 */
export default function SessionMonitor({
  onSessionExpired,
  onSessionRefreshed,
}: SessionMonitorProps) {
  const dispatch = useDispatch();

  useEffect(() => {
    // Initialize session manager with custom handlers
    sessionManager.initialize();

    // Set up event listeners for session-related events
    const handleNavigateToLogin = () => {
      console.log("Session expired, navigating to login");
      onSessionExpired?.();
      dispatch(logoutAsync() as any);
    };

    // Listen for navigation events (if using global events)
    if (
      typeof window !== "undefined" &&
      typeof window.addEventListener === "function"
    ) {
      window.addEventListener("navigate-to-login", handleNavigateToLogin);
    }

    // Proactive session check on app focus/background
    const handleAppFocus = () => {
      console.log("App focused, checking session");
      if (typeof window !== "undefined") {
        // Use the actual SessionManager instance methods
        sessionManager.checkAndHandleSession();
      }
    };

    const handleAppBlur = () => {
      console.log("App blurred");
      // Optionally perform cleanup or save state
    };

    // Add event listeners for app state changes
    // These would need to be implemented based on your app's navigation library
    // For now, we'll just initialize the session manager

    return () => {
      // Cleanup
      if (
        typeof window !== "undefined" &&
        typeof window.removeEventListener === "function"
      ) {
        window.removeEventListener("navigate-to-login", handleNavigateToLogin);
      }
      sessionManager.destroy();
    };
  }, [dispatch, onSessionExpired, onSessionRefreshed]);

  // This component doesn't render anything
  return null;
}

/**
 * Hook for manual session validation
 */
export function useSessionManager() {
  const checkSession = async () => {
    return await sessionManager.checkAndHandleSession();
  };

  const validateProactively = async () => {
    return await sessionManager.validateSessionProactively();
  };

  const getSessionStatus = async () => {
    return await sessionManager.getSessionStatus();
  };

  return {
    checkSession,
    validateProactively,
    getSessionStatus,
  };
}
