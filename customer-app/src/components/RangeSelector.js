import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import COLORS from '../constants/colors';
import SIZES from '../constants/sizes';

const RangeSelector = ({
  value,
  onValueChange,
  min = 20,
  max = 200,
  step = 5,
  unit = 'كم',
  title = 'نطاق التوصيل',
}) => {
  const decreaseValue = () => {
    const newValue = Math.max(min, value - step);
    onValueChange(newValue);
  };

  const increaseValue = () => {
    const newValue = Math.min(max, value + step);
    onValueChange(newValue);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.selectorContainer}>
        <TouchableOpacity
          style={[styles.button, value <= min && styles.buttonDisabled]}
          onPress={decreaseValue}
          disabled={value <= min}>
          <MaterialIcons
            name="remove"
            size={20}
            color={value <= min ? COLORS.gray : COLORS.primary}
          />
        </TouchableOpacity>

        <View style={styles.valueContainer}>
          <Text style={styles.value}>{value}</Text>
          <Text style={styles.unit}>{unit}</Text>
        </View>

        <TouchableOpacity
          style={[styles.button, value >= max && styles.buttonDisabled]}
          onPress={increaseValue}
          disabled={value >= max}>
          <MaterialIcons name="add" size={20} color={value >= max ? COLORS.gray : COLORS.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SIZES.base,
  },
  title: {
    fontSize: SIZES.body2,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.base,
    textAlign: 'right',
  },
  selectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.base,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  valueContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'baseline',
  },
  value: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginRight: SIZES.base / 2,
  },
  unit: {
    fontSize: SIZES.body3,
    color: COLORS.gray,
  },
});

export default RangeSelector;
