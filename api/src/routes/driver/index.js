const express = require("express");
const router = express.Router();
const { isDriver } = require("../../middlewares/auth.middleware");

// Auth routes - public
router.use("/auth", require("./auth.routes"));

router.use(isDriver);

router.use("/profile", require("./profile.routes"));
router.use("/orders", require("./orders.routes"));
router.use("/tracking", require("./tracking.routes"));
router.use("/earnings", require("./earnings.routes"));
router.use("/notifications", require("./notifications.routes"));

module.exports = router;
