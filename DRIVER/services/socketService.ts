import { io, Socket } from 'socket.io-client';

// Replace with your server URL
const SERVER_URL = 'http://localhost:3000'; // Change this to your actual server URL

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

        this.socket.on('driver:registered', (data) => {
            console.log('Driver registered:', data);
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
            this.socket.emit('driver:register', {
                driverId,
                name,
                vehicle,
            });
        }
    }

    updateLocation(latitude: number, longitude: number, heading?: number, speed?: number) {
        if (this.socket && this.driverId) {
            this.socket.emit('driver:location', {
                driverId: this.driverId,
                latitude,
                longitude,
                heading: heading || 0,
                speed: speed || 0,
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
            this.socket.emit('delivery:start', {
                deliveryId,
                driverId: this.driverId,
                pickup,
                dropoff,
                customerInfo,
                estimatedArrival,
            });
        }
    }

    completeDelivery(deliveryId: string) {
        if (this.socket) {
            this.socket.emit('delivery:complete', {
                deliveryId,
            });
        }
    }

    updateDriverStatus(status: 'available' | 'busy' | 'offline') {
        if (this.socket && this.driverId) {
            this.socket.emit('driver:status', {
                driverId: this.driverId,
                status,
            });
        }
    }

    subscribeToDelivery(deliveryId: string) {
        if (this.socket) {
            this.socket.emit('delivery:subscribe', {
                deliveryId,
            });
        }
    }

    unsubscribeFromDelivery(deliveryId: string) {
        if (this.socket) {
            this.socket.emit('delivery:unsubscribe', {
                deliveryId,
            });
        }
    }

    onDriverLocationUpdate(callback: (data: any) => void) {
        if (this.socket) {
            this.socket.on('driver:location:update', callback);
        }
    }

    onDeliveryUpdate(callback: (data: any) => void) {
        if (this.socket) {
            this.socket.on('delivery:update', callback);
        }
    }

    onDeliveryStarted(callback: (data: any) => void) {
        if (this.socket) {
            this.socket.on('delivery:started', callback);
        }
    }

    onDeliveryCompleted(callback: (data: any) => void) {
        if (this.socket) {
            this.socket.on('delivery:completed', callback);
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
