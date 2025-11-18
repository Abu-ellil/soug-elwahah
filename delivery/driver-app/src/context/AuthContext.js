import React, { createContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Initial state
const initialState = {
  isLoggedIn: false,
  token: null,
  driver: null,
  loading: true,
};

// Auth Context
export const AuthContext = createContext();

// Auth Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isLoggedIn: true,
        token: action.token,
        driver: action.driver,
        loading: false,
      };
    case 'LOGIN_FAIL':
      return { ...state, loading: false };
    case 'LOGOUT':
      return { ...initialState, loading: false };
    case 'RESTORE_TOKEN':
      return {
        ...state,
        token: action.token,
        driver: action.driver,
        isLoggedIn: !!action.token,
        loading: false,
      };
    default:
      return state;
  }
};

// Auth Provider
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing token on app start
  useEffect(() => {
    console.log('AuthContext: bootstrapAsync effect running');
    const bootstrapAsync = async () => {
      let token;
      let driver;

      try {
        token = await AsyncStorage.getItem('userToken');
        console.log('AuthContext: retrieved token:', token);
        const driverData = await AsyncStorage.getItem('driverData');
        console.log('AuthContext: retrieved driverData:', driverData);
        if (driverData) {
          driver = JSON.parse(driverData);
          console.log('AuthContext: parsed driver:', driver);
        }
      } catch (e) {
        // Handle error
        console.error('Error restoring token:', e);
      }

      console.log('AuthContext: dispatching RESTORE_TOKEN with', { token, driver });
      dispatch({ type: 'RESTORE_TOKEN', token, driver });
    };

    bootstrapAsync();
  }, []);

  // Login function
  const login = async (phone, password) => {
    dispatch({ type: 'LOGIN_START' });

    try {
      // In a real app, you would call your API here
      // For mock data, we'll simulate the login
      const mockDriver = {
        id: 'driver1',
        name: 'محمد السائق',
        phone: '010111222',
        avatar: 'https://via.placeholder.com/200?text=Driver1',
        rating: 4.8,
        totalOrders: 145,
        totalEarnings: 4350.00,
        vehicleType: 'motorcycle',
        vehicleNumber: 'أ ب ج 1234',
        isAvailable: true,
        isActive: true,
        coordinates: { lat: 31.1110, lng: 30.9390 },
        documents: {
          nationalId: 'url_here',
          drivingLicense: 'url_here',
          isVerified: true
        },
        verificationStatus: 'approved',
        createdAt: '2024-12-01T10:00:00',
      };

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Save token and driver data to AsyncStorage
      await AsyncStorage.setItem('userToken', 'mock_token_123');
      await AsyncStorage.setItem('driverData', JSON.stringify(mockDriver));

      dispatch({
        type: 'LOGIN_SUCCESS',
        token: 'mock_token_123',
        driver: mockDriver,
      });

      return { success: true };
    } catch (error) {
      dispatch({ type: 'LOGIN_FAIL' });
      return { success: false, error: error.message };
    }
  };

 // Logout function
 const logout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('driverData');
    } catch (e) {
      console.error('Error during logout:', e);
    }
    dispatch({ type: 'LOGOUT' });
 };

  // Register function (simplified for now)
  const register = async (driverData) => {
    try {
      // In a real app, you would call your API here
      // For mock data, we'll just return success
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};