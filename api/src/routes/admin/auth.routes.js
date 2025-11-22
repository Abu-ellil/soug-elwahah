const express = require("express");
const router = express.Router();
const adminController = require("../../controllers/admin.controller");
const superAdminController = require("../../controllers/superAdminController");
const { isAdminOrSuperAdmin } = require("../../middlewares/auth.middleware");

// Admin auth routes (public)
router.post("/login", adminController.loginAdmin);

// Protected routes for authenticated admin users
router.use(isAdminOrSuperAdmin); // Use general admin middleware to protect these routes
router.get("/me", adminController.getAdminProfile);
router.post("/logout", (req, res) => {
  // For logout, we just need to clear the token on the client side
  // The server doesn't maintain session state for JWTs
  res.json({ success: true, message: "Logged out successfully" });
});

module.exports = router;