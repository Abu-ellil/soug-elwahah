const express = require("express");
const router = express.Router();
const { isCustomer } = require("../../middlewares/auth.middleware");

// Apply customer auth to all routes
router.use(isCustomer);

// Sub-routes
router.use("/profile", require("./profile.routes"));
router.use("/addresses", require("./addresses.routes"));
router.use("/stores", require("./stores.routes"));
router.use("/products", require("./products.routes"));
router.use("/orders", require("./orders.routes"));
router.use("/tracking", require("./tracking.routes"));
router.use("/notifications", require("./notifications.routes"));

module.exports = router;
