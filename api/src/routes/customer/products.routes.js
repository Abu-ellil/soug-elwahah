const express = require("express");
const router = express.Router();
const productsController = require("../../controllers/customer/products.controller");

router.get("/", productsController.getAllProducts);
router.get("/:productId", productsController.getProductDetails);

module.exports = router;
