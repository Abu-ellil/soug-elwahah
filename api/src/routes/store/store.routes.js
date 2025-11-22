const express = require("express");
const router = express.Router();
const { isStoreOwner, isStoreOwnerWithApprovedStore } = require("../../middlewares/auth.middleware");
const storeController = require("../../controllers/store/store.controller");
const uploadMiddleware = require("../../middlewares/upload.middleware");

// Store application - requires authenticated store owner
router.post("/application", isStoreOwner, uploadMiddleware.single("image"), storeController.createStoreApplication);

// GET routes accessible to all store owners (even pending)
router.get("/", storeController.getMyStore);
router.get("/all", storeController.getMyStores);

// Other routes require an approved store
router.put("/", isStoreOwnerWithApprovedStore, storeController.updateStore);
router.put(
  "/image",
  isStoreOwnerWithApprovedStore,
  uploadMiddleware.single("image"),
  storeController.updateStoreImage
);
router.patch("/toggle-status", isStoreOwnerWithApprovedStore, storeController.toggleStoreStatus);
router.put("/coordinates", isStoreOwnerWithApprovedStore, storeController.updateStoreCoordinates);

module.exports = router;
