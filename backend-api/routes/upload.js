const express = require('express');
const ApiResponse = require('../utils/apiResponse');

const router = express.Router();

// Placeholder upload routes
router.get('/', (req, res) => {
  res.json(ApiResponse.success('Upload routes are working', null));
});

router.post('/', (req, res) => {
  res.json(ApiResponse.success('Upload endpoint', { message: 'Not implemented yet' }));
});

module.exports = router;