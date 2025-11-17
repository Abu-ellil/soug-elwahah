import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useLocation } from '../context/LocationProvider';
import COLORS from '../constants/colors';
import SIZES from '../constants/sizes';

const DebugLocationSetter = () => {
 const { setLocation, updateDeliveryRadius, deliveryRadius } = useLocation();

  const setToTargetLocation = () => {
    // Set location to the coordinates you specified
    setLocation({
      lat: 29.9360,
      lng: 30.9295,
    });
    // Set a larger delivery radius to ensure stores are found
    updateDeliveryRadius(50); // 50km radius to be sure
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={setToTargetLocation}>
        <Text style={styles.buttonText}>Set Location to 29.9360, 30.9295</Text>
      </TouchableOpacity>
      <Text style={styles.radiusText}>Current Radius: {deliveryRadius} km</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SIZES.padding,
    backgroundColor: '#f0f0f0',
    margin: SIZES.base,
    borderRadius: SIZES.borderRadius,
    alignItems: 'center',
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.base,
    paddingHorizontal: SIZES.padding,
    borderRadius: SIZES.borderRadius,
    marginBottom: SIZES.base,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  radiusText: {
    fontSize: SIZES.body3,
    color: COLORS.text,
  },
});

export default DebugLocationSetter;