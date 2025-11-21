/**
 * @file api/api/index.js - Vercel API route handler
 * @description Simple Vercel API route for testing
 */

// Import the serverless handler
const serverlessHandler = require('../serverless-handler');

// Export the handler for Vercel
module.exports = async (req, res) => {
  // Set up a simple Express app for this request
  const { app } = require('../serverless-handler');
  
  // Create a mock response object to capture the result
  const express = require('express');
  const { createProxyMiddleware } = require('http-proxy-middleware');
  
  // Handle the request using the serverless handler
  return serverlessHandler(req, res);
};
