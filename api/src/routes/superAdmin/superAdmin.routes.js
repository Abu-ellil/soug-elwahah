const express = require("express");
const router = express.Router();
const superAdminController = require("../../controllers/superAdminController");
const { isSuperAdmin } = require("../../middlewares/auth.middleware");

// Public routes for super admin
router.post("/register", superAdminController.registerSuperAdmin);
router.post("/login", superAdminController.loginSuperAdmin);

// Protected routes for super admin only
router.use(isSuperAdmin);

router.get("/users", superAdminController.getAllUsers);
router.get("/stores", superAdminController.getAllStores);
router.get("/orders", superAdminController.getAllOrders);
router.get("/stats", superAdminController.getSystemStats);

router.patch("/users/:role/:userId", superAdminController.updateUserStatus);
router.patch("/stores/:storeId", superAdminController.updateStoreStatus);

module.exports = router;