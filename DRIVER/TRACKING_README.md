# Real-Time Driver Tracking System

This system provides real-time GPS tracking for delivery drivers with Socket.IO integration.

## Features

- ✅ Real-time driver location tracking
- ✅ Live delivery route visualization
- ✅ Socket.IO server for real-time communication
- ✅ Google Maps integration with custom markers
- ✅ Pickup and dropoff location tracking
- ✅ Route history recording
- ✅ Driver status management (available/busy/offline)
- ✅ Background location tracking

## Architecture

### Backend (Express + Socket.IO)
- **Location**: `server/`
- **Main file**: `server/index.js`
- **Port**: 3000 (configurable via .env)

### Mobile App (React Native + Expo)
- **Socket.IO Client**: `services/socketService.ts`
- **Location Service**: `services/locationService.ts`
- **Map Component**: `components/DeliveryMap.tsx`
- **Tracking Screen**: `app/(tabs)/tracking.tsx`

## Setup Instructions

### 1. Backend Server Setup

```bash
cd server
npm install
```

Create `.env` file:
```
PORT=3000
NODE_ENV=development
```

Start the server:
```bash
npm start
# or for development with auto-reload
npm run dev
```

### 2. Mobile App Setup

Install dependencies:
```bash
npm install
```

Update the server URL in `services/socketService.ts`:
```typescript
const SERVER_URL = 'http://YOUR_SERVER_IP:3000';
```

**Important**: Replace `YOUR_SERVER_IP` with:
- Your computer's local IP address (e.g., `192.168.1.100`) for testing on physical device
- `localhost` if using emulator on same machine
- Your production server URL for deployment

### 3. Run the App

```bash
npm start
# Then press 'a' for Android or 'i' for iOS
```

## Socket.IO Events

### Client → Server

| Event | Description | Payload |
|-------|-------------|---------|
| `driver:register` | Register driver on connection | `{ driverId, name, vehicle }` |
| `driver:location` | Update driver location | `{ driverId, latitude, longitude, heading, speed }` |
| `driver:status` | Update driver status | `{ driverId, status }` |
| `delivery:start` | Start a new delivery | `{ deliveryId, driverId, pickup, dropoff, customerInfo }` |
| `delivery:complete` | Complete a delivery | `{ deliveryId }` |
| `delivery:subscribe` | Subscribe to delivery updates | `{ deliveryId }` |
| `delivery:unsubscribe` | Unsubscribe from delivery | `{ deliveryId }` |

### Server → Client

| Event | Description | Payload |
|-------|-------------|---------|
| `driver:registered` | Confirmation of registration | `{ success, driverId, message }` |
| `driver:location:update` | Broadcast location update | `{ driverId, location }` |
| `driver:status:update` | Broadcast status change | `{ driverId, status }` |
| `driver:offline` | Driver disconnected | `{ driverId }` |
| `delivery:started` | Delivery has started | `{ deliveryId, driverId, pickup, dropoff, ... }` |
| `delivery:update` | Delivery location update | `{ deliveryId, currentLocation, route }` |
| `delivery:completed` | Delivery completed | `{ deliveryId, delivery }` |
| `drivers:updated` | List of all active drivers | `{ drivers }` |

## REST API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |
| GET | `/api/drivers` | Get all active drivers |
| GET | `/api/driver/:driverId` | Get specific driver info |
| GET | `/api/delivery/:deliveryId` | Get specific delivery info |

## Usage Example

### Starting Tracking

```typescript
import socketService from './services/socketService';
import { useLocationTracking } from './services/locationService';

// Connect to server
socketService.connect('driver_123', 'John Doe', 'Toyota Camry');

// Start location tracking
const { location, error } = useLocationTracking('driver_123', true);
```

### Starting a Delivery

```typescript
socketService.startDelivery(
  'delivery_456',
  {
    latitude: 40.7128,
    longitude: -74.0060,
    address: '123 Pickup St'
  },
  {
    latitude: 40.7589,
    longitude: -73.9851,
    address: '456 Dropoff Ave'
  },
  {
    name: 'Customer Name',
    phone: '+1234567890'
  }
);
```

### Displaying the Map

```tsx
<DeliveryMap
  currentLocation={{ latitude: 40.7128, longitude: -74.0060 }}
  pickupLocation={{ latitude: 40.7128, longitude: -74.0060 }}
  dropoffLocation={{ latitude: 40.7589, longitude: -73.9851 }}
  route={routeArray}
  showRoute={true}
  heading={45}
/>
```

## Configuration

### Location Tracking Settings

In `services/locationService.ts`:

```typescript
{
  accuracy: Location.Accuracy.BestForNavigation,
  timeInterval: 5000,      // Update every 5 seconds
  distanceInterval: 10,    // Update every 10 meters
}
```

### Map Settings

In `components/DeliveryMap.tsx`:

- Custom markers for driver, pickup, and dropoff
- Traffic layer enabled
- Auto-fit to show all markers
- Polyline for route visualization

## Permissions Required

### Android (app.json)
```json
{
  "android": {
    "permissions": [
      "ACCESS_FINE_LOCATION",
      "ACCESS_COARSE_LOCATION",
      "ACCESS_BACKGROUND_LOCATION"
    ]
  }
}
```

### iOS (app.json)
```json
{
  "ios": {
    "infoPlist": {
      "NSLocationWhenInUseUsageDescription": "...",
      "NSLocationAlwaysAndWhenInUseUsageDescription": "...",
      "NSLocationAlwaysUsageDescription": "..."
    }
  }
}
```

## Troubleshooting

### Cannot connect to server
- Check that the server is running
- Verify the SERVER_URL in `socketService.ts`
- Ensure your device/emulator can reach the server
- Check firewall settings

### Location not updating
- Verify location permissions are granted
- Check that tracking is enabled
- Ensure GPS is enabled on device
- Try restarting the app

### Map not displaying
- Verify Google Maps API key in `app.json`
- Check internet connection
- Ensure react-native-maps is properly installed

## Production Considerations

1. **Security**: Implement authentication for Socket.IO connections
2. **Scaling**: Use Redis adapter for Socket.IO to scale across multiple servers
3. **Database**: Store delivery history and routes in a database
4. **Error Handling**: Add comprehensive error handling and retry logic
5. **Battery Optimization**: Adjust location update frequency based on delivery status
6. **Offline Support**: Queue location updates when offline and sync when connected

## License

MIT
