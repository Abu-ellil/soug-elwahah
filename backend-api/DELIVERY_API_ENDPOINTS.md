# Delivery Management System - API Endpoints

## Base URL
`https://api.elsoug.com/api/v1/deliveries`

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Role-Based Access
- `driver`: Can access delivery status updates, location updates, and their own deliveries
- `store`: Can create deliveries, view store deliveries, and manage delivery assignments
- `customer`: Can view their own deliveries
- `admin`: Can access all delivery data and management functions

---

## Delivery Management Endpoints

### 1. Create Delivery Assignment
**POST** `/api/v1/deliveries`

**Access**: Store/Seller only

**Headers**:
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request Body**:
```json
{
  "orderId": "ObjectId",
  "driverId": "ObjectId",
  "deliveryInstructions": "string (optional)"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Delivery assignment created successfully",
  "delivery": {
    "_id": "ObjectId",
    "order": {
      "orderNumber": "string",
      "status": "string",
      "totalAmount": "number"
    },
    "driver": {
      "name": "string",
      "phone": "string",
      "profile": {
        "driver": {
          "vehicleInfo": "string"
        }
      }
    },
    "customer": {
      "name": "string",
      "phone": "string"
    },
    "store": {
      "name": "string"
    },
    "status": "pending_assignment",
    "pickupLocation": {
      "type": "Point",
      "coordinates": [longitude, latitude],
      "address": "string"
    },
    "destinationLocation": {
      "type": "Point",
      "coordinates": [longitude, latitude],
      "address": "string"
    },
    "createdAt": "ISODate",
    "updatedAt": "ISODate"
  }
}
```

### 2. Get All Deliveries
**GET** `/api/v1/deliveries`

**Access**: Admin only

**Headers**:
- `Authorization: Bearer <token>`

**Query Parameters**:
- `status` (optional): Filter by delivery status
- `driverId` (optional): Filter by driver ID
- `storeId` (optional): Filter by store ID
- `startDate` (optional): Filter by start date
- `endDate` (optional): Filter by end date
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response**:
```json
{
  "success": true,
  "message": "Deliveries retrieved successfully",
  "deliveries": [...],
  "total": 100,
  "pagination": {
    "page": 1,
    "pages": 10,
    "limit": 10
  }
}
```

### 3. Get User's Deliveries
**GET** `/api/v1/deliveries/my-deliveries`

