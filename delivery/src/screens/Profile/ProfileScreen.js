import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import { useDriverStore } from '../../store/driverStore';
import { COLORS } from '../../constants/colors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { driver: authDriver, logout } = useAuthStore();
  const { currentDriver } = useDriverStore();

  const driver = currentDriver || authDriver;

  const handleLogout = () => {
    Alert.alert(
      'تسجيل الخروج',
      'هل أنت متأكد من رغبتك في تسجيل الخروج؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'تسجيل الخروج', style: 'destructive', onPress: logout }
      ]
    );
   };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return 'checkmark-circle';
      case 'pending':
        return 'time';
      case 'rejected':
        return 'close-circle';
      default:
        return 'help-circle';
    }
   };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return COLORS.success;
      case 'pending':
        return COLORS.warning;
      case 'rejected':
        return COLORS.danger;
      default:
        return COLORS.textSecondary;
    }
  };

  const options = [
    { title: 'تعديل الملف الشخصي', icon: 'person', action: () => navigation.navigate('Settings') },
    { title: 'المستندات', icon: 'document', action: () => {} },
    { title: 'الإعدادات', icon: 'settings', action: () => navigation.navigate('Settings') },
    { title: 'المساعدة والدعم', icon: 'help-circle', action: () => Alert.alert('الدعم', 'للتواصل مع الدعم: support@delivery.com') },
    { title: 'الشروط والأحكام', icon: 'document-text', action: () => {} },
    { title: 'تسجيل الخروج', icon: 'log-out', action: handleLogout },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.avatarContainer}>
          <Image source={{ uri: driver?.avatar || 'https://via.placeholder.com/100' }} style={styles.avatar} />
          <View style={styles.cameraIcon}>
            <Ionicons name="camera" size={20} color="white" />
          </View>
        </TouchableOpacity>
        <Text style={styles.name}>{driver?.name || 'السائق'}</Text>
        <Text style={styles.phone}>{driver?.phone || ''}</Text>
        
        <View style={styles.verificationContainer}>
          <Ionicons
            name={getStatusIcon(driver?.verificationStatus || 'pending')}
            size={16}
            color={getStatusColor(driver?.verificationStatus || 'pending')}
          />
          <Text style={[styles.verificationText, { color: getStatusColor(driver?.verificationStatus || 'pending') }]}>
            {driver?.verificationStatus === 'approved' ? 'مفعل' :
             driver?.verificationStatus === 'pending' ? 'قيد المراجعة' : 'مرفوض'}
          </Text>
        </View>
      </View>

      {/* Rating Section */}
      <View style={styles.ratingSection}>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={32} color={COLORS.warning} />
          <Text style={styles.ratingText}>{driver?.rating || '0.0'}</Text>
        </View>
        <Text style={styles.ratingLabel}>عدد التقييمات: {driver?.totalOrders || 0}</Text>
      </View>

      {/* Vehicle Info Card */}
      <View style={styles.vehicleCard}>
        <View style={styles.vehicleHeader}>
          <MaterialCommunityIcons
            name={driver?.vehicleType === 'motorcycle' ? 'motorbike' :
                  driver?.vehicleType === 'car' ? 'car' :
                  driver?.vehicleType === 'tuktuk' ? 'cart' : 'car'}
            size={24}
            color={COLORS.primary}
          />
          <Text style={styles.vehicleTitle}>معلومات المركبة</Text>
          <TouchableOpacity onPress={() => {}}>
            <Text style={styles.editText}>تعديل</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.vehicleDetails}>
          <Text style={styles.vehicleDetail}>
            النوع: {driver?.vehicleType === 'motorcycle' ? 'موتوسيكل' :
                    driver?.vehicleType === 'car' ? 'سيارة' :
                    driver?.vehicleType === 'tuktuk' ? 'توك توك' : 'غير محدد'}
          </Text>
          <Text style={styles.vehicleDetail}>رقم اللوحة: {driver?.vehicleNumber || 'غير محدد'}</Text>
        </View>
      </View>

      {/* Statistics Grid */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{driver?.totalOrders || 0}</Text>
          <Text style={styles.statLabel}>إجمالي الطلبات</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>85%</Text>
          <Text style={styles.statLabel}>معدل القبول</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>95%</Text>
          <Text style={styles.statLabel}>معدل الإنجاز</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>5%</Text>
          <Text style={styles.statLabel}>معدل الإلغاء</Text>
        </View>
      </View>

      {/* Options List */}
      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.optionItem}
            onPress={option.action}
          >
            <View style={styles.optionIcon}>
              <Ionicons name={option.icon} size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.optionText}>{option.title}</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.card,
    alignItems: 'center',
    padding: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5,
  },
  phone: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  verificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verificationText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 5,
  },
  ratingSection: {
    backgroundColor: COLORS.card,
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  ratingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.warning,
    marginRight: 10,
  },
  ratingLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  vehicleCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    padding: 15,
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  vehicleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
  },
  editText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  vehicleDetails: {
    marginLeft: 30,
  },
  vehicleDetail: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 15,
    marginBottom: 15,
  },
 statItem: {
    flex: 1,
    minWidth: '50%',
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: COLORS.card,
    margin: 5,
    borderRadius: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 5,
  },
  optionsContainer: {
    backgroundColor: COLORS.card,
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  optionItemLast: {
    borderBottomWidth: 0,
  },
  optionIcon: {
    width: 30,
    alignItems: 'center',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
});

export default ProfileScreen;