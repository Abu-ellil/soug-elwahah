# WebSocket Real-Time Communication Integration Guide

This document provides instructions for integrating real-time communication features into the client applications (customer app, driver app, and merchant app) using the WebSocket server implemented in the API.

## Overview

The API now includes a WebSocket server using Socket.IO that provides real-time communication for:
- Order status updates
- Driver location tracking
- Real-time notifications
- Order assignment for drivers
- Live tracking for customers

## WebSocket Connection Setup

### 1. Install Socket.IO Client

For React Native applications:

```bash
npm install socket.io-client
```

### 2. Connect to WebSocket Server

```javascript
import io from 'socket.io-client';

// Example connection
const socket = io('http://localhost:5000', {
  transports: ['websocket'],
  auth: {
    token: 'your-jwt-token-here'
  }
});

// Or pass token as query parameter
const socket = io('http://localhost:5000?token=your-jwt-token-here');
```

### 3. Authentication

All WebSocket connections require a valid JWT token for authentication. The token should be passed during connection:

```javascript
// Connect with token authentication
socket.auth = { token: userToken };
// or
socket.connect();
socket.emit('authenticate', userToken);
```

## Event Listeners

### For All Users

```javascript
// Listen for notifications
socket.on('notification', (data) => {
  console.log('Received notification:', data);
 // Handle notification
});

// Listen for order updates
socket.on('orderUpdate', (data) => {
  console.log('Order updated:', data);
 // Update UI with new order status
});
```

### For Drivers

```javascript
// Listen for new order assignments
socket.on('newOrderAvailable', (data) => {
  console.log('New order available:', data.order);
  // Show new order notification to driver
});

// Listen for order acceptance confirmation
socket.on('orderAcceptanceSuccess', (data) => {
  console.log('Order accepted successfully:', data);
  // Update driver's active orders
});

socket.on('orderAcceptanceFailed', (data) => {
  console.log('Order acceptance failed:', data);
  // Handle failed acceptance
});

// Send location updates
socket.emit('locationUpdate', {
  lat: currentLocation.latitude,
  lng: currentLocation.longitude
});

// Update driver availability
socket.emit('driverStatusUpdate', {
  isAvailable: true  // or false
});
```

### For Customers

```javascript
// Listen for driver location updates during delivery
socket.on('driverLocationUpdate', (data) => {
  console.log('Driver location updated:', data);
  // Update map with driver location
});

// Listen for order status updates
socket.on('orderUpdate', (data) => {
  console.log('Order status updated:', data.status);
  // Update order tracking UI
});
```

### For Store Owners

```javascript
// Listen for new orders
socket.on('newOrder', (data) => {
  console.log('New order received:', data.order);
  // Update store orders list
});

// Listen for order updates
socket.on('orderUpdate', (data) => {
  console.log('Order updated:', data);
  // Update order management UI
});
```

## Emitting Events

### For Drivers

```javascript
// Accept an order
socket.emit('acceptOrder', orderId);

// Update availability status
socket.emit('driverStatusUpdate', {
  isAvailable: true
});

// Update location
socket.emit('locationUpdate', {
  lat: 30.0444,
  lng: 31.2357
});
```

## Connection Management

### Connection Events

```javascript
socket.on('connect', () => {
  console.log('Connected to WebSocket server');
});

socket.on('connect_error', (error) => {
  console.log('Connection error:', error);
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected from WebSocket server:', reason);
  // Handle reconnection logic if needed
});
```

### Reconnection Strategy

```javascript
const socket = io('http://localhost:5000', {
  reconnection: true,
 reconnectionDelay: 1000,
 reconnectionAttempts: 5,
  transports: ['websocket']
});
```

## Room Management

The WebSocket server uses rooms for targeted messaging:

- `user_${userId}` - Individual user notifications
- `driver_${driverId}` - Driver-specific updates
- `store_${storeId}` - Store-specific updates
- `order_${orderId}` - Order-specific updates
- `driver_orders_${driverId}` - Driver's assigned orders
- `available_drivers` - Available drivers for new orders

## Error Handling

```javascript
socket.on('error', (error) => {
  console.error('WebSocket error:', error);
  // Handle error appropriately
});
```

## Integration Examples

### In React Native Context Provider

```javascript
// WebSocketContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const WebSocketContext = createContext();

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children, userToken, userId, userRole }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (userToken && userId && userRole) {
      const newSocket = io('http://localhost:5000', {
        auth: { token: userToken },
        transports: ['websocket']
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
        console.log('Connected to WebSocket server');
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
        console.log('Disconnected from WebSocket server');
      });

      // Join user-specific room
      newSocket.on('connect', () => {
        newSocket.emit('joinRoom', `user_${userId}`);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [userToken, userId, userRole]);

  return (
    <WebSocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
};
```

## Environment Configuration

Make sure to update your environment variables to match the WebSocket server URL:

```javascript
// Example for different environments
const SOCKET_URL = __DEV__ 
  ? 'http://localhost:5000'  // Development
  : 'https://your-production-api.com'; // Production
```

## Testing WebSocket Connection

You can test the WebSocket connection using the following endpoint:
`GET /api/realtime/status`

This will return connection status information for the authenticated user.

## Security Considerations

- Always authenticate WebSocket connections with valid JWT tokens
- Validate user permissions before broadcasting sensitive information
- Use secure connections (wss://) in production
- Implement proper error handling and connection recovery