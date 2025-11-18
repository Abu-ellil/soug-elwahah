require("dotenv").config();

const express = require("express");
const connectDB = require("./src/config/database");

// Connect to database first
connectDB()
  .then(async () => {
    // Import app after DB connection is established
    const app = require("./src/app.js");

    const DEFAULT_PORT = 5000;
    const PORT = process.env.PORT || DEFAULT_PORT;

    // Function to start server with fallback ports
    function startServer(port, maxRetries = 5, retryCount = 0) {
      const server = app.listen(port, "0.0.0.0", () => {
        console.log(`Server running on port ${port}`);
        console.log(`API available at http://localhost:${port}/api`);
        console.log(`API also available at http://192.168.1.4:${port}/api`);
      });

      server.on("error", (error) => {
        if (error.code === "EADDRINUSE") {
          if (retryCount < maxRetries) {
            const newPort = parseInt(port) + 1; // Ensure we're doing numeric addition
            console.log(
              `Port ${port} is already in use. Trying port ${newPort}...`
            );
            setTimeout(() => {
              startServer(newPort, maxRetries, retryCount + 1);
            }, 10); // Wait 10ms before trying the next port
          } else {
            console.error(
              `Could not start server after trying ${maxRetries + 1} ports`
            );
            process.exit(1);
          }
        } else {
          console.error("Server error:", error);
        }
      });

      // Handle graceful shutdown
      process.on("SIGTERM", () => {
        console.log("SIGTERM received, shutting down gracefully");
        server.close(() => {
          console.log("Process terminated");
        });
      });

      process.on("SIGINT", () => {
        console.log("SIGINT received, shutting down gracefully");
        server.close(() => {
          console.log("Process terminated");
        });
      });

      return server;
    }

    // Start the server with fallback logic
    const server = startServer(PORT);
    module.exports = server;
  })
  .catch((error) => {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  });
