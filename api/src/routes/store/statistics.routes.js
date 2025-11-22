const express = require("express");
const router = express.Router();
const statisticsController = require("../../controllers/store/statistics.controller");

router.get("/", statisticsController.getStoreStatistics);

module.exports = router;
