const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

// Public routes
router.post("/customer/register", authController.registerCustomer);
router.post("/store/register", authController.registerStoreOwner);
router.post("/driver/register", authController.registerDriver);
router.post("/login", authController.login);

// Protected routes
router.get(
  "/me",
  require("../middlewares/auth.middleware").authMiddleware,
  authController.getMe
);

module.exports = router;
