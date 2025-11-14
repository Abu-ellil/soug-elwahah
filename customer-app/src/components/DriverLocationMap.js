import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { COLORS } from '../constants/colors';
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
    
    let minLat = Math.min(...coordinates.map(coord => coord.lat));
    let maxLat = Math.max(...coordinates.map(coord => coord.lat));
    let minLng = Math.min(...coordinates.map(coord => coord.lng));
    let maxLng = Math.max(...coordinates.map(coord => coord.lng));
    
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

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={region}
        showsUserLocation={false}
        showsMyLocationButton={false}
        zoomEnabled={true}
        scrollEnabled={true}
      >
        {/* Driver Location Marker */}
        <Marker
          coordinate={{
            latitude: driverLocation.lat,
            longitude: driverLocation.lng,
          }}
          title="موقع السائق"
          description="السائق في الطريق إليك"
          pinColor={COLORS.primary}
        >
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
          pinColor={COLORS.success}
        >
          <View style={styles.deliveryMarker}>
            <View style={styles.deliveryMarkerInner} />
          </View>
        </Marker>
      </MapView>
      
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