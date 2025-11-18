const webSocketService = require("../services/websocket.service");

// Function to join order-specific rooms
const joinOrderRoom = (socketId, orderId) => {
  webSocketService.joinRoom(socketId, `order_${orderId}`);
};

// Function to leave order-specific rooms
const leaveOrderRoom = (socketId, orderId) => {
  webSocketService.leaveRoom(socketId, `order_${orderId}`);
};

// Function to add driver to order tracking room
const addDriverToOrderRoom = (socketId, driverId, orderId) => {
  webSocketService.joinRoom(socketId, `driver_orders_${driverId}`);
  webSocketService.joinRoom(socketId, `order_${orderId}`);
};

// Function to add customer to order tracking room
const addCustomerToOrderRoom = (socketId, userId, orderId) => {
  webSocketService.joinRoom(socketId, `user_${userId}`);
  webSocketService.joinRoom(socketId, `order_${orderId}`);
};

// Function to add store owner to order tracking room
const addStoreToOrderRoom = (socketId, storeId, orderId) => {
  webSocketService.joinRoom(socketId, `store_${storeId}`);
  webSocketService.joinRoom(socketId, `order_${orderId}`);
};

module.exports = {
  joinOrderRoom,
  leaveOrderRoom,
  addDriverToOrderRoom,
  addCustomerToOrderRoom,
  addStoreToOrderRoom,
};