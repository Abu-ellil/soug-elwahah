const express = require('express');
const ApiResponse = require('../utils/apiResponse');

const router = express.Router();

// Placeholder review routes
router.get('/', (req, res) => {
  res.json(ApiResponse.success('Reviews routes are working', []));
});

router.get('/:id', (req, res) => {
  res.json(ApiResponse.success('Get review by ID', { id: req.params.id, message: 'Not implemented yet' }));
});

router.post('/', (req, res) => {
  res.json(ApiResponse.success('Create review endpoint', { message: 'Not implemented yet' }));
});

module.exports = router;