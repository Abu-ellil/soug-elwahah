const express = require("express");
const router = express.Router();
const driverAuthController = require("../../controllers/driver/auth.controller");
const { authMiddleware } = require("../../middlewares/auth.middleware");

// Public routes
router.post("/register", driverAuthController.register);
router.post("/login", driverAuthController.login);
router.post("/request-password-reset", driverAuthController.requestPasswordReset);
router.post("/reset-password", driverAuthController.resetPassword);

// Protected routes
router.use(authMiddleware);
router.get("/profile", driverAuthController.getProfile);
router.post("/logout", driverAuthController.logout);

module.exports = router;