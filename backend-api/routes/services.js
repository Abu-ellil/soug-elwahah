const express = require('express');
const ApiResponse = require('../utils/apiResponse');

const router = express.Router();

/**
 * @swagger
 * /services:
 *   get:
 *     summary: Get all services
 *     tags: [Services]
 *     description: Retrieve a list of all services available in the marketplace
 *     responses:
 *       200:
 *         description: Services retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Services routes are working"
 *               data: []
 *               timestamp: "2025-01-12T12:51:21.455Z"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
const { getServices } = require('../controllers/serviceController');

router.get('/', (req, res) => {
  getServices(req, res);
});

router.get('/:id', (req, res) => {
  res.json(ApiResponse.success('Get service by ID', { id: req.params.id, message: 'Not implemented yet' }));
});

router.post('/', (req, res) => {
  res.json(ApiResponse.success('Create service endpoint', { message: 'Not implemented yet' }));
});

module.exports = router;