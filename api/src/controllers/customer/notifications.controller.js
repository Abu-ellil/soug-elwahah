const Notification = require("../../models/Notification");

const getMyNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = "false" } = req.query;

    const filter = {
      userId: req.userId,
      userType: "User",
    };

    if (unreadOnly === "true") {
      filter.isRead = false;
    }

    const notifications = await Notification.find(filter)
      .sort({ sentAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({
      ...filter,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
      message: "تم جلب الإشعارات بنجاح",
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findOne({
      _id: notificationId,
      userId: req.userId,
      userType: "User",
    });

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "الإشعار غير موجود" });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.status(200).json({
      success: true,
      message: "تم تعليم الإشعار كمقروء",
    });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        userId: req.userId,
        userType: "User",
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    res.status(200).json({
      success: true,
      message: "تم تعليم جميع الإشعارات كمقروءة",
    });
  } catch (error) {
    console.error("Mark all as read error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findOne({
      _id: notificationId,
      userId: req.userId,
      userType: "User",
    });

    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "الإشعار غير موجود" });
    }

    await Notification.findByIdAndDelete(notificationId);

    res.status(200).json({
      success: true,
      message: "تم حذف الإشعار بنجاح",
    });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

const updateFcmToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;

    if (!fcmToken) {
      return res
        .status(400)
        .json({ success: false, message: "رمز الإشعار مطلوب" });
    }

    await User.findByIdAndUpdate(req.userId, { fcmToken }, { new: true });

    res.status(200).json({
      success: true,
      message: "تم تحديث رمز الإشعار بنجاح",
    });
  } catch (error) {
    console.error("Update FCM token error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  updateFcmToken,
};
