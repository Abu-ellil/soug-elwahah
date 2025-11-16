require("dotenv").config();

const express = require("express");
const connectDB = require("./src/config/database");

// Connect to database first
connectDB()
  .then(async () => {
    // Import app after DB connection is established
    const app = require("./src/app.js");

    const PORT = process.env.PORT || 5000;

    // Start the server
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api`);
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

    module.exports = server;
  })
  .catch((error) => {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  });
