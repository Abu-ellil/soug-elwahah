import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Alert,
} from 'react-native';
import { Navigation2, MapPin, Package, CheckCircle } from 'lucide-react-native';
import DeliveryMap from '../../components/DeliveryMap';
import socketService from '../../services/socketService';
import { useLocationTracking } from '../../services/locationService';

interface DeliveryInfo {
    deliveryId: string;
    pickup: {
        latitude: number;
        longitude: number;
        address: string;
    };
    dropoff: {
        latitude: number;
        longitude: number;
        address: string;
    };
    customerName: string;
    customerPhone: string;
}

export default function TrackingScreen() {
    const [isTracking, setIsTracking] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [deliveryRoute, setDeliveryRoute] = useState<any[]>([]);
    const [activeDelivery, setActiveDelivery] = useState<DeliveryInfo | null>(null);

    // Mock driver ID - replace with actual authenticated driver ID
    const driverId = 'driver_123';
    const driverName = 'John Doe';
    const vehicle = 'Toyota Camry - ABC123';

    // Use location tracking hook
    const { location, error, permissionStatus } = useLocationTracking(
        isTracking ? driverId : null,
        isTracking
    );

    useEffect(() => {
        // Connect to Socket.IO server
        const socket = socketService.connect(driverId, driverName, vehicle);

        if (socket) {
            setIsConnected(true);

            // Listen for delivery updates
            socketService.onDeliveryUpdate((data) => {
                console.log('Delivery update:', data);
                if (data.route) {
                    setDeliveryRoute(data.route);
                }
            });

            socketService.onDeliveryStarted((data) => {
                console.log('Delivery started:', data);
                Alert.alert('Delivery Started', `Delivery ${data.deliveryId} has been started`);
            });

            socketService.onDeliveryCompleted((data) => {
                console.log('Delivery completed:', data);
                Alert.alert('Delivery Completed', `Delivery ${data.deliveryId} has been completed`);
                setActiveDelivery(null);
                setDeliveryRoute([]);
            });
        }

        return () => {
            socketService.disconnect();
            setIsConnected(false);
        };
    }, []);

    const handleStartTracking = () => {
        if (permissionStatus !== 'granted') {
            Alert.alert(
                'Permission Required',
                'Please grant location permission to start tracking'
            );
            return;
        }
        setIsTracking(true);
        socketService.updateDriverStatus('available');
    };

    const handleStopTracking = () => {
        setIsTracking(false);
        socketService.updateDriverStatus('offline');
    };

    const handleStartDelivery = () => {
        // Mock delivery data - replace with actual delivery data
        const mockDelivery: DeliveryInfo = {
            deliveryId: `delivery_${Date.now()}`,
            pickup: {
                latitude: location?.latitude || 0,
                longitude: location?.longitude || 0,
                address: '123 Pickup Street',
            },
            dropoff: {
                latitude: (location?.latitude || 0) + 0.01,
                longitude: (location?.longitude || 0) + 0.01,
                address: '456 Dropoff Avenue',
            },
            customerName: 'Jane Smith',
            customerPhone: '+1234567890',
        };

        setActiveDelivery(mockDelivery);

        socketService.startDelivery(
            mockDelivery.deliveryId,
            mockDelivery.pickup,
            mockDelivery.dropoff,
            {
                name: mockDelivery.customerName,
                phone: mockDelivery.customerPhone,
            }
        );

        socketService.updateDriverStatus('busy');
    };

    const handleCompleteDelivery = () => {
        if (activeDelivery) {
            Alert.alert(
                'Complete Delivery',
                'Are you sure you want to mark this delivery as completed?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Complete',
                        onPress: () => {
                            socketService.completeDelivery(activeDelivery.deliveryId);
                            socketService.updateDriverStatus('available');
                        },
                    },
                ]
            );
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <Navigation2 size={24} color="#3B82F6" />
                    <Text style={styles.headerTitle}>Live Tracking</Text>
                </View>
                <View style={[styles.statusBadge, isConnected ? styles.connected : styles.disconnected]}>
                    <View style={[styles.statusDot, isConnected ? styles.connectedDot : styles.disconnectedDot]} />
                    <Text style={styles.statusText}>
                        {isConnected ? 'Connected' : 'Disconnected'}
                    </Text>
                </View>
            </View>

            {/* Map */}
            <View style={styles.mapContainer}>
                <DeliveryMap
                    currentLocation={location ? {
                        latitude: location.latitude,
                        longitude: location.longitude,
                    } : null}
                    pickupLocation={activeDelivery?.pickup}
                    dropoffLocation={activeDelivery?.dropoff}
                    route={deliveryRoute}
                    showRoute={true}
                    heading={location?.heading || undefined}
                />
            </View>

            {/* Info Panel */}
            <View style={styles.infoPanel}>
                {location && (
                    <View style={styles.locationInfo}>
                        <Text style={styles.infoLabel}>Current Location</Text>
                        <Text style={styles.infoValue}>
                            {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                        </Text>
                        {location.speed !== null && (
                            <Text style={styles.infoValue}>
                                Speed: {(location.speed * 3.6).toFixed(1)} km/h
                            </Text>
                        )}
                    </View>
                )}

                {activeDelivery && (
                    <View style={styles.deliveryInfo}>
                        <View style={styles.deliveryHeader}>
                            <Package size={20} color="#3B82F6" />
                            <Text style={styles.deliveryTitle}>Active Delivery</Text>
                        </View>
                        <View style={styles.deliveryDetails}>
                            <View style={styles.deliveryRow}>
                                <MapPin size={16} color="#10B981" />
                                <Text style={styles.deliveryText}>{activeDelivery.pickup.address}</Text>
                            </View>
                            <View style={styles.deliveryRow}>
                                <MapPin size={16} color="#EF4444" />
                                <Text style={styles.deliveryText}>{activeDelivery.dropoff.address}</Text>
                            </View>
                            <Text style={styles.customerText}>
                                Customer: {activeDelivery.customerName}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Control Buttons */}
                <View style={styles.controls}>
                    {!isTracking ? (
                        <TouchableOpacity
                            style={[styles.button, styles.startButton]}
                            onPress={handleStartTracking}
                        >
                            <Navigation2 size={20} color="#FFFFFF" />
                            <Text style={styles.buttonText}>Start Tracking</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={[styles.button, styles.stopButton]}
                            onPress={handleStopTracking}
                        >
                            <Text style={styles.buttonText}>Stop Tracking</Text>
                        </TouchableOpacity>
                    )}

                    {isTracking && !activeDelivery && (
                        <TouchableOpacity
                            style={[styles.button, styles.deliveryButton]}
                            onPress={handleStartDelivery}
                        >
                            <Package size={20} color="#FFFFFF" />
                            <Text style={styles.buttonText}>Start Delivery</Text>
                        </TouchableOpacity>
                    )}

                    {activeDelivery && (
                        <TouchableOpacity
                            style={[styles.button, styles.completeButton]}
                            onPress={handleCompleteDelivery}
                        >
                            <CheckCircle size={20} color="#FFFFFF" />
                            <Text style={styles.buttonText}>Complete Delivery</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {error && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6,
    },
    connected: {
        backgroundColor: '#D1FAE5',
    },
    disconnected: {
        backgroundColor: '#FEE2E2',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    connectedDot: {
        backgroundColor: '#10B981',
    },
    disconnectedDot: {
        backgroundColor: '#EF4444',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#374151',
    },
    mapContainer: {
        flex: 1,
    },
    infoPanel: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    locationInfo: {
        marginBottom: 16,
    },
    infoLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 14,
        color: '#111827',
        marginBottom: 2,
    },
    deliveryInfo: {
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
    },
    deliveryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    deliveryTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    deliveryDetails: {
        gap: 8,
    },
    deliveryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    deliveryText: {
        fontSize: 14,
        color: '#374151',
        flex: 1,
    },
    customerText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginTop: 4,
    },
    controls: {
        gap: 12,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
    },
    startButton: {
        backgroundColor: '#3B82F6',
    },
    stopButton: {
        backgroundColor: '#EF4444',
    },
    deliveryButton: {
        backgroundColor: '#10B981',
    },
    completeButton: {
        backgroundColor: '#8B5CF6',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    errorContainer: {
        marginTop: 12,
        padding: 12,
        backgroundColor: '#FEE2E2',
        borderRadius: 8,
    },
    errorText: {
        fontSize: 14,
        color: '#DC2626',
        textAlign: 'center',
    },
});
