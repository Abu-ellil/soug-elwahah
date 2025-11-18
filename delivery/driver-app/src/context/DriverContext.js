import React, { createContext, useReducer, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from './AuthContext';

// Initial state
const initialState = {
  currentDriver: null,
  isAvailable: false,
  currentLocation: null,
  stats: {
    todayOrders: 0,
    todayEarnings: 0,
    todayHours: 0,
    totalCompleted: 0,
    averageRating: 0,
    weeklyEarnings: 0,
  },
  loading: false,
};

// Driver Context
export const DriverContext = createContext();

// Driver Reducer
const driverReducer = (state, action) => {
  switch (action.type) {
    case 'SET_DRIVER':
      return { ...state, currentDriver: action.driver };
    case 'SET_AVAILABILITY':
      return { ...state, isAvailable: action.isAvailable };
    case 'SET_LOCATION':
      return { ...state, currentLocation: action.location };
    case 'SET_STATS':
      return { ...state, stats: action.stats };
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
    case 'UPDATE_DRIVER_PROFILE':
      return { ...state, currentDriver: { ...state.currentDriver, ...action.profile } };
    default:
      return state;
  }
};

// Driver Provider
export const DriverProvider = ({ children }) => {
  const [state, dispatch] = useReducer(driverReducer, initialState);
 const { logout } = useContext(AuthContext);

  // Toggle driver availability
  const toggleAvailability = async () => {
    try {
      dispatch({ type: 'SET_LOADING', loading: true });
      
      // In a real app, you would call your API here
      // For mock data, we'll just toggle the local state
      const newAvailability = !state.isAvailable;
      
      // Update driver in context
      if (state.currentDriver) {
        const updatedDriver = { ...state.currentDriver, isAvailable: newAvailability };
        dispatch({ type: 'SET_DRIVER', driver: updatedDriver });
        
        // Save to AsyncStorage
        await AsyncStorage.setItem('driverData', JSON.stringify(updatedDriver));
      }
      
      dispatch({ type: 'SET_AVAILABILITY', isAvailable: newAvailability });
      dispatch({ type: 'SET_LOADING', loading: false });
      
      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_LOADING', loading: false });
      return { success: false, error: error.message };
    }
  };

  // Update driver location
 const updateLocation = async (coordinates) => {
    try {
      dispatch({ type: 'SET_LOCATION', location: coordinates });
      
      // In a real app, you would update the location to your API
      // For mock data, we'll just update local state
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Update driver profile
 const updateProfile = async (profileData) => {
    try {
      dispatch({ type: 'SET_LOADING', loading: true });
      
      if (state.currentDriver) {
        const updatedDriver = { ...state.currentDriver, ...profileData };
        dispatch({ type: 'UPDATE_DRIVER_PROFILE', profile: profileData });
        
        // Save to AsyncStorage
        await AsyncStorage.setItem('driverData', JSON.stringify(updatedDriver));
      }
      
      dispatch({ type: 'SET_LOADING', loading: false });
      
      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_LOADING', loading: false });
      return { success: false, error: error.message };
    }
  };

  // Get driver stats
  const getDriverStats = async () => {
    try {
      dispatch({ type: 'SET_LOADING', loading: true });
      
      // In a real app, you would fetch stats from your API
      // For mock data, we'll return some sample stats
      const mockStats = {
        todayOrders: 5,
        todayEarnings: 75.00,
        todayHours: 4.5,
        totalCompleted: 145,
        averageRating: 4.8,
        weeklyEarnings: 435.00,
      };
      
      dispatch({ type: 'SET_STATS', stats: mockStats });
      dispatch({ type: 'SET_LOADING', loading: false });
      
      return { success: true, stats: mockStats };
    } catch (error) {
      dispatch({ type: 'SET_LOADING', loading: false });
      return { success: false, error: error.message };
    }
  };

  return (
    <DriverContext.Provider
      value={{
        ...state,
        toggleAvailability,
        updateLocation,
        updateProfile,
        getDriverStats,
      }}
    >
      {children}
    </DriverContext.Provider>
  );
};