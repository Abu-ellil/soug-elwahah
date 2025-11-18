// API Configuration for Merchant App
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5002/api';
console.log('API Base URL:', BASE_URL);

export { BASE_URL };