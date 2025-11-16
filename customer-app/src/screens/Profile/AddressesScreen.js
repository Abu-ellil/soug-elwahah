import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import Header from '../../components/Header';
import RTLText from '../../components/RTLText';
import COLORS from '../../constants/colors';
import SIZES from '../../constants/sizes';
import { API } from '../../services/api';

const AddressesScreen = ({ navigation, route }) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load addresses from API
  useEffect(() => {
    loadAddresses();
  }, []);

  // Check if a new address was added
  React.useEffect(() => {
    if (route.params?.newAddress) {
      setAddresses(prev => [...prev, route.params.newAddress]);
      // Clear the param
      navigation.setParams({ newAddress: undefined });
    }
  }, [route.params?.newAddress, navigation]);

  const loadAddresses = async () => {
    try {
      const response = await API.addressesAPI.getAddresses();
      if (response.success) {
        setAddresses(response.data.addresses);
      } else {
        setAddresses([]);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = (id) => {
    const updatedAddresses = addresses.map((addr) => ({
      ...addr,
      isDefault: addr.id === id,
    }));
    setAddresses(updatedAddresses);
    Alert.alert('تم بنجاح', 'تم تحديد هذا العنوان كعنوان افتراضي.');
  };

  const handleDelete = (id) => {
    Alert.alert('تأكيد الحذف', 'هل أنت متأكد أنك تريد حذف هذا العنوان؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: () => {
          const updatedAddresses = addresses.filter((addr) => addr.id !== id);
          setAddresses(updatedAddresses);
        },
      },
    ]);
  };

  const renderAddress = ({ item }) => (
    <View style={styles.addressCard}>
      <View style={styles.addressInfo}>
        <Feather name="map-pin" size={24} color={COLORS.primary} />
        <View style={styles.addressTextContainer}>
          <RTLText style={styles.addressLabel}>{item.label}</RTLText>
          <RTLText style={styles.addressStreet}>{item.street}</RTLText>
          <RTLText style={styles.addressVillage}>{item.village}</RTLText>
        </View>
      </View>
      <View style={styles.addressActions}>
        {item.isDefault ? (
          <View style={styles.defaultBadge}>
            <RTLText style={styles.defaultBadgeText}>الافتراضي</RTLText>
          </View>
        ) : (
          <TouchableOpacity style={styles.actionButton} onPress={() => handleSetDefault(item.id)}>
            <RTLText style={styles.actionButtonText}>تعيين كافتراضي</RTLText>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item.id)}>
          <Feather name="trash-2" size={18} color={COLORS.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header title="عناويني" showBackButton={true} />
      <FlatList
        data={addresses}
        renderItem={renderAddress}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListFooterComponent={
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddAddress')}>
            <Feather name="plus" size={20} color={COLORS.white} />
            <RTLText style={styles.addButtonText}>إضافة عنوان جديد</RTLText>
          </TouchableOpacity>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS?.background || '#F8F9FA',
  },
  listContainer: {
    padding: SIZES?.padding || 16,
  },
  addressCard: {
    backgroundColor: COLORS?.white || '#FFFFFF',
    borderRadius: SIZES?.radius || 8,
    padding: SIZES?.padding || 16,
    marginBottom: SIZES?.padding || 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  addressInfo: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  addressTextContainer: {
    marginRight: SIZES?.padding || 16,
    alignItems: 'flex-end',
  },
  addressLabel: {
    fontSize: SIZES?.body2 || 14,
    fontWeight: 'bold',
    color: COLORS?.primary || '#FF6B35',
    marginBottom: 2,
  },
  addressStreet: {
    fontSize: SIZES?.body3 || 12,
    fontWeight: 'bold',
    color: COLORS?.dark || '#2D3436',
  },
  addressVillage: {
    fontSize: SIZES?.body4 || 12,
    color: COLORS?.gray || '#636E72',
  },
  addressActions: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SIZES?.padding || 16,
    paddingTop: SIZES?.base || 8,
    borderTopWidth: 1,
    borderTopColor: COLORS?.lightGray || '#DFE6E9',
  },
  actionButton: {
    paddingHorizontal: SIZES?.base || 8,
    paddingVertical: (SIZES?.base || 8) / 2,
  },
  actionButtonText: {
    color: COLORS?.primary || '#FF6B35',
    fontWeight: 'bold',
  },
  deleteButton: {
    // marginLeft: SIZES?.base,
  },
  defaultBadge: {
    backgroundColor: COLORS?.success || '#06D6A0',
    borderRadius: (SIZES?.radius || 8) / 2,
    paddingHorizontal: SIZES?.base || 8,
    paddingVertical: 4,
  },
  defaultBadgeText: {
    color: COLORS?.white || '#FFFFFF',
    fontSize: SIZES?.caption || 12,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: COLORS?.primary || '#FF6B35',
    borderRadius: SIZES?.radius || 8,
    padding: SIZES?.padding || 16,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SIZES?.base || 8,
  },
  addButtonText: {
    color: COLORS?.white || '#FFFFFF',
    fontSize: SIZES?.h4 || 20,
    fontWeight: 'bold',
    marginRight: SIZES?.base || 8,
  },
});

export default AddressesScreen;
