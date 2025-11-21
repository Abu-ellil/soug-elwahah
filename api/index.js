const serverless = require("serverless-http");
const app = require("./server.js");

// If executed directly, run a standard HTTP server for local development.
if (require.main === module) {
  const port = process.env.PORT || 5000;
  app.listen(port, () =>
    console.log(`API listening on http://localhost:${port}`)
  );
} else {
  // Export serverless handler for Vercel / serverless platforms
  module.exports = serverless(app);
}
