const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload.middleware");
const authController = require("../controllers/auth.controller");

// Public routes
router.post("/customer/register", authController.registerCustomer);
router.post("/store/register", upload.single("storeImage"), authController.registerStoreOwner);
router.post("/driver/register", authController.registerDriver);

// Separate login routes for each user type
router.post("/customer/login", (req, res) => {
  req.body.role = "customer";
  authController.login(req, res);
}); 
router.post("/store/login", (req, res) => {
  req.body.role = "store";
  authController.login(req, res);
});
router.post("/driver/login", (req, res) => {
  req.body.role = "driver";
  authController.login(req, res);
});

// Keep the generic login route for backward compatibility
router.post("/login", authController.login);

// Protected routes
router.get(
  "/me",
  require("../middlewares/auth.middleware").authMiddleware,
  authController.getMe
);

module.exports = router;
