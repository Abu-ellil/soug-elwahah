const express = require("express");
const router = express.Router();
const profileController = require("../../controllers/driver/profile.controller");

router.get("/", profileController.getProfile);
router.put("/", profileController.updateProfile);
router.patch("/toggle-availability", profileController.toggleAvailability);

module.exports = router;
