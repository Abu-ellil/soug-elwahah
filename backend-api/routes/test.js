const express = require('express');
const ApiResponse = require('../utils/apiResponse');

const router = express.Router();

// Simple ping endpoint
router.get('/ping', (req, res) => {
  return res.json(ApiResponse.success('pong', {
    method: req.method,
    path: req.originalUrl,
    headers: req.headers,
    timestamp: new Date().toISOString()
  }));
});

// Echo GET query params
router.get('/echo', (req, res) => {
  return res.json(ApiResponse.success('echo', {
    query: req.query,
    method: req.method,
    path: req.originalUrl
  }));
});

// Echo POST body
router.post('/echo', (req, res) => {
  return res.json(ApiResponse.success('echo', {
    body: req.body,
    method: req.method,
    path: req.originalUrl
  }));
});

// Simulate error (will be handled by global error handler)
router.get('/error', (req, res, next) => {
  const err = new Error('Intentional test error');
  err.statusCode = 500;
  return next(err);
});

// Simulate delay/latency
router.get('/delay/:ms', async (req, res) => {
  const ms = Math.min(parseInt(req.params.ms, 10) || 0, 30000); // cap at 30s
  await new Promise(resolve => setTimeout(resolve, ms));
  return res.json(ApiResponse.success(`delayed ${ms}ms`, { delayedMs: ms }));
});

// Return specified status code with optional message
router.get('/status/:code', (req, res) => {
  const code = parseInt(req.params.code, 10) || 200;
  const message = req.query.message || `Status ${code}`;
  if (code >= 400) {
    return res.status(code).json(ApiResponse.error(message));
  }
  return res.status(code).json(ApiResponse.success(message));
});

module.exports = router;