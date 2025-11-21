const express = require('express');
const ApiResponse = require('../utils/apiResponse');

const router = express.Router();

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     description: Retrieve a list of all products in the marketplace
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Products routes are working"
 *               data: []
 *               timestamp: "2025-01-12T12:49:43.738Z"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
const { getProducts, getProduct } = require('../controllers/productController');

router.get('/', (req, res) => {
  getProducts(req, res);
});

router.get('/:id', (req, res) => {
  getProduct(req, res);
});

router.post('/', (req, res) => {
  res.json(ApiResponse.success('Create product endpoint', { message: 'Not implemented yet' }));
});

module.exports = router;