const express = require("express");
const router = express.Router();
const addressesController = require("../../controllers/customer/addresses.controller");

router.get("/", addressesController.getMyAddresses);
router.post("/", addressesController.addAddress);
router.put("/:addressId", addressesController.updateAddress);
router.delete("/:addressId", addressesController.deleteAddress);

module.exports = router;
