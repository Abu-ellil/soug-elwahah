const express = require("express");
const router = express.Router();
const storeController = require("../../controllers/store/store.controller");
const uploadMiddleware = require("../../middlewares/upload.middleware");

router.get("/", storeController.getMyStore);
router.put("/", storeController.updateStore);
router.put(
  "/image",
  uploadMiddleware.single("image"),
  storeController.updateStoreImage
);
router.patch("/toggle-status", storeController.toggleStoreStatus);

module.exports = router;
