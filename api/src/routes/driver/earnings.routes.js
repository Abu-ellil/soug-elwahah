const express = require("express");
const router = express.Router();
const earningsController = require("../../controllers/driver/earnings.controller");

router.get("/", earningsController.getEarningsSummary);
router.get("/statistics", earningsController.getStatistics);

module.exports = router;
