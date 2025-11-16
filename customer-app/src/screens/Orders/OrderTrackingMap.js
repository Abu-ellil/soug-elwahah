import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import COLORS from '../../constants/colors';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.01;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export default function OrderTrackingMap({ order, height = 300 }) {
  const [userLocation, setUserLocation] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [estimatedTime, setEstimatedTime] = useState('');
  const [distance, setDistance] = useState('');
  const mapRef = useRef(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (order.driverLocation && userLocation) {
      calculateRoute();
      fitMapToMarkers();
    }
  }, [order.driverLocation, userLocation]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('خطأ', 'يجب السماح بالوصول للموقع لعرض الخريطة');
        return;
      }

      // Add more specific location options to handle different scenarios
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 10000, // 10 seconds timeout
        maximumAge: 300000, // 5 minutes maximum age
      });
      setUserLocation(location);
    } catch (error) {
      console.error('Error getting location:', error);

      // Handle different types of location errors
      if (error.code === 1) {
        // PERMISSION_DENIED
        Alert.alert('خطأ', 'تم رفض إذن الموقع. يرجى التحقق من إعدادات التطبيق.');
      } else if (error.code === 2) {
        // POSITION_UNAVAILABLE
        Alert.alert('خطأ', 'الموقع غير متوفر حاليًا. تأكد من أن خدمات الموقع مفعلة.');
      } else if (error.code === 3) {
        // TIMEOUT
        Alert.alert('خطأ', 'انتهت مهلة الحصول على الموقع. يرجى المحاولة مرة أخرى.');
      } else {
        // For other errors or when error code is not available
        Alert.alert('خطأ', 'لا يمكن الوصول إلى الموقع حاليًا. تأكد من أن خدمات الموقع مفعلة.');
      }
    }
  };

  const calculateRoute = async () => {
    if (!order.driverLocation || !userLocation) return;

    try {
      // In a real app, you would use a routing service like Google Directions API
      // For now, we'll create a simple straight line with some waypoints
      const driverLat = order.driverLocation.latitude;
      const driverLng = order.driverLocation.longitude;
      const userLat = userLocation.coords.latitude;
      const userLng = userLocation.coords.longitude;

      // Create a simple route with intermediate points
      const route = [
        { latitude: driverLat, longitude: driverLng },
        // Add some intermediate points for a more realistic route
        {
          latitude: driverLat + (userLat - driverLat) * 0.3,
          longitude: driverLng + (userLng - driverLng) * 0.3,
        },
        {
          latitude: driverLat + (userLat - driverLat) * 0.7,
          longitude: driverLng + (userLng - driverLng) * 0.7,
        },
        { latitude: userLat, longitude: userLng },
      ];

      setRouteCoordinates(route);

      // Calculate estimated time and distance
      const distanceKm = calculateDistance(driverLat, driverLng, userLat, userLng);
      const estimatedMinutes = Math.ceil(distanceKm * 3); // Rough estimate: 3 minutes per km

      setDistance(`${distanceKm.toFixed(1)} كم`);
      setEstimatedTime(`${estimatedMinutes} دقيقة`);
    } catch (error) {
      console.error('Error calculating route:', error);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const fitMapToMarkers = () => {
    if (!mapRef.current || !order.driverLocation || !userLocation) return;

    const coordinates = [
      {
        latitude: order.driverLocation.latitude,
        longitude: order.driverLocation.longitude,
      },
      {
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
      },
    ];

    mapRef.current.fitToCoordinates(coordinates, {
      edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
      animated: true,
    });
  };

  const getDeliveryAddress = () => {
    if (order.deliveryInfo?.address) {
      const addr = order.deliveryInfo.address;
      return [addr.street, addr.buildingNumber, addr.floor, addr.apartment]
        .filter(Boolean)
        .join(', ');
    }
    return 'عنوان التوصيل';
  };

  if (!order.driverLocation) {
    return (
      <View
        style={[styles.container, { height }]}
        className="items-center justify-center bg-gray-200">
        <Ionicons name="location-outline" size={48} color={COLORS.gray} />
        <Text className="mt-2 text-neutral-600">لا توجد معلومات عن موقع السائق</Text>
      </View>
    );
  }

  if (!userLocation) {
    return (
      <View
        style={[styles.container, { height }]}
        className="items-center justify-center bg-gray-200">
        <Ionicons name="alert-circle-outline" size={48} color={COLORS.orange} />
        <Text className="mt-2 px-4 text-center text-neutral-600">الموقع غير متوفر</Text>
        <Text className="mt-1 px-4 text-center text-sm text-neutral-500">
          تأكد من تفعيل خدمات الموقع وتمكين إذن الموقع للتطبيق
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }]}>
      

      {/* Info Overlay */}
      <View style={styles.infoOverlay}>
        <View style={styles.infoCard}>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="time-outline" size={16} color={COLORS.primary} />
              <Text className="text-primary-600 ml-1 text-sm font-medium">{estimatedTime}</Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="navigate-outline" size={16} color={COLORS.primary} />
              <Text className="text-primary-600 ml-1 text-sm font-medium">{distance}</Text>
            </View>
          </View>

          {order.driverName && (
            <Text className="mt-1 text-xs text-neutral-600">السائق: {order.driverName}</Text>
          )}
        </View>
      </View>

      {/* Status Badge */}
      <View style={styles.statusBadge}>
        <View className="rounded-full bg-orange-500 px-3 py-1">
          <Text className="text-xs font-bold text-white">في الطريق إليك</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  driverMarker: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  destinationMarker: {
    backgroundColor: COLORS.secondary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  infoOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statusBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
  },
});
