const express = require("express");
const router = express.Router();
const { isCustomer } = require("../../middlewares/auth.middleware");

// Auth routes - public
router.use("/auth", require("./auth.routes"));

// Public routes - no authentication required
router.use("/stores", require("./stores.routes"));
router.use("/products", require("./products.routes"));

// Apply customer auth to remaining routes only
router.use(isCustomer);

// Sub-routes
router.use("/profile", require("./profile.routes"));
router.use("/addresses", require("./addresses.routes"));
router.use("/orders", require("./orders.routes"));
router.use("/tracking", require("./tracking.routes"));
router.use("/notifications", require("./notifications.routes"));

module.exports = router;
 