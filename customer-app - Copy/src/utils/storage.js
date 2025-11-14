import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys
const CART_KEY = 'cart';
const USER_KEY = 'user';

// Helper function to safely parse JSON and handle type conversion
const safeJsonParse = (data, defaultValue = null) => {
  if (!data) return defaultValue;

  try {
    const parsed = JSON.parse(data);
    // Process the parsed data to ensure correct types
    return processForStorage(parsed);
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return defaultValue;
  }
};

// Cart Storage
export const saveCart = async (cart) => {
  try {
    // Deep clone and ensure all types are properly set before storing
    const deeplyProcessedCart = processForStorage(cart);
    // Convert to JSON string
    const jsonString = JSON.stringify(deeplyProcessedCart);
    await AsyncStorage.setItem(CART_KEY, jsonString);
  } catch (error) {
    console.error('Error saving cart:', error);
  }
};

// Helper function to process data for storage ensuring correct types
const processForStorage = (obj) => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => processForStorage(item));
  }

  if (typeof obj === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = processForStorage(value);
    }
    return result;
  }

  if (typeof obj === 'string') {
    // Convert string representations of booleans to actual booleans
    if (obj === 'true') return true;
    if (obj === 'false') return false;
    if (obj === 'null') return null;
    if (obj === 'undefined') return undefined;

    // Convert numeric strings to numbers
    if (!isNaN(obj) && !isNaN(parseFloat(obj)) && obj.trim() !== '') {
      return parseFloat(obj);
    }

    return obj;
  }

  return obj;
};

export const getCart = async () => {
  try {
    const cartString = await AsyncStorage.getItem(CART_KEY);
    return safeJsonParse(cartString, []);
  } catch (error) {
    console.error('Error getting cart:', error);
    return [];
  }
};

export const clearCart = async () => {
  try {
    await AsyncStorage.removeItem(CART_KEY);
  } catch (error) {
    console.error('Error clearing cart:', error);
  }
};

// User Storage
export const saveUser = async (user) => {
  try {
    // Deep clone and ensure all types are properly set before storing
    const deeplyProcessedUser = processForStorage(user);
    // Convert to JSON string
    const jsonString = JSON.stringify(deeplyProcessedUser);
    await AsyncStorage.setItem(USER_KEY, jsonString);
  } catch (error) {
    console.error('Error saving user:', error);
  }
};

export const getUser = async () => {
  try {
    const userString = await AsyncStorage.getItem(USER_KEY);
    return safeJsonParse(userString, null);
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

export const removeUser = async () => {
  try {
    await AsyncStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Error removing user:', error);
  }
};
