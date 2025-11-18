import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

const SettingsScreen = () => {
  const [settings, setSettings] = useState({
    newOrders: true,
    supportMessages: true,
    earningsUpdates: false,
    sound: true,
    vibration: true,
    alwaysTrackLocation: true,
    locationAccuracy: 'high', // high, medium, low
    backgroundLocation: true,
    language: 'ar',
    darkMode: false,
    passwordChange: false,
    accountDeletion: false,
  });

  const toggleSetting = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const changeLocationAccuracy = (accuracy) => {
    setSettings(prev => ({
      ...prev,
      locationAccuracy: accuracy
    }));
  };

  const changeLanguage = () => {
    setSettings(prev => ({
      ...prev,
      language: prev.language === 'ar' ? 'en' : 'ar'
    }));
  };

  const handlePasswordChange = () => {
    Alert.alert('تغيير كلمة المرور', 'سيتم توجيهك إلى شاشة تغيير كلمة المرور');
  };

  const handleAccountDeletion = () => {
    Alert.alert(
      'حذف الحساب',
      'هل أنت متأكد من رغبتك في حذف حسابك؟ لا يمكن التراجع عن هذا الإجراء.',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'حذف الحساب', style: 'destructive' }
      ]
    );
  };

  const renderSection = (title, children) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const renderSettingItem = (icon, title, value, onToggle, type = 'switch') => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onToggle}
      disabled={type !== 'switch'}
    >
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={20} color={COLORS.primary} />
      </View>
      <Text style={styles.settingText}>{title}</Text>
      {type === 'switch' ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: COLORS.border, true: COLORS.primary }}
          thumbColor={value ? 'white' : 'white'}
        />
      ) : (
        <Text style={styles.settingValue}>{value}</Text>
      )}
    </TouchableOpacity>
  );

  const renderRadioOption = (label, isSelected, onPress) => (
    <TouchableOpacity style={styles.radioOption} onPress={onPress}>
      <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
        {isSelected && <View style={styles.radioInnerCircle} />}
      </View>
      <Text style={styles.radioLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Notifications Section */}
      {renderSection('الإشعارات', (
        <View>
          {renderSettingItem('cube', 'طلبات جديدة', settings.newOrders, () => toggleSetting('newOrders'))}
          {renderSettingItem('chatbubbles', 'رسائل من الدعم', settings.supportMessages, () => toggleSetting('supportMessages'))}
          {renderSettingItem('cash', 'تحديثات الأرباح', settings.earningsUpdates, () => toggleSetting('earningsUpdates'))}
          {renderSettingItem('volume-high', 'الصوت', settings.sound, () => toggleSetting('sound'))}
          {renderSettingItem('notifications', 'الاهتزاز', settings.vibration, () => toggleSetting('vibration'))}
        </View>
      ))}

      {/* Location Section */}
      {renderSection('الموقع', (
        <View>
          {renderSettingItem('location', 'تتبع الموقع دائماً', settings.alwaysTrackLocation, () => toggleSetting('alwaysTrackLocation'))}
          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Ionicons name="options" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.settingText}>دقة الموقع</Text>
            <View style={styles.radioGroup}>
              {renderRadioOption('عالية', settings.locationAccuracy === 'high', () => changeLocationAccuracy('high'))}
              {renderRadioOption('متوسطة', settings.locationAccuracy === 'medium', () => changeLocationAccuracy('medium'))}
              {renderRadioOption('منخفضة', settings.locationAccuracy === 'low', () => changeLocationAccuracy('low'))}
            </View>
          </View>
          {renderSettingItem('sync', 'تحديث الموقع في الخلفية', settings.backgroundLocation, () => toggleSetting('backgroundLocation'))}
        </View>
      ))}

      {/* App Section */}
      {renderSection('التطبيق', (
        <View>
          <TouchableOpacity style={styles.settingItem} onPress={changeLanguage}>
            <View style={styles.settingIcon}>
              <Ionicons name="language" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.settingText}>اللغة</Text>
            <Text style={styles.settingValue}>{settings.language === 'ar' ? 'العربية' : 'English'}</Text>
          </TouchableOpacity>
          {renderSettingItem('moon', 'الوضع الليلي', settings.darkMode, () => toggleSetting('darkMode'))}
        </View>
      ))}

      {/* Account Section */}
      {renderSection('الحساب', (
        <View>
          <TouchableOpacity style={styles.settingItem} onPress={handlePasswordChange}>
            <View style={styles.settingIcon}>
              <Ionicons name="lock-closed" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.settingText}>تغيير كلمة المرور</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem} onPress={handleAccountDeletion}>
            <View style={styles.settingIcon}>
              <Ionicons name="trash" size={20} color={COLORS.danger} />
            </View>
            <Text style={[styles.settingText, { color: COLORS.danger }]}>حذف الحساب</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
 section: {
    backgroundColor: COLORS.card,
    margin: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
 sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    padding: 15,
    paddingBottom: 10,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  settingItemLast: {
    borderBottomWidth: 0,
  },
  settingIcon: {
    width: 30,
    alignItems: 'center',
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  settingValue: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  radioGroup: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
  },
  radioCircleSelected: {
    borderColor: COLORS.primary,
  },
  radioInnerCircle: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
 radioLabel: {
    fontSize: 14,
    color: COLORS.text,
  },
});

export default SettingsScreen;