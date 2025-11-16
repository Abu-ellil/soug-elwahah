const express = require("express");
const router = express.Router();
const productsController = require("../../controllers/store/products.controller");
const uploadMiddleware = require("../../middlewares/upload.middleware");

router.get("/", productsController.getMyProducts);
router.post(
  "/",
  uploadMiddleware.single("image"),
  productsController.addProduct
);
router.put("/:productId", productsController.updateProduct);
router.put(
  "/:productId/image",
  uploadMiddleware.single("image"),
  productsController.updateProductImage
);
router.patch(
  "/:productId/toggle-availability",
  productsController.toggleAvailability
);
router.delete("/:productId", productsController.deleteProduct);

module.exports = router;
