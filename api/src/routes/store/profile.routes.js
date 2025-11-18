const express = require("express");
const router = express.Router();
const { isStoreOwnerWithApprovedStore } = require("../../middlewares/auth.middleware");
const profileController = require("../../controllers/store/profile.controller");

// GET profile is accessible to all store owners (even pending)
router.get("/", profileController.getProfile);

// Update profile requires an approved store
router.put("/", isStoreOwnerWithApprovedStore, profileController.updateProfile);

module.exports = router;
