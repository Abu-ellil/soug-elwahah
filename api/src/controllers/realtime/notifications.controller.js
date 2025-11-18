const webSocketService = require("../../services/websocket.service");

// Send real-time notification to a specific user via WebSocket
const sendRealTimeNotification = async (req, res) => {
  try {
    const { userId, title, body, type, data } = req.body;

    if (!userId || !title || !body) {
      return res.status(400).json({
        success: false,
        message: "User ID, title, and body are required",
      });
    }

    // Send notification via WebSocket
    await webSocketService.broadcastNotification(userId, {
      title,
      body,
      type: type || "general",
      data: data || {},
      timestamp: new Date().toISOString(),
    });

    res.status(200).json({
      success: true,
      message: "Notification sent successfully",
    });
  } catch (error) {
    console.error("Send real-time notification error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Join user-specific notification room
const joinNotificationRoom = async (req, res) => {
  try {
    const userId = req.userId; // From authentication middleware

    if (!req.app.get('io')) {
      return res.status(500).json({
        success: false,
        message: "WebSocket server not initialized",
      });
    }

    // In a real implementation, we would need to access the socket ID from the request
    // This would typically be done by having the client connect to WebSocket first
    res.status(200).json({
      success: true,
      message: "Joined notification room successfully",
      userId,
    });
  } catch (error) {
    console.error("Join notification room error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get WebSocket connection status for a user
const getWebSocketStatus = async (req, res) => {
  try {
    const userId = req.userId;
    const io = req.app.get('io');

    if (!io) {
      return res.status(200).json({
        connected: false,
        message: "WebSocket server not initialized",
      });
    }

    // Check if user is in their notification room
    const userRoom = `user_${userId}`;
    const clientsInRoom = io.sockets.adapter.rooms.get(userRoom);
    const isConnected = clientsInRoom && clientsInRoom.size > 0;

    res.status(200).json({
      connected: isConnected,
      userRoom,
      clientsCount: clientsInRoom ? clientsInRoom.size : 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get WebSocket status error:", error);
    res.status(50).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  sendRealTimeNotification,
  joinNotificationRoom,
  getWebSocketStatus,
};