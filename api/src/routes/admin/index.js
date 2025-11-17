const express = require("express");
const router = express.Router();
const adminController = require("../../controllers/admin.controller");
const { isAdmin } = require("../../middlewares/auth.middleware");

// Admin auth routes (public) - should be before the isAdmin middleware
router.use("/auth", require("./auth.routes"));

// All other admin routes require admin authentication
router.use(isAdmin);

// Routes for handling store coordinate updates
router.get("/stores/pending-coordinates", adminController.getStoresWithPendingCoordinates);
router.patch("/stores/:storeId/approve-coordinates", adminController.approveStoreCoordinates);
router.patch("/stores/:storeId/reject-coordinates", adminController.rejectStoreCoordinates);

module.exports = router;