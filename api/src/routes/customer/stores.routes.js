const express = require("express");
const router = express.Router();
const storesController = require("../../controllers/customer/stores.controller");

router.get("/nearby", storesController.getNearbyStores);
router.get("/search", storesController.searchStores);
router.get("/", storesController.getAllStores);
router.get("/:storeId", storesController.getStoreDetails);
router.get("/:storeId/products", storesController.getStoreProducts);

module.exports = router;
