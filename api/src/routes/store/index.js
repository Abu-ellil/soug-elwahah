const express = require("express");
const router = express.Router();
const { isStoreOwner } = require("../../middlewares/auth.middleware");
const storeController = require("../../controllers/store/store.controller");

// Public routes - no authentication required
router.get("/", storeController.getAllStores); // Get all public store information

// Protected routes - require store owner authentication
router.use(isStoreOwner);

router.use("/profile", require("./profile.routes"));
router.use("/my-store", require("./store.routes"));
router.use("/products", require("./products.routes"));
router.use("/orders", require("./orders.routes"));
router.use("/statistics", require("./statistics.routes"));
router.use("/notifications", require("./notifications.routes"));

module.exports = router;
