import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { VILLAGES, getAvailableVillages } from '../data/villages';
import COLORS from '../constants/colors';
import SIZES from '../constants/sizes';

const VillagePicker = ({
  visible,
  onClose,
  onSelect,
  currentLocation,
  title = 'اختر المنطقة',
  placeholder = 'ابحث عن منطقة...',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (visible) {
      loadVillages();
    }
  }, [visible, currentLocation, loadVillages]);

  const loadVillages = useCallback(async () => {
    setLoading(true);
    try {
      let availableVillages = VILLAGES.filter((v) => v.isActive);

      if (currentLocation) {
        availableVillages = getAvailableVillages(currentLocation, 50);
      }

      setVillages(availableVillages);
    } catch (error) {
      Alert.alert('خطأ', 'فشل في تحميل المناطق');
    } finally {
      setLoading(false);
    }
  }, [currentLocation]);

  const filteredVillages = villages.filter(
    (village) => village.name.includes(searchQuery) || village.region.includes(searchQuery)
  );

  const handleSelectVillage = (village) => {
    onSelect(village);
    onClose();
  };

  const renderVillageItem = ({ item }) => (
    <TouchableOpacity style={styles.villageItem} onPress={() => handleSelectVillage(item)}>
      <View style={styles.villageInfo}>
        <Text style={styles.villageName}>{item.name}</Text>
        <Text style={styles.villageRegion}>{item.region}</Text>
        <View style={styles.deliveryInfo}>
          <View style={styles.infoItem}>
            <MaterialIcons name="access-time" size={14} color={COLORS.primary} />
            <Text style={styles.infoText}>{item.deliveryTime}</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons name="local-shipping" size={14} color={COLORS.primary} />
            <Text style={styles.infoText}>{item.deliveryFee} جنيه</Text>
          </View>
          {item.distance && (
            <View style={styles.infoItem}>
              <MaterialIcons name="place" size={14} color={COLORS.primary} />
              <Text style={styles.infoText}>{item.distance.toFixed(1)} كم</Text>
            </View>
          )}
        </View>
      </View>
      <MaterialIcons name="chevron-left" size={24} color={COLORS.gray} />
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color={COLORS.gray} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={placeholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.gray}
            textAlign="right"
          />
        </View>

        {/* Location Status */}
        {currentLocation && (
          <View style={styles.locationStatus}>
            <MaterialIcons name="my-location" size={16} color={COLORS.primary} />
            <Text style={styles.locationText}>تم تحديد موقعك الحالي</Text>
          </View>
        )}

        {/* Villages List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>جاري تحميل المناطق...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredVillages}
            renderItem={renderVillageItem}
            keyExtractor={(item) => item.id}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialIcons name="location-off" size={48} color={COLORS.gray} />
                <Text style={styles.emptyText}>
                  {searchQuery ? 'لا توجد نتائج مطابقة' : 'لا توجد مناطق متاحة'}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  closeButton: {
    padding: SIZES.base,
  },
  title: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: SIZES.padding,
    paddingHorizontal: SIZES.base,
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.borderRadius,
    textAlign: 'right',
  },
  searchIcon: {
    marginRight: SIZES.base,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SIZES.base,
    fontSize: SIZES.body2,
    color: COLORS.text,
    textAlign: 'right',
  },
  locationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SIZES.padding,
    marginBottom: SIZES.base,
    padding: SIZES.base,
    backgroundColor: COLORS.primaryLight,
    borderRadius: SIZES.borderRadius,
  },
  locationText: {
    marginLeft: SIZES.base,
    fontSize: SIZES.body3,
    color: COLORS.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SIZES.base,
    fontSize: SIZES.body2,
    color: COLORS.gray,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: SIZES.padding,
  },
  villageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    padding: SIZES.padding,
    marginBottom: SIZES.base,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  villageInfo: {
    flex: 1,
  },
  villageName: {
    fontSize: SIZES.h6,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
    textAlign: 'right',
  },
  villageRegion: {
    fontSize: SIZES.body3,
    color: COLORS.gray,
    marginBottom: 8,
    textAlign: 'right',
  },
  deliveryInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SIZES.base,
    marginTop: 4,
  },
  infoText: {
    fontSize: SIZES.caption,
    color: COLORS.text,
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SIZES.padding * 2,
  },
  emptyText: {
    fontSize: SIZES.body2,
    color: COLORS.gray,
    marginTop: SIZES.base,
    textAlign: 'center',
  },
});

export default VillagePicker;
