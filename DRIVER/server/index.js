const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// Store active drivers and their current locations
const activeDrivers = new Map();
// Store active deliveries with their routes
const activeDeliveries = new Map();

// REST API endpoints
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/drivers', (req, res) => {
    const drivers = Array.from(activeDrivers.values());
    res.json({ drivers });
});

app.get('/api/driver/:driverId', (req, res) => {
    const driver = activeDrivers.get(req.params.driverId);
    if (driver) {
        res.json({ driver });
    } else {
        res.status(404).json({ error: 'Driver not found' });
    }
});

app.get('/api/delivery/:deliveryId', (req, res) => {
    const delivery = activeDeliveries.get(req.params.deliveryId);
    if (delivery) {
        res.json({ delivery });
    } else {
        res.status(404).json({ error: 'Delivery not found' });
    }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Driver connects and registers
    socket.on('driver:register', (data) => {
        const { driverId, name, vehicle } = data;

        activeDrivers.set(driverId, {
            driverId,
            name,
            vehicle,
            socketId: socket.id,
            status: 'available',
            location: null,
            lastUpdate: new Date().toISOString()
        });

        socket.driverId = driverId;
        socket.join(`driver:${driverId}`);

        console.log(`Driver registered: ${driverId} (${name})`);

        socket.emit('driver:registered', {
            success: true,
            driverId,
            message: 'Successfully registered'
        });

        // Notify all clients about new driver
        io.emit('drivers:updated', {
            drivers: Array.from(activeDrivers.values())
        });
    });

    // Driver updates location
    socket.on('driver:location', (data) => {
        const { driverId, latitude, longitude, heading, speed } = data;

        const driver = activeDrivers.get(driverId);
        if (driver) {
            driver.location = {
                latitude,
                longitude,
                heading,
                speed,
                timestamp: new Date().toISOString()
            };
            driver.lastUpdate = new Date().toISOString();

            activeDrivers.set(driverId, driver);

            // Broadcast location to all clients tracking this driver
            io.emit('driver:location:update', {
                driverId,
                location: driver.location
            });

            // If driver has active delivery, update delivery tracking
            const activeDelivery = Array.from(activeDeliveries.values())
                .find(d => d.driverId === driverId && d.status === 'in_progress');

            if (activeDelivery) {
                // Add location to route history
                if (!activeDelivery.route) {
                    activeDelivery.route = [];
                }
                activeDelivery.route.push({
                    latitude,
                    longitude,
                    timestamp: new Date().toISOString()
                });

                activeDeliveries.set(activeDelivery.deliveryId, activeDelivery);

                // Broadcast delivery update
                io.emit('delivery:update', {
                    deliveryId: activeDelivery.deliveryId,
                    currentLocation: driver.location,
                    route: activeDelivery.route
                });
            }
        }
    });

    // Start delivery
    socket.on('delivery:start', (data) => {
        const { deliveryId, driverId, pickup, dropoff, customerInfo } = data;

        const delivery = {
            deliveryId,
            driverId,
            pickup: {
                latitude: pickup.latitude,
                longitude: pickup.longitude,
                address: pickup.address
            },
            dropoff: {
                latitude: dropoff.latitude,
                longitude: dropoff.longitude,
                address: dropoff.address
            },
            customerInfo,
            status: 'in_progress',
            route: [],
            startTime: new Date().toISOString(),
            estimatedArrival: data.estimatedArrival
        };

        activeDeliveries.set(deliveryId, delivery);

        // Update driver status
        const driver = activeDrivers.get(driverId);
        if (driver) {
            driver.status = 'busy';
            driver.currentDeliveryId = deliveryId;
            activeDrivers.set(driverId, driver);
        }

        // Notify all clients
        io.emit('delivery:started', delivery);

        socket.emit('delivery:start:success', {
            success: true,
            deliveryId,
            message: 'Delivery started successfully'
        });

        console.log(`Delivery started: ${deliveryId} by driver ${driverId}`);
    });

    // Complete delivery
    socket.on('delivery:complete', (data) => {
        const { deliveryId } = data;

        const delivery = activeDeliveries.get(deliveryId);
        if (delivery) {
            delivery.status = 'completed';
            delivery.endTime = new Date().toISOString();

            // Update driver status
            const driver = activeDrivers.get(delivery.driverId);
            if (driver) {
                driver.status = 'available';
                driver.currentDeliveryId = null;
                activeDrivers.set(delivery.driverId, driver);
            }

            activeDeliveries.set(deliveryId, delivery);

            // Notify all clients
            io.emit('delivery:completed', {
                deliveryId,
                delivery
            });

            socket.emit('delivery:complete:success', {
                success: true,
                deliveryId
            });

            console.log(`Delivery completed: ${deliveryId}`);
        }
    });

    // Subscribe to specific delivery updates
    socket.on('delivery:subscribe', (data) => {
        const { deliveryId } = data;
        socket.join(`delivery:${deliveryId}`);

        const delivery = activeDeliveries.get(deliveryId);
        if (delivery) {
            socket.emit('delivery:subscribed', {
                success: true,
                delivery
            });
        }
    });

    // Unsubscribe from delivery updates
    socket.on('delivery:unsubscribe', (data) => {
        const { deliveryId } = data;
        socket.leave(`delivery:${deliveryId}`);
    });

    // Driver status update
    socket.on('driver:status', (data) => {
        const { driverId, status } = data;

        const driver = activeDrivers.get(driverId);
        if (driver) {
            driver.status = status;
            driver.lastUpdate = new Date().toISOString();
            activeDrivers.set(driverId, driver);

            io.emit('driver:status:update', {
                driverId,
                status
            });
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);

        // Find and remove driver if they disconnect
        if (socket.driverId) {
            const driver = activeDrivers.get(socket.driverId);
            if (driver) {
                driver.status = 'offline';
                activeDrivers.set(socket.driverId, driver);

                io.emit('driver:offline', {
                    driverId: socket.driverId
                });
            }
        }
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Real-time tracking enabled`);
});