**Access**: All roles (returns only user's deliveries)

**Headers**:
- `Authorization: Bearer <token>`

**Query Parameters**:
- `status` (optional): Filter by delivery status
- `date` (optional): Filter by specific date
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response**:
```json
{
  "success": true,
  "message": "My deliveries retrieved successfully",
  "deliveries": [...],
  "total": 10,
 "pagination": {
    "page": 1,
    "pages": 1,
    "limit": 10
  }
}
```

### 4. Get Single Delivery
**GET** `/api/v1/deliveries/:id`

**Access**: Driver, Store, Customer, or Admin (must be related to delivery)

**Headers**:
- `Authorization: Bearer <token>`

**Response**:
```json
{
  "success": true,
  "message": "Delivery retrieved successfully",
  "delivery": {
    "_id": "ObjectId",
    "order": {...},
    "driver": {...},
    "customer": {...},
    "store": {...},
    "status": "string",
    "pickupLocation": {...},
    "destinationLocation": {...},
    "currentLocation": {...},
    "estimatedDeliveryTime": "ISODate",
    "pickupTime": "ISODate",
    "deliveryTime": "ISODate",
    "trackingHistory": [...],
    "deliveryCost": {...},
    "deliveryInstructions": "string",
    "deliveryProof": {...},
    "customerRating": {...},
    "driverRating": {...},
    "cancellation": {...},
    "priority": "string",
    "isUrgent": "boolean",
    "deliveryDistance": {...},
    "deliveryDuration": {...},
    "createdAt": "ISODate",
    "updatedAt": "ISODate"
  }
}
```

### 5. Update Delivery Status
**PUT** `/api/v1/deliveries/:id/status`

**Access**: Driver only (must be assigned to delivery)

**Headers**:
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request Body**:
```json
{
  "status": "picked_up | in_transit | arrived_at_destination | delivered | failed_delivery",
  "location": {
    "latitude": "number",
    "longitude": "number"
  } (optional),
  "note": "string (optional)"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Delivery status updated successfully",
  "delivery": {...}
}
```

### 6. Update Delivery Location (Real-time Tracking)
**PUT** `/api/v1/deliveries/:id/location`

**Access**: Driver only (must be assigned to delivery)

**Headers**:
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request Body**:
```json
{
  "coordinates": [longitude, latitude],
  "address": "string (optional)"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Delivery location updated successfully",
  "delivery": {...}
}
```

### 7. Get Delivery Statistics
**GET** `/api/v1/deliveries/stats`

**Access**: Driver, Store, or Admin

**Headers**:
- `Authorization: Bearer <token>`

**Response**:
```json
{
  "success": true,
  "message": "Delivery statistics retrieved successfully",
  "summary": {
    "totalDeliveries": 150,
    "pendingDeliveries": 5,
    "activeDeliveries": 8,
    "completedDeliveries": 130,
    "failedDeliveries": 5,
    "cancelledDeliveries": 2,
    "totalEarnings": 2500,
    "avgDeliveryTime": 45
  },
  "deliveriesByStatus": [...]
}
```

### 8. Cancel Delivery
**PUT** `/api/v1/deliveries/:id/cancel`

**Access**: Store, Admin, or Customer (for their own deliveries)

**Headers**:
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request Body**:
```json
{
  "reason": "string"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Delivery cancelled successfully",
  "delivery": {...}
}
```

### 9. Get Active Deliveries (Driver Only)
**GET** `/api/v1/deliveries/active`

**Access**: Driver only

**Headers**:
- `Authorization: Bearer <token>`

**Response**:
```json
{
  "success": true,
  "message": "Active deliveries retrieved successfully",
  "deliveries": [...]
}
```

---

## Real-time WebSocket Events

### 1. Connect to Delivery Tracking
```javascript
const socket = io('https://api.elsoug.com', {
  auth: {
    token: 'jwt_token'
  }
});
```

### 2. Events for Drivers
- `driver_location_update`: Send location updates
```javascript
socket.emit('driver_location_update', {
  deliveryId: 'ObjectId',
  location: {
    coordinates: [longitude, latitude]
 }
});
```

- `delivery_status_update`: Update delivery status
```javascript
socket.emit('delivery_status_update', {
 deliveryId: 'ObjectId',
  status: 'picked_up',
  location: {
    coordinates: [longitude, latitude]
  }
});
```

### 3. Events for Customers/Stores
- `delivery_location_update`: Receive location updates
```javascript
socket.on('delivery_location_update', (data) => {
  // Update map with driver location
});
```

- `delivery_status_update`: Receive status updates
```javascript
socket.on('delivery_status_update', (data) => {
  // Update delivery status in UI
});
```

- `delivery_eta_update`: Receive estimated arrival time
```javascript
socket.on('delivery_eta_update', (data) => {
  // Update ETA in UI
});
```

---

## Error Responses

### Common Error Formats
```json
{
 "success": false,
  "message": "Error message",
  "error": "Error details (optional)"
}
```

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `422`: Validation Error
- `500`: Server Error

### Common Error Messages
- "Delivery not found"
- "Not authorized to access this delivery"
- "Cannot change status from X to Y"
- "Driver is not available for delivery"
- "Order must be in 'ready' status to assign delivery"
- "Delivery already in progress, cannot cancel"

---

## Validation Rules

### Delivery Creation
- Order must exist and belong to the store
- Order status must be 'ready'
- Driver must exist and be available
- Driver must have 'driver' role

### Status Updates
- Only assigned driver can update status
- Status transitions must be valid
- Delivery must exist

### Location Updates
- Coordinates must be valid [longitude, latitude]
- Driver must be assigned to delivery
- Updates only allowed for active deliveries

---

## Rate Limiting
- Location updates: Maximum 120 requests per minute per driver
- Status updates: Maximum 60 requests per minute per driver
- General API: Maximum 1000 requests per hour per user