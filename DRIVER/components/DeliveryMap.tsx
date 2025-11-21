import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { MapPin, Navigation, Package } from 'lucide-react-native';

interface Location {
    latitude: number;
    longitude: number;
}

interface DeliveryMapProps {
    currentLocation: Location | null;
    pickupLocation?: Location;
    dropoffLocation?: Location;
    route?: Location[];
    showRoute?: boolean;
    heading?: number | null;
}

export default function DeliveryMap({
    currentLocation,
    pickupLocation,
    dropoffLocation,
    route = [],
    showRoute = true,
    heading,
}: DeliveryMapProps) {
    const mapRef = useRef<MapView>(null);
    const [region, setRegion] = useState<Region | null>(null);

    useEffect(() => {
        if (currentLocation) {
            const newRegion: Region = {
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            };
            setRegion(newRegion);
        }
    }, [currentLocation]);

    useEffect(() => {
        // Fit map to show all markers
        if (mapRef.current && (pickupLocation || dropoffLocation || currentLocation)) {
            const coordinates = [
                currentLocation,
                pickupLocation,
                dropoffLocation,
            ].filter((loc): loc is Location => loc !== null && loc !== undefined);

            if (coordinates.length > 0) {
                mapRef.current.fitToCoordinates(coordinates, {
                    edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                    animated: true,
                });
            }
        }
    }, [pickupLocation, dropoffLocation, currentLocation]);

    if (!region) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingText}>Loading map...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={region}
                showsUserLocation={false}
                showsMyLocationButton={true}
                showsCompass={true}
                showsTraffic={true}
                followsUserLocation={true}
            >
                {/* Current Driver Location */}
                {currentLocation && (
                    <Marker
                        coordinate={currentLocation}
                        title="Your Location"
                        description="Current driver position"
                        rotation={heading || 0}
                        anchor={{ x: 0.5, y: 0.5 }}
                    >
                        <View style={styles.driverMarker}>
                            <Navigation size={24} color="#FFFFFF" fill="#3B82F6" />
                        </View>
                    </Marker>
                )}

                {/* Pickup Location */}
                {pickupLocation && (
                    <Marker
                        coordinate={pickupLocation}
                        title="Pickup Location"
                        description="Pick up the order here"
                        pinColor="#10B981"
                    >
                        <View style={styles.pickupMarker}>
                            <Package size={24} color="#FFFFFF" />
                        </View>
                    </Marker>
                )}

                {/* Dropoff Location */}
                {dropoffLocation && (
                    <Marker
                        coordinate={dropoffLocation}
                        title="Dropoff Location"
                        description="Deliver the order here"
                        pinColor="#EF4444"
                    >
                        <View style={styles.dropoffMarker}>
                            <MapPin size={24} color="#FFFFFF" />
                        </View>
                    </Marker>
                )}

                {/* Route Polyline */}
                {showRoute && route.length > 1 && (
                    <Polyline
                        coordinates={route}
                        strokeColor="#3B82F6"
                        strokeWidth={4}
                        lineDashPattern={[1]}
                    />
                )}

                {/* Planned Route (if we have pickup and dropoff) */}
                {pickupLocation && dropoffLocation && currentLocation && (
                    <>
                        <Polyline
                            coordinates={[currentLocation, pickupLocation]}
                            strokeColor="#10B981"
                            strokeWidth={3}
                            lineDashPattern={[10, 5]}
                        />
                        <Polyline
                            coordinates={[pickupLocation, dropoffLocation]}
                            strokeColor="#EF4444"
                            strokeWidth={3}
                            lineDashPattern={[10, 5]}
                        />
                    </>
                )}
            </MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#6B7280',
    },
    driverMarker: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    pickupMarker: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#10B981',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    dropoffMarker: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#EF4444',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
});
