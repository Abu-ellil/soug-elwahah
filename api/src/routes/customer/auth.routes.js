const express = require("express");
const router = express.Router();
const customerAuthController = require("../../controllers/customer/auth.controller");
const { authMiddleware } = require("../../middlewares/auth.middleware");

// Public routes
router.post("/register", customerAuthController.register);
router.post("/login", customerAuthController.login);
router.post("/request-password-reset", customerAuthController.requestPasswordReset);
router.post("/reset-password", customerAuthController.resetPassword);

// Protected routes
router.use(authMiddleware);
router.get("/profile", customerAuthController.getProfile);
router.post("/logout", customerAuthController.logout);

module.exports = router;