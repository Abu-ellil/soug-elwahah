import { io, Socket } from 'socket.io-client';

// Replace with your server URL
const SERVER_URL = 'http://10.0.2.2:5000'; // For Android emulator to reach host machine
// For iOS simulator use: const SERVER_URL = 'http://localhost:5000';
// For real device, use your machine's IP address: const SERVER_URL = 'http://<your-ip>:5000';

class SocketService {
    private socket: Socket | null = null;
    private driverId: string | null = null;

    connect(driverId: string, driverName: string, vehicle: string) {
        if (this.socket?.connected) {
            console.log('Socket already connected');
            return;
        }

        this.driverId = driverId;
        this.socket = io(SERVER_URL, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        this.socket.on('connect', () => {
            console.log('Connected to server:', this.socket?.id);
            this.registerDriver(driverId, driverName, vehicle);
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
        });

        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
        });

        // Listen for location confirmations from the server
        this.socket.on('location_confirmed', (data) => {
            console.log('Location confirmed:', data);
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.driverId = null;
        }
    }

    registerDriver(driverId: string, name: string, vehicle: string) {
        if (this.socket) {
            this.socket.emit('join_driver_room', {
                driverId,
            });
        }
    }

    updateLocation(latitude: number, longitude: number, heading?: number, speed?: number) {
        if (this.socket && this.driverId) {
            this.socket.emit('driver_location_update', {
                driverId: this.driverId,
                location: {
                    latitude,
                    longitude,
                    heading: heading || 0,
                    speed: speed || 0,
                }
            });
        }
    }

    startDelivery(
        deliveryId: string,
        pickup: { latitude: number; longitude: number; address: string },
        dropoff: { latitude: number; longitude: number; address: string },
        customerInfo: any,
        estimatedArrival?: string
    ) {
        if (this.socket && this.driverId) {
            this.socket.emit('order_status_update', {
                orderId: deliveryId,
                driverId: this.driverId,
                status: 'on_way',
                pickup,
                dropoff,
                customerInfo,
                estimatedArrival,
            });
        }
    }

    completeDelivery(deliveryId: string) {
        if (this.socket) {
            this.socket.emit('order_status_update', {
                orderId: deliveryId,
                status: 'delivered',
            });
        }
    }

    updateDriverStatus(status: 'available' | 'busy' | 'offline') {
        if (this.socket && this.driverId) {
            // Driver status updates are typically handled through order status updates
            // This method can be used to send a notification about driver availability
            this.socket.emit('create_notification', {
                userId: this.driverId,
                userType: 'driver',
                type: 'status_change',
                title: 'Status Changed',
                message: `Driver is now ${status}`,
                data: { status }
            });
        }
    }

    subscribeToDelivery(deliveryId: string) {
        if (this.socket) {
            this.socket.emit('join_order_room', {
                orderId: deliveryId,
            });
        }
    }

    unsubscribeFromDelivery(deliveryId: string) {
        if (this.socket) {
            // Socket.io doesn't have a direct unsubscribe method
            // The room will automatically be left when socket disconnects
            console.log(`Unsubscribing from delivery ${deliveryId} not implemented`);
        }
    }

    onDriverLocationUpdate(callback: (data: any) => void) {
        if (this.socket) {
            this.socket.on('driver_location_update', callback);
        }
    }

    onDeliveryUpdate(callback: (data: any) => void) {
        if (this.socket) {
            this.socket.on('order_status_update', callback);
        }
    }

    onDeliveryStarted(callback: (data: any) => void) {
        if (this.socket) {
            this.socket.on('order_status_update', callback);
        }
    }

    onDeliveryCompleted(callback: (data: any) => void) {
        if (this.socket) {
            this.socket.on('order_status_update', callback);
        }
    }

    removeListener(event: string, callback: (data: any) => void) {
        if (this.socket) {
            this.socket.off(event, callback);
        }
    }

    getSocket() {
        return this.socket;
    }

    isConnected() {
        return this.socket?.connected || false;
    }
}

export default new SocketService();
