import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import Header from '../../components/Header';
import RTLText from '../../components/RTLText';
import { COLORS } from '../../constants/colors';
import { SIZES } from '../../constants/sizes';
import { MOCK_ADDRESSES } from '../../data/addresses'; // Assuming you create this file

const AddressesScreen = ({ navigation }) => {
  const [addresses, setAddresses] = useState(MOCK_ADDRESSES);

  const handleSetDefault = (id) => {
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id,
    }));
    setAddresses(updatedAddresses);
    Alert.alert('تم بنجاح', 'تم تحديد هذا العنوان كعنوان افتراضي.');
  };

  const handleDelete = (id) => {
    Alert.alert(
      'تأكيد الحذف',
      'هل أنت متأكد أنك تريد حذف هذا العنوان؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: () => {
            const updatedAddresses = addresses.filter(addr => addr.id !== id);
            setAddresses(updatedAddresses);
          },
        },
      ]
    );
  };

  const renderAddress = ({ item }) => (
    <View style={styles.addressCard}>
      <View style={styles.addressInfo}>
        <Feather name="map-pin" size={24} color={COLORS.primary} />
        <View style={styles.addressTextContainer}>
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
        <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDelete(item.id)}>
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
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListFooterComponent={
          <TouchableOpacity style={styles.addButton} onPress={() => Alert.alert('إضافة عنوان', 'سيتم إضافة شاشة لإضافة عنوان جديد هنا.')}>
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
    backgroundColor: COLORS.background,
  },
  listContainer: {
    padding: SIZES.padding,
  },
  addressCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.padding,
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
    marginRight: SIZES.padding,
    alignItems: 'flex-end',
  },
  addressStreet: {
    fontSize: SIZES.body3,
    fontWeight: 'bold',
    color: COLORS.dark,
  },
  addressVillage: {
    fontSize: SIZES.body4,
    color: COLORS.gray,
  },
  addressActions: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SIZES.padding,
    paddingTop: SIZES.base,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  actionButton: {
    paddingHorizontal: SIZES.base,
    paddingVertical: SIZES.base / 2,
  },
  actionButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  deleteButton: {
    // marginLeft: SIZES.base,
  },
  defaultBadge: {
    backgroundColor: COLORS.success,
    borderRadius: SIZES.radius / 2,
    paddingHorizontal: SIZES.base,
    paddingVertical: 4,
  },
  defaultBadgeText: {
    color: COLORS.white,
    fontSize: SIZES.caption,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SIZES.base,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    marginRight: SIZES.base,
  },
});

export default AddressesScreen;
