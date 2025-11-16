const express = require("express");
const router = express.Router();
const notificationsController = require("../../controllers/customer/notifications.controller");

router.get("/", notificationsController.getMyNotifications);
router.patch("/:notificationId/read", notificationsController.markAsRead);
router.patch("/read-all", notificationsController.markAllAsRead);
router.delete("/:notificationId", notificationsController.deleteNotification);
router.post("/token", notificationsController.updateFcmToken);

module.exports = router;
