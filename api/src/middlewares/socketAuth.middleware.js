const jwt = require("../utils/jwt");

// Socket.IO authentication middleware
const socketAuth = (socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.query.token;

  if (!token) {
    return next(new Error("Authentication token required"));
  }

  try {
    const decoded = jwt.verifyToken(token);
    socket.userId = decoded.userId;
    socket.userRole = decoded.role;
    socket.userPhone = decoded.phone;
    next();
  } catch (error) {
    console.error("Socket authentication error:", error);
    next(new Error("Authentication failed"));
  }
};

// Function to broadcast to specific user
const broadcastToUser = (io, userId, event, data) => {
  io.to(`user_${userId}`).emit(event, data);
};

// Function to broadcast to specific role and user
const broadcastToRoleUser = (io, role, userId, event, data) => {
  io.to(`${role}_${userId}`).emit(event, data);
};

// Function to broadcast to multiple users
const broadcastToUsers = (io, userIds, event, data) => {
  userIds.forEach(userId => {
    broadcastToUser(io, userId, event, data);
  });
};

// Function to broadcast to all connected clients
const broadcastToAll = (io, event, data) => {
  io.emit(event, data);
};

// Function to broadcast to specific room
const broadcastToRoom = (io, room, event, data) => {
  io.to(room).emit(event, data);
};

module.exports = {
  socketAuth,
  broadcastToUser,
  broadcastToRoleUser,
  broadcastToUsers,
  broadcastToAll,
  broadcastToRoom,
};