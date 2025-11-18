import { useAuthStore } from '../store/authStore';

// Custom hook that directly uses the Zustand store
export const useAuth = () => {
  const authStore = useAuthStore();
  
  // Return the auth state and actions in the same format as the context used to provide
  return {
    state: {
      isLoggedIn: authStore.isLoggedIn,
      token: authStore.token,
      driver: authStore.driver,
      loading: authStore.loading,
    },
    login: authStore.login,
    logout: authStore.logout,
    register: authStore.register,
    restoreAuthState: authStore.restoreAuthState,
    getDriverProfile: authStore.getDriverProfile,
    ...authStore, // Include all other store functions and state
  };
};