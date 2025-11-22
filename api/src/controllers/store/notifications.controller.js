const Notification = require("../../models/Notification");
const StoreOwner = require("../../models/StoreOwner");

// Get store owner's notifications
const getNotifications = async (req, res) => {
  try {
    const storeOwnerId = req.userId;

    const notifications = await Notification.find({ 
      userId: storeOwnerId 
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { notifications },
      message: "تم جلب الإشعارات بنجاح",
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const storeOwnerId = req.userId;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId: storeOwnerId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "الإشعار غير موجود" });
    }

    res.status(200).json({
      success: true,
      data: { notification },
      message: "تم تعليم الإشعار كمقروء",
    });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// Get unread notifications count
const getUnreadCount = async (req, res) => {
  try {
    const storeOwnerId = req.userId;

    const unreadCount = await Notification.countDocuments({ 
      userId: storeOwnerId,
      isRead: false
    });

    res.status(200).json({
      success: true,
      data: { unreadCount },
      message: "تم جلب عدد الإشعارات غير المقروءة بنجاح",
    });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const storeOwnerId = req.userId;

    await Notification.updateMany(
      { userId: storeOwnerId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: "تم تعليم جميع الإشعارات كمقروءة",
    });
  } catch (error) {
    console.error("Mark all as read error:", error);
    res.status(50).json({ success: false, message: "خطأ في الخادم" });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
