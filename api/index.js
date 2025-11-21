/**
 * @file api/index.js - Vercel Serverless Function Entry Point
 * @description Main handler for Vercel serverless functions
 */

const serverless = require('serverless-http');
const app = require('./serverless');

// Wrap the Express app with serverless-http
const handler = serverless(app);

module.exports = handler;