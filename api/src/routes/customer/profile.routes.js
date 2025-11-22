const express = require("express");
const router = express.Router();
const profileController = require("../../controllers/customer/profile.controller");

router.get("/", profileController.getProfile);
router.put("/", profileController.updateProfile);

module.exports = router;
