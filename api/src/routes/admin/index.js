const express = require("express");
const router = express.Router();
const adminController = require("../../controllers/admin.controller");
const { isAdmin } = require("../../middlewares/auth.middleware");

// Admin auth routes (public) - should be before the isAdmin middleware
router.use("/auth", require("./auth.routes"));

// All other admin routes require admin authentication
router.use(isAdmin);

// Routes for handling store coordinate updates
router.get(
  "/stores/pending-coordinates",
  adminController.getStoresWithPendingCoordinates
);
router.patch(
  "/stores/:storeId/approve-coordinates",
  adminController.approveStoreCoordinates
);
router.patch(
  "/stores/:storeId/reject-coordinates",
  adminController.rejectStoreCoordinates
);

// Analytics routes
router.use("/analytics", require("./analytics.routes"));

// Categories routes - added to fix the missing callback function error
router.get("/categories", (req, res) => {
  res.json({ success: true, message: "Categories route is working" });
});

// Orders routes
router.get("/orders", adminController.getAllOrders);
router.get("/orders/:orderId", adminController.getOrderById);
router.patch("/orders/:orderId", adminController.updateOrder);
router.patch("/orders/:orderId/cancel", adminController.cancelOrder);

// Stores routes
router.get("/stores/pending", adminController.getPendingStores);
router.get("/stores", adminController.getAllStores);
router.get("/stores/:id", adminController.getStoreById);
router.patch("/stores/:id", adminController.updateStore);
router.patch("/stores/:id/approve", adminController.approveStore);
router.patch("/stores/:id/reject", adminController.rejectStore);
router.delete("/stores/:id", adminController.deleteStore);

// Drivers routes
router.get("/drivers/pending", adminController.getPendingDrivers);
router.get("/drivers", adminController.getAllDrivers);
router.get("/drivers/:id", adminController.getDriverById);
router.patch("/drivers/:id", adminController.updateDriver);
router.patch("/drivers/:id/approve", adminController.approveDriver);
router.patch("/drivers/:id/reject", adminController.rejectDriver);
router.delete("/drivers/:id", adminController.deleteDriver);

// Users routes
router.get("/users", adminController.getAllUsers);
router.get("/users/:id", adminController.getUserById);
router.patch("/users/:id", adminController.updateUser);
router.delete("/users/:id", adminController.deleteUser);

// Store owners routes
router.get("/store-owners", adminController.getAllStoreOwners);

// Products routes
router.get("/products", adminController.getAllProducts);
router.get("/products/:id", adminController.getProductById);
router.patch("/products/:id", adminController.updateProduct);
router.delete("/products/:id", adminController.deleteProduct);

module.exports = router;
