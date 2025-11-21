import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API } from '../services/api';
import { saveUser, getUser, removeUser, saveToken, getToken, removeToken } from '../utils/storage';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // الحالة - State
      currentUser: null,
      isLoading: false,
      token: null,
      isAuthenticated: false,

      // الإجراءات - Actions
      loadUser: async () => {
        set({ isLoading: true });
        try {
          const user = await getUser();
          const token = await getToken();

          if (user && token) {
            set({
              currentUser: user,
              token: token,
              isAuthenticated: true,
            });
          }
        } catch (error) {
          console.error('خطأ في تحميل المستخدم:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      login: async (phone, password) => {
        set({ isLoading: true });
        try {
          const response = await API.authAPI.login({ phone, password });

          if (response.success) {
            const {
              data: { user },
              token,
            } = response;

            // Save token and user data
            await saveToken(token);

            // Remove password from user data before saving
            const userData = { ...user };
            delete userData.password;
            await saveUser(userData);

            set({
              currentUser: userData,
              token: token,
              isAuthenticated: true,
              isLoading: false,
            });

            return { success: true, user: userData };
          } else {
            set({ isLoading: false });
            return {
              success: false,
              error: response.message || 'رقم الموبايل أو كلمة المرور غير صحيحة',
            };
          }
        } catch (error) {
          console.error('خطأ في تسجيل الدخول:', error);
          set({ isLoading: false });
          return { success: false, error: error.message || 'حدث خطأ أثناء تسجيل الدخول' };
        }
      },

      register: async (userData) => {
        set({ isLoading: true });
        try {
          const response = await API.authAPI.registerCustomer(userData);

          if (response.success) {
            const {
              data: { user },
              token,
            } = response;

            // Save token and user data
            await saveToken(token);

            // Remove password from user data before saving
            const userDataToSave = { ...user };
            delete userDataToSave.password;
            await saveUser(userDataToSave);

            set({
              currentUser: userDataToSave,
              token: token,
              isAuthenticated: true,
              isLoading: false,
            });

            return { success: true, user: userDataToSave };
          } else {
            set({ isLoading: false });
            return { success: false, error: response.message || 'حدث خطأ أثناء التسجيل' };
          }
        } catch (error) {
          console.error('خطأ في التسجيل:', error);
          set({ isLoading: false });
          return { success: false, error: error.message || 'حدث خطأ أثناء التسجيل' };
        }
      },

      logout: async () => {
        try {
          await removeUser();
          await removeToken();

          set({
            currentUser: null,
            token: null,
            isAuthenticated: false,
          });
        } catch (error) {
          console.error('خطأ في تسجيل الخروج:', error);
        }
      },

      updateProfile: async (profileData) => {
        const { token } = get();
        if (!token) {
          return { success: false, error: 'غير مصادق عليه' };
        }

        try {
          const response = await API.profileAPI.updateProfile(profileData, token);

          if (response.success) {
            const updatedUser = { ...response.data.user };
            delete updatedUser.password;
            await saveUser(updatedUser);

            set({ currentUser: updatedUser });
            return { success: true, user: updatedUser };
          } else {
            return { success: false, error: response.message };
          }
        } catch (error) {
          console.error('خطأ في تحديث الملف الشخصي:', error);
          return { success: false, error: error.message };
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage, {
        reviver: (key, value) => value,
        replacer: (key, value) => value,
      }),
      partialize: (state) => ({
        currentUser: state.currentUser,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.log('Error rehydrating auth storage:', error);
        }
      },
    }
  )
);
