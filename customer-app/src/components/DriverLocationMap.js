import React from 'react';
import { View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import RTLText from './RTLText';
import { isValidCoordinate } from '../utils/locationHelpers';

const DriverLocationMap = ({ driverLocation, deliveryAddress, orderStatus }) => {
  if (!driverLocation || !deliveryAddress || !deliveryAddress.coordinates) {
    return (
      <View className="my-4 h-[300px] w-full items-center justify-center overflow-hidden rounded-xl bg-white p-5">
        <RTLText className="p-5 text-center text-red-50">لا توجد معلومات عن موقع السائق</RTLText>
      </View>
    );
  }

  // Calculate region to show both driver and delivery locations
  const getMapRegion = () => {
    // Check if coordinates exist before accessing them
    if (
      !driverLocation ||
      !driverLocation.lng ||
      !driverLocation.lat ||
      !deliveryAddress ||
      !deliveryAddress.coordinates ||
      !deliveryAddress.coordinates.lng ||
      !deliveryAddress.coordinates.lat
    ) {
      // Return a default region if coordinates are missing (Cairo fallback)
      return {
        latitude: 31.2357,
        longitude: 30.0444,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
    }

    const driverCoord = [driverLocation.lng, driverLocation.lat];
    const deliveryCoord = [deliveryAddress.coordinates.lng, deliveryAddress.coordinates.lat];

    // Validate coordinates
    if (!isValidCoordinate(driverCoord) || !isValidCoordinate(deliveryCoord)) {
      // Return a default region if coordinates are invalid (Cairo fallback)
      return {
        latitude: 31.2357,
        longitude: 30.0444,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
    }

    const coordinates = [driverCoord, deliveryCoord];
    let minLng = Math.min(...coordinates.map((coord) => coord[0]));
    let maxLng = Math.max(...coordinates.map((coord) => coord[0]));
    let minLat = Math.min(...coordinates.map((coord) => coord[1]));
    let maxLat = Math.max(...coordinates.map((coord) => coord[1]));

    const centerLng = (minLng + maxLng) / 2;
    const centerLat = (minLat + maxLat) / 2;

    // Calculate region deltas based on the span of coordinates
    const lngDelta = Math.max(0.01, (maxLng - minLng) * 1.5); // Add padding
    const latDelta = Math.max(0.01, (maxLat - minLat) * 1.5); // Add padding

    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta,
    };
  };

  const mapRegion = getMapRegion();

  // Calculate distance between two points using Haversine formula (in km)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  // Calculate estimated delivery time (in minutes)
  const calculateEstimatedDeliveryTime = () => {
    // Check if coordinates exist before calculating distance
    if (
      !driverLocation ||
      !driverLocation.lat ||
      !driverLocation.lng ||
      !deliveryAddress ||
      !deliveryAddress.coordinates ||
      !deliveryAddress.coordinates.lat ||
      !deliveryAddress.coordinates.lng
    ) {
      // Return a default time if coordinates are missing
      return Math.floor(Math.random() * 10) + 5; // 5-15 minutes default
    }

    const distance = calculateDistance(
      driverLocation.lat,
      driverLocation.lng,
      deliveryAddress.coordinates.lat,
      deliveryAddress.coordinates.lng
    );

    // Assuming average delivery speed of 20 km/h
    const averageSpeedKmPerHour = 20;
    const estimatedTimeHours = distance / averageSpeedKmPerHour;
    const estimatedTimeMinutes = Math.round(estimatedTimeHours * 60);

    // Add some buffer time (2-5 minutes) for stops, parking, etc.
    return estimatedTimeMinutes + Math.floor(Math.random() * 4) + 2;
  };

  const estimatedDeliveryTime = calculateEstimatedDeliveryTime();

  return (
    <View className="my-4 h-[300px] w-full overflow-hidden rounded-xl bg-white">
      <MapView
        style={{ flex: 1 }}
        initialRegion={mapRegion}
        showsUserLocation={false}
        showsMyLocationButton={false}>
        {/* Driver Marker */}
        {driverLocation && driverLocation.lat && driverLocation.lng && (
          <Marker
            coordinate={{
              latitude: driverLocation.lat,
              longitude: driverLocation.lng,
            }}
            title="موقع السائق"
            pinColor="orange"
          />
        )}

        {/* Delivery Marker */}
        {deliveryAddress &&
          deliveryAddress.coordinates &&
          deliveryAddress.coordinates.lat &&
          deliveryAddress.coordinates.lng && (
            <Marker
              coordinate={{
                latitude: deliveryAddress.coordinates.lat,
                longitude: deliveryAddress.coordinates.lng,
              }}
              title="عنوان التوصيل"
              pinColor="green"
            />
          )}
      </MapView>

      {/* Estimated delivery time info */}
      {estimatedDeliveryTime && (
        <View className="items-center bg-orange-500 p-3">
          <RTLText className="text-center text-base font-bold text-white">
            الوقت المتوقع للوصول: {estimatedDeliveryTime} دقيقة
          </RTLText>
        </View>
      )}

      <View className="flex-row justify-around border-t border-gray-200 bg-white py-2">
        <View className="flex-row items-center">
          <View className="mx-1 h-3 w-3 rounded bg-orange-500" />
          <RTLText className="text-xs text-gray-600">موقع السائق</RTLText>
        </View>
        <View className="flex-row items-center">
          <View className="mx-1 h-3 w-3 rounded bg-green-500" />
          <RTLText className="text-xs text-gray-600">عنوان التوصيل</RTLText>
        </View>
      </View>
    </View>
  );
};

export default DriverLocationMap;
