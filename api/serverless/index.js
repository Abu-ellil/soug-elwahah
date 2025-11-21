/**
 * @file serverless/index.js - Main serverless function handler
 * @description Main handler for Vercel serverless functions
 */

const serverless = require('serverless-http');
const app = require('../vercel-serverless');

// Wrap the Express app with serverless-http
const handler = serverless(app);

module.exports = handler;