require("dotenv").config({ path: "./.env" });

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const connectDB = require("./src/config/database");

// Connect to database first
connectDB()
  .then(async () => {
    // Import app after DB connection is established
    const app = require("./src/app.js");

    // Create HTTP server
    const server = http.createServer(app);

    // Initialize Socket.IO with CORS configuration
    const io = socketIo(server, {
      cors: {
        origin: [
          "http://localhost:3000", // Admin app
          "http://localhost:3001", // Alternative port for admin app
          "http://localhost:19006", // Expo development server (for merchant app)
          "http://localhost:19000", // Alternative Expo port
          "http://localhost:3002", // Alternative port for admin app
          "http://localhost:19001", // Alternative Expo port
          process.env.ADMIN_URL || "", // Production admin URL from environment
          process.env.MERCHANT_URL || "", // Production merchant URL from environment
          "https://soug-elwahah.vercel.app", // Production deployment
        ].filter((url) => url), // Remove empty strings
        methods: ["GET", "POST"],
        credentials: true,
      },
      transports: ["websocket", "polling"],
      allowEIO3: true, // Allow Engine.IO v3 clients (for compatibility)
    });

    // Initialize WebSocket service
    const webSocketService = require("./src/services/websocket.service");
    webSocketService.init(io);

    // Initialize real-time order assignment service
    const realTimeOrderAssignmentService = require("./src/services/realtime-order-assignment.service");
    realTimeOrderAssignmentService.init(io);

    // Store connected clients with their user info
    const connectedClients = new Map();

    // Socket.IO connection handler
    io.use((socket, next) => {
      const token = socket.handshake.auth.token || socket.handshake.query.token;

      if (!token) {
        return next(new Error("Authentication token required"));
      }

      try {
        const { verifyToken } = require("./src/utils/jwt");
        const decoded = verifyToken(token);
        socket.userId = decoded.userId;
        socket.userRole = decoded.role;
        socket.userPhone = decoded.phone;
        next();
      } catch (error) {
        console.error("Socket authentication error:", error);
        next(new Error("Authentication failed"));
      }
    });

    io.on("connection", (socket) => {
      console.log(
        `User connected: ${socket.id} (User ID: ${socket.userId}, Role: ${socket.userRole})`
      );

      // Store user info with socket connection
      connectedClients.set(socket.id, {
        userId: socket.userId,
        role: socket.userRole,
        phone: socket.userPhone,
        socketId: socket.id,
      });

      // Join specific rooms based on user role and ID
      socket.join(`user_${socket.userId}`);
      socket.join(`${socket.userRole}_${socket.userId}`);
      console.log(`User authenticated: ${socket.userId} (${socket.userRole})`);

      // Handle driver availability status
      if (socket.userRole === "driver") {
        socket.on("driverStatusUpdate", (status) => {
          if (typeof status === "object" && status.isAvailable !== undefined) {
            // Update driver availability in database
            require("./src/models/Driver")
              .findByIdAndUpdate(socket.userId, {
                isAvailable: status.isAvailable,
              })
              .then(() => {
                console.log(
                  `Driver ${socket.userId} availability updated to ${status.isAvailable}`
                );

                // Join or leave the available drivers room based on status
                if (status.isAvailable) {
                  socket.join("available_drivers");
                  console.log(
                    `Driver ${socket.userId} joined available_drivers room`
                  );
                } else {
                  socket.leave("available_drivers");
                  console.log(
                    `Driver ${socket.userId} left available_drivers room`
                  );
                }
              })
              .catch((err) => {
                console.error("Error updating driver availability:", err);
              });
          }
        });

        // Handle order acceptance
        socket.on("acceptOrder", async (orderId) => {
          const realTimeOrderAssignmentService = require("./src/services/realtime-order-assignment.service");
          const result =
            await realTimeOrderAssignmentService.handleOrderAcceptance(
              socket.userId,
              orderId
            );

          if (result.success) {
            // Join driver to order-specific room for updates
            socket.join(`order_${orderId}`);
            socket.join(`driver_orders_${socket.userId}`);

            // Notify the driver that order was accepted
            socket.emit("orderAcceptanceSuccess", {
              orderId: orderId,
              message: "تم قبول الطلب بنجاح",
              timestamp: new Date().toISOString(),
            });
          } else {
            socket.emit("orderAcceptanceFailed", {
              orderId: orderId,
              message: result.message,
              timestamp: new Date().toISOString(),
            });
          }
        });

        // Handle location updates
        socket.on("locationUpdate", (location) => {
          if (location && location.lat && location.lng) {
            // Update driver location in database
            require("./src/models/Driver")
              .findByIdAndUpdate(socket.userId, {
                coordinates: { lat: location.lat, lng: location.lng },
                lastLocationUpdate: new Date(),
              })
              .then(() => {
                console.log(`Driver ${socket.userId} location updated`);

                // Broadcast location update to relevant parties
                webSocketService.broadcastDriverLocation(socket.userId, {
                  lat: location.lat,
                  lng: location.lng,
                  timestamp: new Date().toISOString(),
                });
              })
              .catch((err) => {
                console.error("Error updating driver location:", err);
              });
          }
        });
      }

      // Handle disconnection
      socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
        connectedClients.delete(socket.id);
      });

      // Handle errors
      socket.on("error", (error) => {
        console.error("Socket error:", error);
      });
    });

    // Make io available globally or pass to routes that need it
    app.set("io", io);

    const DEFAULT_PORT = 5000;
    const PORT = process.env.PORT || DEFAULT_PORT;

    // Function to start server with fallback ports
    function startServer(port, maxRetries = 5, retryCount = 0) {
      server.listen(port, "0.0.0.0", () => {
        console.log(`Server running on port ${port}`);
        console.log(`API available at http://localhost:${port}/api`);
        console.log(`API also available at http://192.168.1.4:${port}/api`);
        console.log(`WebSocket available at ws://localhost:${port}`);
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
    const serverInstance = startServer(PORT);
    module.exports = serverInstance;
  })
  .catch((error) => {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  });
