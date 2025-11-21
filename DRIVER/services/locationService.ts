import * as Location from 'expo-location';
import { useEffect, useState, useRef } from 'react';
import socketService from './socketService';

export interface LocationData {
    latitude: number;
    longitude: number;
    heading: number | null;
    speed: number | null;
    accuracy: number | null;
    timestamp: number;
}

export const useLocationTracking = (driverId: string | null, isActive: boolean = true) => {
    const [location, setLocation] = useState<LocationData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [permissionStatus, setPermissionStatus] = useState<Location.PermissionStatus | null>(null);
    const locationSubscription = useRef<Location.LocationSubscription | null>(null);

    useEffect(() => {
        let isMounted = true;

        const requestPermissions = async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (isMounted) {
                    setPermissionStatus(status);

                    if (status !== 'granted') {
                        setError('Location permission not granted');
                        return;
                    }

                    // Request background location permission for continuous tracking
                    const backgroundStatus = await Location.requestBackgroundPermissionsAsync();
                    console.log('Background permission:', backgroundStatus.status);
                }
            } catch (err) {
                if (isMounted) {
                    setError('Failed to request location permissions');
                    console.error(err);
                }
            }
        };

        requestPermissions();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        if (!isActive || !driverId || permissionStatus !== 'granted') {
            return;
        }

        const startTracking = async () => {
            try {
                // Start watching location with high accuracy
                locationSubscription.current = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.BestForNavigation,
                        timeInterval: 5000, // Update every 5 seconds
                        distanceInterval: 10, // Update every 10 meters
                    },
                    (newLocation) => {
                        const locationData: LocationData = {
                            latitude: newLocation.coords.latitude,
                            longitude: newLocation.coords.longitude,
                            heading: newLocation.coords.heading,
                            speed: newLocation.coords.speed,
                            accuracy: newLocation.coords.accuracy,
                            timestamp: newLocation.timestamp,
                        };

                        setLocation(locationData);

                        // Send location to server via Socket.IO
                        socketService.updateLocation(
                            locationData.latitude,
                            locationData.longitude,
                            locationData.heading || undefined,
                            locationData.speed || undefined
                        );
                    }
                );
            } catch (err) {
                setError('Failed to start location tracking');
                console.error(err);
            }
        };

        startTracking();

        return () => {
            if (locationSubscription.current) {
                locationSubscription.current.remove();
                locationSubscription.current = null;
            }
        };
    }, [driverId, isActive, permissionStatus]);

    const getCurrentLocation = async (): Promise<LocationData | null> => {
        try {
            const currentLocation = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.BestForNavigation,
            });

            return {
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
                heading: currentLocation.coords.heading,
                speed: currentLocation.coords.speed,
                accuracy: currentLocation.coords.accuracy,
                timestamp: currentLocation.timestamp,
            };
        } catch (err) {
            console.error('Failed to get current location:', err);
            return null;
        }
    };

    return {
        location,
        error,
        permissionStatus,
        getCurrentLocation,
    };
};
