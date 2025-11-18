const express = require("express");
const router = express.Router();
const storeAuthController = require("../../controllers/store/auth.controller");
const { authMiddleware } = require("../../middlewares/auth.middleware");
const upload = require("../../middlewares/upload.middleware");

// Public routes
router.post("/register", upload.single("storeImage"), storeAuthController.register);
router.post("/login", storeAuthController.login);
router.post("/request-password-reset", storeAuthController.requestPasswordReset);
router.post("/reset-password", storeAuthController.resetPassword);

// Protected routes
router.use(authMiddleware);
router.get("/profile", storeAuthController.getProfile);
router.post("/logout", storeAuthController.logout);

module.exports = router;