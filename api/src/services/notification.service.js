const admin = require("../config/firebase");
const Notification = require("../models/Notification");
const User = require("../models/User");
const StoreOwner = require("../models/StoreOwner");
const Driver = require("../models/Driver");

class NotificationService {
  // Send to single device
  async sendToDevice(fcmToken, title, body, data = {}) {
    try {
      const message = {
        notification: { title, body },
        data: { ...data },
        token: fcmToken,
        android: {
          priority: "high",
          notification: {
            sound: "default",
            channelId: "orders",
          },
        },
        apns: {
          payload: {
            aps: {
              sound: "default",
              badge: 1,
            },
          },
        },
      };

      const response = await admin.messaging().send(message);
      return { success: true, messageId: response };
    } catch (error) {
      console.error("FCM Send Error:", error);
      return { success: false, error: error.message };
    }
  }

  // Send to multiple devices
  async sendToMultipleDevices(fcmTokens, title, body, data = {}) {
    try {
      const message = {
        notification: { title, body },
        data: { ...data },
        tokens: fcmTokens,
        android: {
          priority: "high",
          notification: {
            sound: "default",
            channelId: "orders",
          },
        },
      };

      const response = await admin.messaging().sendMulticast(message);
      return { success: true, successCount: response.successCount };
    } catch (error) {
      console.error("FCM Multicast Error:", error);
      return { success: false, error: error.message };
    }
  }

  // Log notification in database
  async logNotification(userId, userType, title, body, type, data = {}) {
    try {
      const notification = await Notification.create({
        userId,
        userType,
        title,
        body,
        type,
        data,
      });
      return notification;
    } catch (error) {
      console.error("Log Notification Error:", error);
      return null;
    }
  }

  // Send and Log
  async sendAndLog(fcmToken, userId, userType, title, body, type, data = {}) {
    // Send push notification
    const sendResult = await this.sendToDevice(fcmToken, title, body, data);

    // Log in database
    await this.logNotification(userId, userType, title, body, type, data);

    return sendResult;
  }
}

module.exports = new NotificationService();
