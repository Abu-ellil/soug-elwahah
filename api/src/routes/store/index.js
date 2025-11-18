const express = require("express");
const router = express.Router();
const { isStoreOwner, isStoreOwnerWithApprovedStore } = require("../../middlewares/auth.middleware");
const storeController = require("../../controllers/store/store.controller");

// Public routes - no authentication required
router.get("/", storeController.getAllStores); // Get all public store information

// Protected routes - require store owner authentication
router.use(isStoreOwner);

// Profile routes can be accessed by any store owner (even pending)
router.use("/profile", require("./profile.routes"));

// My store routes - GET is allowed for pending stores, others require approval
router.use("/my-store", require("./store.routes"));

// Products, orders, statistics, and notifications require approved store
router.use("/products", isStoreOwnerWithApprovedStore, require("./products.routes"));
router.use("/orders", isStoreOwnerWithApprovedStore, require("./orders.routes"));
router.use("/statistics", isStoreOwnerWithApprovedStore, require("./statistics.routes"));
router.use("/notifications", isStoreOwnerWithApprovedStore, require("./notifications.routes"));

module.exports = router;
