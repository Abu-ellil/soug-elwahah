import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import COLORS from '../constants/colors';
import RTLText from './RTLText';

const DriverLocationMap = ({ driverLocation, deliveryAddress, orderStatus }) => {
  if (!driverLocation || !deliveryAddress) {
    return (
      <View style={styles.container}>
        <RTLText style={styles.errorText}>لا توجد معلومات عن موقع السائق</RTLText>
      </View>
    );
  }

  // Calculate region to show both driver and delivery locations
  const getRegionForCoordinates = () => {
    const coordinates = [driverLocation, deliveryAddress.coordinates];

    let minLat = Math.min(...coordinates.map((coord) => coord.lat));
    let maxLat = Math.max(...coordinates.map((coord) => coord.lat));
    let minLng = Math.min(...coordinates.map((coord) => coord.lng));
    let maxLng = Math.max(...coordinates.map((coord) => coord.lng));

    const latDelta = Math.max(maxLat - minLat, 0.01) * 1.5;
    const lngDelta = Math.max(maxLng - minLng, 0.01) * 1.5;

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta,
    };
  };

  const region = getRegionForCoordinates();

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
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={region}
        showsUserLocation={false}
        showsMyLocationButton={false}
        zoomEnabled={true}
        scrollEnabled={true}>
        {/* Driver Location Marker */}
        <Marker
          coordinate={{
            latitude: driverLocation.lat,
            longitude: driverLocation.lng,
          }}
          title="موقع السائق"
          description="السائق في الطريق إليك"
          pinColor={COLORS.primary}>
          <View style={styles.driverMarker}>
            <View style={styles.driverMarkerInner} />
          </View>
        </Marker>

        {/* Delivery Address Marker */}
        <Marker
          coordinate={{
            latitude: deliveryAddress.coordinates.lat,
            longitude: deliveryAddress.coordinates.lng,
          }}
          title="عنوان التوصيل"
          description={deliveryAddress.street}
          pinColor={COLORS.success}>
          <View style={styles.deliveryMarker}>
            <View style={styles.deliveryMarkerInner} />
          </View>
        </Marker>
      </MapView>

      {/* Estimated delivery time info */}
      <View style={styles.infoContainer}>
        <RTLText style={styles.infoText}>
          الوقت المتوقع للوصول: {estimatedDeliveryTime} دقيقة
        </RTLText>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
          <RTLText style={styles.legendText}>موقع السائق</RTLText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.success }]} />
          <RTLText style={styles.legendText}>عنوان التوصيل</RTLText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 300,
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 16,
  },
  map: {
    flex: 1,
  },
  driverMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  driverMarkerInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
  },
  deliveryMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  deliveryMarkerInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
  },
  infoContainer: {
    backgroundColor: COLORS.primary,
    padding: 12,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  legendText: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  errorText: {
    textAlign: 'center',
    color: COLORS.danger,
    padding: 20,
  },
});

export default DriverLocationMap;
